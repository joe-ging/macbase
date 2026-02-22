# <img src="docs/logo.png" width="48" height="48" align="center" /> macbase

**The ChessBase alternative Mac users have been waiting for.**

Built natively for macOS, **macbase** is a local-first chess analysis platform. No subscriptions, no proprietary database formats, and no Windows emulation required. Just deep analysis and world-class game data, 100% on your Mac.

[**Official Download & Storefront**](https://joe-ging.github.io/macbase-app/) • [**Landing Page**](https://joe-ging.github.io/macbase-app/) • [**Star on GitHub**](https://github.com/joe-ging/macbase)

---

## 🌎 Open Core & Community

Macbase follows an **Open Core** model. The repository you see here contains the **Community Core**—the foundational engine, database architecture, and native macOS desktop environment. 

We believe professional tools should be accessible to everyone, which is why the core is open source. To sustain development, proprietary features (like advanced tactical arrows, professional insights, and the TWIC auto-sync service) are part of the **Pro Beta** distribution.

---

## 🌟 Support the Project (Supporters Wall)

We want to celebrate our early community! 

**The Incentive:** Whomever stars this project on GitHub will have their handle added to our **Supporters Wall** in the next release. If you've contributed to the project's visibility, we want you to be part of our history.

[**⭐ Star this Repo now**](https://github.com/joe-ging/macbase)

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

---

## 🚀 Installation (How to get the App)

Because we are in a limited Beta launch (Free for the first 100 users), we distribute the app through our official storefront to ensure you receive the latest **Pro Beta** features and updates.

1. **Visit** the [Official Storefront](https://joe-ging.github.io/macbase-app/).
2. **Claim your copy** by providing your email (to receive your unique download link and future beta updates).
3. **Download** the `macbase.dmg`.
4. **Move** the `macbase` app to your **Applications** folder.
5. **Open:** Since the app is currently in Beta and unsigned, you must **Right-click** the app and select **Open** for the first run.

---

## 🛠️ Development Setup

If you want to contribute to the Community Core or build from source:

### Prerequisites
- Python 3.12+
- Node.js 20+
- [Stockfish](https://stockfishchess.org/download/) (Expected at system level)

### Steps
1. **Clone the Repo:**
   ```bash
   git clone https://github.com/joe-ging/macbase.git
   cd macbase
   ```
2. **Setup:** Run `./toggle_pro.py core` to ensure you are in the public build state.
3. **Backend:** Install requirements in `backend/requirements.txt` and run `main.py`.
4. **Frontend:** Run `npm install` and `npm run dev` in the `frontend` directory.

---

## 🚩 Feedback & Bug Reports

Found a bug? Have a feature request? Please use our **Launch Feedback Form** to help us improve before the official Monday release:

👉 [**Report an Issue / Give Feedback**](YOUR_GOOGLE_FORM_LINK)

---

## 🙏 Credits

- **Game Data:** Provided by [The Week in Chess (TWIC)](https://theweekinchess.com/) — Support them via [donation](https://theweekinchess.com/twic).
- **Engine:** [Stockfish Chess](https://stockfishchess.org/)
- **Built with:** FastAPI, React, SQLite.

## 📄 License
MIT © [joe-ging](https://github.com/joe-ging)
