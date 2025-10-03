# 😎Pro Pilot

## ✨Demo Images

## 🧲Tech Stack

 - Python+FastAPI – Backend framework for API routing, authentication, and file uploading (PDFs/audio). Also manages dividing transcripts into chunks for LLM processing.
 - Node.js – Can be leveraged for speech-to-text / transcription pipelines (e.g., Whisper.js, Deepgram SDK, or AssemblyAI clients). This is only needed if you’re actually handling audio/video transcription outside Python.
 - React(with CRACO) – Frontend library to manage user interaction, prompt chaining, document Q&A, and rendering LLM outputs dynamically.
 - Tailwind CSS+Radix UI – UI layer for fast, responsive, and accessible frontend design. (Not an LLM — but it makes your app look polished).
 - MongoDB(via Motor) – Database to store user accounts, uploaded documents, summaries, chat history, etc.
 - Google Generative AI(Gemini API) – Core AI engine used for generating summaries, Q&A, and multi-language responses.

## 🌀Workflow

## 🌊Run on your System

 **Step1:** git clone https://github.com/V-inaya-K/Pro-Pilot-for-Nasa.git<br />
 **Step2:** Open two seprate terminals<br />
 **Step3:** Create .env files with your Api keys in project root.<br />
 **Step4:** MongoDb and Google GenAI API in frontend/.env<br />
 **Step5:** React API in backend/.env<br />
 **Step6:** COMMANDS: cd frontend => npm install => npm start<br />
 **Step7:** COMMANDS: cd backend => pip install -r requirements.txt => python -m uvicorn server:app --reload
 
