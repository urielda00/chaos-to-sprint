# Chaos to Sprint 🚀

**Chaos to Sprint** is an AI-powered meeting transcript analyzer that transforms messy, unformatted transcripts from Zoom, Google Meet, and Microsoft Teams into structured, execution-ready sprint plans.

Say goodbye to manual meeting summaries - simply drop your transcript and get actionable tasks, assignees, and timelines instantly.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios - deployed on Netlify
- **Backend:** FastAPI, Python, OpenAI API, Pydantic, Uvicorn - deployed on Render
- **AI / LLM:** OpenAI GPT-4o-mini with structured prompt engineering for reliable JSON outputs

---

## ✨ Key Features

- **Smart Task Extraction:** Automatically identifies action items from unstructured meeting transcripts.
- **Assignee & Timeline Mapping:** Detects who needs to do what and by when, based on meeting context.
- **Structured Output:** Generates clean, copy-pasteable Markdown or ready-to-use task lists.
- **AI-Powered Sprint Planning:** Converts discussion chaos into execution-ready sprint plans.
- **Full-Stack Separation:** Modern decoupled architecture with a fast async Python backend and a responsive React frontend.

---

## 📂 Project Structure

```txt
chaos-to-sprint/
  ├── frontend/   # React + Vite + Tailwind - Netlify
  └── backend/    # FastAPI + OpenAI - Render
```

---

## 🚀 Local Setup & Installation

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

On macOS / Linux:

```bash
source .venv/bin/activate
```

On Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:

```bash
cp .env.example .env
```

Then open `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_actual_key
OPENAI_MODEL=gpt-4o-mini
FRONTEND_ORIGIN=http://localhost:5173
```

Run the development server:

```bash
uvicorn app.main:app --reload --port 8000
```

Local backend:

```txt
http://localhost:8000
```

---

### Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Make sure `VITE_API_BASE_URL` points to the local backend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Local frontend:

```txt
http://localhost:5173
```

---

## 🌐 Deployment Configuration

### Render - Backend

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Environment variables:

```env
OPENAI_API_KEY=your_actual_key
OPENAI_MODEL=gpt-4o-mini
FRONTEND_ORIGIN=https://your-netlify-site.netlify.app
```

---

### Netlify - Frontend

- **Base Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `frontend/dist`

Environment variables:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

---

## 📌 Notes

This project focuses on transforming unstructured meeting text into a clear execution plan using a structured AI pipeline.

The backend handles transcript analysis and structured output generation, while the frontend provides a clean and simple interface for users to submit transcripts and receive sprint-ready results.