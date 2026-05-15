import json
import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq Client Initialization
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY or GROQ_API_KEY == "gsk_your_key_here":
    print("WARNING: GROQ_API_KEY is not set in .env file or is the default placeholder")
    
# Initialize client even if key is missing (will fail on request if still missing)
client = Groq(api_key=GROQ_API_KEY if GROQ_API_KEY else "dummy_key")

# Load Bias Data
def get_bias_data():
    # Use absolute path based on this file's location
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, "data", "bias_data.json")
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading bias data from {path}: {e}")
        return {}

class JDRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "BiasFree AI Backend is running!"}

@app.post("/analyze")
async def analyze(request: JDRequest):
    if not request.text:
        return {
            "score": 100, 
            "issues": [], 
            "breakdown": {"Gender Bias": 0, "Age Bias": 0, "Cultural Bias": 0, "Neutral": 100}, 
            "impact": "Fair and inclusive.", 
            "tone": "Neutral"
        }
        
    text = request.text.lower()
    bias_db = get_bias_data()
    findings = []
    
    category_counts = {"Gender Bias": 0, "Age Bias": 0, "Cultural Bias": 0}
    
    for category, terms in bias_db.items():
        cat_name = category.replace("_", " ").title()
        for word, sug in terms.items():
            pattern = rf'\b{re.escape(word.lower())}\b'
            if re.search(pattern, text):
                findings.append({
                    "word": word,
                    "category": cat_name,
                    "suggestion": sug
                })
                if cat_name in category_counts:
                    category_counts[cat_name] += 1
                else:
                    category_counts[cat_name] = 1
    
    score = max(0, 100 - (len(findings) * 10))
    total_issues = len(findings)
    breakdown = {"Gender Bias": 0, "Age Bias": 0, "Cultural Bias": 0, "Neutral": 100}
    
    impact = "Fair and inclusive. Likely to attract a diverse applicant pool."
    tone = "Professional & Neutral"
    
    if total_issues > 0:
        for cat in category_counts:
            breakdown[cat] = int((category_counts[cat] / total_issues) * (100 - score))
        breakdown["Neutral"] = score
        
        impact_statements = []
        if category_counts.get("Gender Bias", 0) > 0:
            impact_statements.append("discourage female candidates")
            tone = "Overly Aggressive / Masculine-coded"
        elif category_counts.get("Age Bias", 0) > 0:
            tone = "Informal / Youth-biased"
            
        if category_counts.get("Age Bias", 0) > 0:
            impact_statements.append("exclude senior applicants")
        if category_counts.get("Cultural Bias", 0) > 0:
            impact_statements.append("alienate non-native speakers")
            
        if impact_statements:
            impact = "This JD may " + " and ".join(impact_statements) + "."
            
    return {"score": score, "issues": findings, "breakdown": breakdown, "impact": impact, "tone": tone}

@app.post("/rewrite")
async def rewrite(request: JDRequest):
    if not request.text:
        return {"rewritten_text": ""}
        
    if not GROQ_API_KEY or GROQ_API_KEY == "gsk_your_key_here":
        raise HTTPException(
            status_code=500, 
            detail="Groq API Key not configured. Please add your GROQ_API_KEY to the .env file."
        )
        
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a DEI (Diversity, Equity, and Inclusion) expert. Rewrite the following job description to be more inclusive, gender-neutral, and professional while maintaining all core technical requirements. Only return the rewritten text in plain text format without any markdown formatting (do not use asterisks ** for bolding)."
                },
                {"role": "user", "content": request.text}
            ],
            temperature=0.7,
            max_tokens=2048
        )
        rewritten = response.choices[0].message.content
            
        return {"rewritten_text": rewritten}
    except Exception as e:
        print(f"Error in Groq rewrite: {e}")
        raise HTTPException(status_code=500, detail=f"AI Rewrite failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
