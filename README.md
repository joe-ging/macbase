# <img src="docs/logo.png" width="48" height="48" align="center" /> macbase

**Stop procrastinating on your OTB analysis with the most beautiful, native chess studio for Mac.**

Macbase provides a distraction-free, world-class interface for analyzing the tournament games you've been putting off, helping you turn "logged games" into "learned lessons" so you can get back to the OTB board stronger.

[**Download macbase Pro**](https://joe-ging.github.io/macbase-app/) • [**Star on GitHub**](https://github.com/joe-ging/macbase)

---

### 🚨 **CRITICAL: CLONING VS. DOWNLOADING**
**This repository contains the Community Core only.** 

Cloning this repo allows you to see the architecture and contribute to the foundational engine. However, to get the **full professional experience**—including the AI Coach "Neural Link," automated TWIC synchronization, and professional Tactical Insights—you **must** download the official DMG distribution.

👉 [**Download the Full Pro Experience here**](https://joe-ging.github.io/macbase-app/)

---

### 📊 **COMMUNITY MOMENTUM**
In the first **8 hours** of our silent community preview:
- 📈 **300+ Total Clones**
- 👤 **141 Unique Developers/Players** cloned this from their terminals.

The demand for a native Mac chess studio is real. **If you're using the code, please leave a ⭐ Star.** It helps us break the "New Project" stigma and fuels the AI Coach update!

---

## 🌎 Open Core Model
Macbase follows an **Open Core** model. We believe professional technical tools should have a transparent foundation. 
- **The Community Core (This Repo):** The foundational chess engine, database architecture, and native macOS desktop framework. 
- **The Pro Distribution:** Proprietary features like the AI Coach, cloud-sync repertoire, and professional game insights.

---

## 🖼️ Feature Showcase

### 1. Command Center (Dashboard)
Stay current with the world of elite chess. Import the latest [TWIC](https://theweekinchess.com) issues with a single click and monitor your database growth.
<p align="center">
  <img src="docs/screenshots/dashboard.png" width="800" alt="macbase dashboard" />
</p>

### 2. Deep Analysis & Annotation
Designed for the serious player. Draw tactical arrows, highlight focus squares, and run Stockfish with Multi-PV directly on your Mac. No cloud lag, no browser limits.
<p align="center">
  <img src="docs/screenshots/analysis1.png" width="800" alt="chess analysis" />
</p>

### 3. Intelligence Database
Browse millions of games with lightning speed. Filter by player, rating, opening (ECO), or tournament. Open any game into analysis mode instantly.
<p align="center">
  <img src="docs/screenshots/database.png" width="800" alt="game database" />
</p>

### 4. Professional Insights (Pro)
Identify your blind spots. Our professional engine analyzes your local games to find tactical patterns and opening weaknesses you didn't know you had.
<p align="center">
  <img src="docs/screenshots/insight1.png" width="800" alt="chess insights" />
</p>

### 5. Repertoire Architect (Pro)
Build and practice your opening repertoire with spaced-repetition flashcards. Track your win rates across specific variations and prepare for your next tournament opponent.
<p align="center">
  <img src="docs/screenshots/repertoire1.png" width="400" alt="opening repertoire" />
  <img src="docs/screenshots/repertoire2.png" width="400" alt="repertoire flashcards" />
</p>

---

## 🌟 Support the Project (Supporters Wall)
We want to celebrate our early community! 

**The Incentive:** Whomever stars this project on GitHub **during the launch week** will have their handle added to our **Supporters Wall** in the next release. 

[**⭐ Star this Repo now to join the Wall**](https://github.com/joe-ging/macbase)

---

## 🚀 Installation (How to get the App)

Because we are in a limited Beta launch (**Free for the first 100 users**), we distribute the app through our official storefront to ensure you receive the full Pro Beta experience.

1. **Visit** the [Official Storefront](https://joe-ging.github.io/macbase-app/).
2. **Claim your copy** by providing your email (to receive your download link).
3. **Download** the `macbase.dmg`.
4. **First Run:** Since the app is currently in Beta and unsigned, you must **Right-click** the app and select **Open** for the first run.

---

## 🛠️ Development Setup

If you want to contribute to the Community Core or build from source:

### Prerequisites
- Python 3.12+
- Node.js 20+
- [Stockfish](https://stockfishchess.org/download/) (Expected at system level)

### Steps
1. **Clone & Setup:**
   ```bash
   git clone https://github.com/joe-ging/macbase.git
   cd macbase
   ./toggle_pro.py core
   ```
2. **Backend:** Install requirements in `backend/requirements.txt` and run `main.py`.
3. **Frontend:** Run `npm install` and `npm run dev` in the `frontend` directory.

---

## 🚩 Feedback & Bug Reports
Found a bug? Use our Launch Feedback Form:
👉 [**Report an Issue / Give Feedback**](https://tally.so/r/jayppa)

---

## 🙏 Credits
- **Game Data:** [The Week in Chess (TWIC)](https://theweekinchess.com/)
- **Engine:** [Stockfish Chess](https://stockfishchess.org/)
- **Built with:** FastAPI, React, SQLite.

## 📄 License
MIT © [joe-ging](https://github.com/joe-ging)
