# Chaos to Sprint 🚀

**Chaos to Sprint** is an AI-powered meeting transcript analyzer that transforms messy, unformatted transcripts from Zoom, Google Meet, and Microsoft Teams into structured, execution-ready sprint plans. 

Say goodbye to manual meeting summaries—simply drop your transcript and get actionable tasks, assignees, and timelines instantly.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios (Deployed on Netlify)
- **Backend:** FastAPI (Python), OpenAI API, Pydantic, Uvicorn (Deployed on Render)
- **AI/LLM:** OpenAI GPT-4o-mini with structured prompt engineering for reliable JSON outputs.

---

## ✨ Key Features

- **Smart Task Extraction:** Automatically identifies action items from unstructured text.
- **Assignee & Timeline Mapping:** Detects *who* needs to do *what* and by *when* based on context.
- **Structured Output:** Generates clean, copy-pasteable Markdown or ready-to-use task lists.
- **Full-Stack Separation:** Modern decoupled architecture with a fast, async Python backend and a responsive React frontend.

---

## 📂 Project Structure

```txt
chaos-to-sprint/
  ├── frontend/   # React + Vite + Tailwind (Netlify)
  └── backend/    # FastAPI + OpenAI (Render)