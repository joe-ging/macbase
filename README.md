# Grandmaster Mac 🎯

A full-stack chess analysis platform for macOS, inspired by ChessBase.

## Features
- **Stockfish Engine Integration** — Real-time UCI analysis with MultiPV=3
- **TWIC Import** — Download and parse The Week in Chess databases
- **ECO Opening Codes** — Automatic opening recognition (400+ openings)
- **Interactive Analysis Board** — Drag & drop, arrow drawing, move navigation
- **Repertoire Management** — Organize your opening preparation
- **Player Insights** — Statistical analysis by ELO range

## Tech Stack
- **Backend:** Python, FastAPI, Stockfish UCI, SQLite
- **Frontend:** React 19, Vite, chess.js
- **Engine:** Stockfish (via WebSocket)

## Getting Started

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## License
MIT

