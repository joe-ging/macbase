# <img src="docs/logo.png" width="48" height="48" align="center" /> macbase

**The ChessBase alternative Mac users have been waiting for.**

Built natively for macOS, **macbase** is a local-first chess analysis platform. No subscriptions, no proprietary database formats, and no Windows emulation required. Just deep analysis and world-class game data, 100% on your Mac.

[**Download for Mac v0.1.0-beta**](https://github.com/joe-ging/macbase/releases/latest) • [**Landing Page**](https://joe-ging.github.io/macbase/)

---

## 🖼️ Showcase

### Deep Analysis & Annotation
Draw green/pink arrows, highlight squares, and run Stockfish with Multi-PV directly on your Mac.
<p align="center">
  <img src="docs/screenshots/analysis1.png" width="800" />
</p>

### Intelligence Database
Import thousands of real OTB tournament games from [The Week in Chess (TWIC)](https://theweekinchess.com) with one click.
<p align="center">
  <img src="docs/screenshots/database.png" width="800" />
</p>

### Repertoire & Flashcards
Clip critical positions, add move-specific notes, and organize your prep into custom folders.
<p align="center">
  <img src="docs/screenshots/repertoire2.png" width="800" />
</p>

### Tournament Insights
See what openings are winning at your specific FIDE rating bracket (1800, 2000, 2200+).
<p align="center">
  <img src="docs/screenshots/insight1.png" width="800" />
</p>

---

## ✨ Features

- **Built for Mac** — 100% native Apple Silicon (M1/M2/M3) and Intel support. No Wine, no Parallels.
- **TWIC Integration** — One-click access to the world’s most comprehensive free tournament database since 1994.
- **Deep Stockfish Analysis** — Real-time engine evaluation, evaluation bar, and top engine lines.
- **Native Visual Annotations** — Draw arrows and circles on the board to visualize your ideas.
- **Standard PGN Format** — Your data belongs to you. No vendor lock-in; import and export everything as universal PGN.
- **Local-First Architecture** — All your games, analysis, and repertoires are stored locally on your device in a fast SQLite database.
- **Opening Recognition** — Built-in ECO opening recognition with a comprehensive library of 500+ opening variations.

---

## 🚀 Installation

1. **Download** the latest `macbase.dmg` from the [Releases](https://github.com/joe-ging/macbase/releases) page.
2. **Move** the `macbase` app to your **Applications** folder.
3. **Open:** Since the app is currently in Beta and unsigned, you must **Right-click** the app and select **Open** for the first run.
4. **Enjoy:** The app will stay in your dock and automatically open your browser to `localhost:8000`.

---

## 🛠️ Development Setup

If you want to build macbase from source:

### Prerequisites
- Python 3.12+
- Node.js 20+
- [Stockfish](https://stockfishchess.org/download/) (The app expects the binary to be available on your system if you are running from source)

### Steps
1. **Clone the Repo:**
   ```bash
   git clone https://github.com/joe-ging/macbase.git
   cd macbase
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🙏 Credits

- **Game Data:** Provided by [The Week in Chess (TWIC)](https://theweekinchess.com/) — Support them via [donation](https://theweekinchess.com/twic).
- **Engine:** [Stockfish Chess](https://stockfishchess.org/)
- **Built with:** FastAPI, React, SQLite, and PyInstaller.

## 📄 License

MIT © [joe-ging](https://github.com/joe-ging)
