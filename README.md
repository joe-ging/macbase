# <img src="docs/logo.png" width="48" height="48" align="center" /> macbase

**Stop procrastinating on your OTB analysis with the most beautiful, native chess studio for Mac.**

**[简体中文](README_ZH.md)** • English

Macbase provides a distraction-free, world-class interface for analyzing the tournament games you've been putting off, helping you turn "logged games" into "learned lessons" so you can get back to the OTB board stronger.

[**Download macbase Pro**](https://joe-ging.github.io/macbase-app/) • [**Star on GitHub**](https://github.com/joe-ging/macbase)

---

### 🚨 **CRITICAL: CLONING VS. DOWNLOADING**
**This repository contains the Community Core only.** 

Cloning this repo allows you to see the architecture and contribute to the foundational engine. However, to get the **full professional experience**—including the AI Coach "Neural Link," automated TWIC synchronization, and professional Tactical Insights—you **must** download the official DMG distribution.

👉 [**Download the Full Pro Experience here**](https://joe-ging.github.io/macbase-app/)

---

### 📊 **COMMUNITY MOMENTUM (As of Feb 25, 2026)**
The demand for a native Mac chess studio is real. In our silent community preview:
- 📈 **478 Total Clones** in the last 14 days.
- 👤 **202 Unique Developers/Players** have deployed this from their terminals.
- ⭐ **0 Stars... so far!** 

**The Hidden Demand:** If you are one of the 200+ users who cloned the repo but haven't starred it yet—please leave a ⭐ Star! It's the only way we can bypass the "New Project" stigma and hit our next milestone to unlock the AI Coach.

---

## 🌟 Support the Project (Supporters Wall)
We want to celebrate our early community! 

**The Incentive:** Whomever stars this project on GitHub **during the launch week** will have their handle added to our **Supporters Wall** in the next release. 

---

### 🚀 **MILESTONE: 15 STARS UNLOCKS 'NEURAL LINK'**
Once this project hits **15 Stars**, we will begin incorporating the **Claude-powered AI Coach** directly into the Macbase ecosystem.

**The Vision:**
Imagine finishing a blitz session on Lichess.org, then instantly receiving core improvement insights and tactical blindspot alerts pushed directly to your **macbase desktop** and your **WhatsApp/Telegram** via our Neural Link engine.

No more manual analysis. No more procrastinating. Just pure, automated growth.

[**⭐ Star this Repo now to push the roadmap forward**](https://github.com/joe-ging/macbase)

---

## 🌎 Open Core Model
Macbase follows an **Open Core** model. We believe professional technical tools should have a transparent foundation. 
- **The Community Core (This Repo):** The foundational chess engine, database architecture, and native macOS desktop framework. 
- **The Pro Distribution:** Proprietary features like the AI Coach, cloud-sync repertoire, and professional game insights.

---

## 🖼️ Feature Showcase (The Full Tour)

### 1. Unified Dashboard
Stay at the center of the chess world. Monitor your progress, track database size, and import the latest professional games with a single click.
<p align="center">
  <img src="docs/screenshots/dashboard1.png" width="400" />
  <img src="docs/screenshots/dashboard2.png" width="400" />
</p>

### 2. Live Analysis & Tactics
Native Multi-PV Stockfish 16.1 integration. Draw tactical arrows, highlight squares, and annotate games with professional clarity.
<p align="center">
  <img src="docs/screenshots/analysis1.png" width="266" />
  <img src="docs/screenshots/analysis2.png" width="266" />
  <img src="docs/screenshots/analysis3.png" width="266" />
</p>

### 3. Master Intelligence Database
Lightning-fast filtering of millions of games. Search by ECO code, player, rating, or year.
<p align="center">
  <img src="docs/screenshots/database1.png" width="266" />
  <img src="docs/screenshots/database2.png" width="266" />
  <img src="docs/screenshots/database3.png" width="266" />
</p>

### 4. Pro Insights & Blindspot Detection
Identify exactly where your game is breaking. Analyze your own PGNs to find recurring tactical themes and opening mistakes.
<p align="center">
  <img src="docs/screenshots/insight1.png" width="400" />
  <img src="docs/screenshots/insight2.png" width="400" />
</p>

### 5. Repertoire Architect & Flashcards
Build your white and black repertoire and practice it daily using our native spaced-repetition engine.
<p align="center">
  <img src="docs/screenshots/repertoire1.png" width="400" />
  <img src="docs/screenshots/repertoire2.png" width="400" />
</p>

---

## 🚀 Installation (How to get the App)

Because we are in a limited Beta launch (**Free for the first 100 users**), we distribute the app through our official storefront to ensure you receive the full Pro Beta experience.

### **1. Download & Move**
1. **Visit** the [Official Storefront](https://joe-ging.github.io/macbase-app/).
2. **Claim your copy** by providing your email (to receive your download link).
3. **Download** the `macbase.dmg`.
4. **Move** the `macbase` app to your **Applications** folder.

### **2. Bypassing macOS Gatekeeper (Critical Step)**
Since macbase is an independent indie project and currently unsigned, macOS will flag it as "blocked" or "malware". Use one of the two methods below:

#### **Method A: The Classic Shortcut (Legacy macOS)**
- **Right-Click (or Control-Click)** the `macbase` icon in your Applications folder and select **Open**.
- **Note:** This method is largely obsolete in macOS 15+ (Sequoia) and 16+ (Tahoe).

#### **Method B: System Settings (If Method A fails)**
1. Double-click the app. When the "Blocked" warning appears, click **OK**.
2. **Immediately** open **System Settings** ➡️ **Privacy & Security** (the button only appears for 5 minutes after the failure).
3. Scroll down to the **Security** section and look for the **Open Anyway** button.
4. Enter your Mac password when prompted.

#### **Method C: The Sequoia/Tahoe Command Line Fix (Recommended)**
If the "Open Anyway" button does not appear (a known bug in Sequoia) or fails, open your **Terminal** and run:
```bash
sudo xattr -cr /Applications/macbase.app
```
This removes the quarantine flag and allows the app to run instantly.

#### **Method D: The DMG Recovery Fix (If the DMG won't open)**
On macOS Sequoia/Tahoe, sometimes the `.dmg` file itself refuses to mount even with "Anywhere" enabled. Use this command to force-mount:
```bash
hdiutil attach -noverify ~/Downloads/macbase.dmg
```

#### **Method E: Run from Source (The Unblockable Fallback)**
Since macbase is Open Core, you can always bypass binary restrictions by running the source code directly:
1. Clone this repository.
2. Follow the **Development Setup** instructions below.
3. **Why:** macOS never blocks interpreted code (Python/Node.js).

---

## 🛠️ Development Setup

If you want to contribute to the Community Core or build from source:

### Prerequisites
- Python 3.12+
- Node.js 20+
- [Stockfish](https://stockfishchess.org/download/)

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
