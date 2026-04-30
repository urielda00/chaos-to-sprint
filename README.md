# Chaos to Sprint

AI meeting transcript analyzer that turns messy Zoom/Meet/Teams transcripts into a structured execution plan.

## Structure

```txt
chaos-to-sprint/
  frontend/   React + Vite + Tailwind, deploy to Netlify
  backend/    FastAPI + OpenAI, deploy to Render
```

## Local run

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# put your OPENAI_API_KEY in .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Local frontend: http://localhost:5173
Local backend: http://localhost:8000

## Deployment

### Render backend

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `OPENAI_API_KEY=your_key`
  - `OPENAI_MODEL=gpt-4.1-mini`
  - `FRONTEND_ORIGIN=https://your-netlify-site.netlify.app`

### Netlify frontend

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment variables:
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com`
