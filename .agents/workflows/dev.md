---
description: Start the backend and frontend development servers for local testing
---

# Dev Servers Workflow

## Purpose
Start both the backend (FastAPI) and frontend (Vite) dev servers so you can test the app locally in your browser.

## Steps

// turbo
1. Check if anything is already running on the required ports:
```bash
lsof -i :8000 2>/dev/null | head -5 && lsof -i :5173 2>/dev/null | head -5
echo "Port 8000 = Backend, Port 5173 = Frontend"
```

2. Start the backend server (FastAPI):
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/backend
python main.py
```
This runs on http://localhost:8000

3. Start the frontend server (Vite) in a separate terminal:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend
npm run dev
```
This runs on http://localhost:5173

4. The app should now be accessible at: **http://localhost:5173**

## Stopping Servers
- Press `Ctrl+C` in each terminal to stop the servers
- Or kill by port:
```bash
kill -9 $(lsof -ti:8000) 2>/dev/null
kill -9 $(lsof -ti:5173) 2>/dev/null
```

## Common Issues
- **Port already in use:** Kill the process on that port (see stopping section above)
- **Module not found (backend):** Run `cd backend && pip install -r requirements.txt`
- **Module not found (frontend):** Run `cd frontend && npm install`
- **Stockfish not found:** Run `brew install stockfish`
