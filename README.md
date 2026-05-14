# 🚀 BiasFree AI - Fairer Hiring with AI

![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![OpenAI](https://img.shields.io/badge/AI-OpenAI_GPT_4-412991?style=for-the-badge&logo=openai&logoColor=white)

**BiasFree AI** is an advanced NLP tool designed to detect and eliminate unconscious bias in Job Descriptions (JDs). It helps companies build diverse teams by ensuring their recruitment language is inclusive, fair, and professional.

## 🌟 The Problem & Solution
Often, job descriptions contain subtle gender, age, or cultural biases (e.g., using words like "rockstar," "digital native," or "native speaker") that discourage diverse candidates from applying.
**BiasFree AI solves this by:**
- Instantly detecting problematic keywords.
- Providing a real-time inclusivity score.
- Offering an AI-powered "Magic Fix" to automatically rewrite the JD into inclusive language.

## ✨ Key Features
- **Real-time Bias Detection:** Highlights Gender, Age, and Cultural bias instantly.
- **Inclusivity Scoring:** A dynamic 0-100 metric based on linguistic analysis.
- **AI-Powered Magic Fix:** One-click rewrite using GPT-4 to make JDs professional and neutral.
- **Data-Driven Logic:** Uses an extensible, fast JSON-based bias dictionary.

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons.
- **Backend:** FastAPI (Python), Uvicorn, OpenAI API.
- **Database/Data Store:** Extensible JSON mappings.

## 📂 Project Structure
```text
biasfree-ai/
├── backend/
│   ├── app/
│   │   └── main.py              # Main FastAPI application logic & API endpoints
│   ├── data/
│   │   └── bias_data.json       # JSON dictionary containing bias keywords & suggestions
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables (OpenAI API key)
├── frontend/
│   ├── app/                     
│   │   ├── globals.css          # Global Tailwind styles
│   │   ├── layout.tsx           # Next.js root layout
│   │   └── page.tsx             # Main React application UI
│   ├── tailwind.config.js       # Tailwind configuration
│   └── package.json             # Node.js dependencies
└── README.md
```

## 🏃‍♂️ Quick Start

### 1. Backend Setup
Navigate to the backend directory and install the dependencies:
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory and add your OpenAI API Key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
*The backend will be running on `http://localhost:8000`*

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
*The frontend will be running on `http://localhost:3000`*

## 📡 API Endpoints

### `POST /analyze`
Analyzes the text for biased keywords and returns an inclusivity score.
- **Payload:** `{"text": "We are looking for a rockstar developer..."}`
- **Response:**
  ```json
  {
    "score": 88,
    "issues": [
      {
        "word": "rockstar",
        "category": "Gender Bias",
        "suggestion": "high-performer"
      }
    ]
  }
  ```

### `POST /rewrite`
Uses OpenAI's GPT-4 to rewrite the provided text to be unbiased.
- **Payload:** `{"text": "We are looking for a rockstar developer..."}`
- **Response:**
  ```json
  {
    "rewritten_text": "We are looking for a high-performer developer..."
  }
  ```

## 🚀 Future Enhancements
- **Chrome Extension:** Integrate the tool directly into LinkedIn workflows for recruiters.
- **PDF/Word Parsing:** Allow users to upload JD documents directly for analysis.
- **Custom Dictionaries:** Let HR teams add company-specific blocked words.
