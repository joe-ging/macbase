# 🚀 Product Launch Plan

> **Working Name:** macbase
> **Status:** Pre-Launch Planning
> **Created:** Feb 21, 2026
> **Last Updated:** Feb 21, 2026
> **Target Platforms:** Multi-channel (see Launch Venues below)

---

## 0. Branding

**Working Name:** `macbase` (styled lowercase like macOS)

**Positioning:** Free/low-cost ChessBase alternative, built natively for Mac, local-first.

**Logo concept:** ♞ macbase — chess knight icon, "mac" in white, "base" in neon lime

**Status:** ✅ Code rebranded from "Grandmaster Mac" → "macbase" (Feb 21, 2026)

**⚠️ TODO: Finalize name before launch. Verify domain availability (macbase.app, macbase.dev, etc.)**

---

## 1. Launch Strategy: Multi-Channel (No-Gate First)

### Key insight

Product Hunt alone won't make or break this. As a first-time PH maker with no audience, realistic traction is 15-40 upvotes. The real play is **launching simultaneously on multiple no-gate platforms** and letting the chess community find you.

### Launch Venues (ordered by priority)

#### 🟢 Tier 1 — No gate, launch here first (Day 1)

| Platform | Barrier | Post Format | Audience |
|---|---|---|---|
| **Hacker News (Show HN)** | None | `Show HN: macbase – Free ChessBase alternative for Mac` | Tech-savvy builders, chess nerds |
| **Product Hunt** | None | Full listing with screenshots + video | Indie tool enthusiasts |
| **Indie Hackers** | Sign up | "Launched my product" post | Indie makers, bootstrappers |
| **MicroLaunch** | None | Free PH alternative | Indie makers |
| **Uneed.best** | None | Free launch directory | Product discovery |

#### 🟡 Tier 2 — Low gate, post here Day 2-3

| Platform | Barrier | Post Format | Audience |
|---|---|---|---|
| **r/SideProject** | Low/no karma | "I built this" post with screenshots | Makers who appreciate craftsmanship |
| **r/macapps** | ~10 karma | App showcase | Mac power users |
| **Chess.com forums** | Free account | Post in "Chess Software" | Active chess players |
| **Lichess forum** | Free account | Post in "General" | Open-source-friendly chess community |
| **X/Twitter** | None | Thread with demo GIF | Chess influencers, tech builders |

#### 🔴 Tier 3 — Higher gate, build up over 2-4 weeks

| Platform | Barrier | Post Format | Audience |
|---|---|---|---|
| **r/chess** | ~50-100 karma | "I built a free ChessBase for Mac" | 900K chess players (JACKPOT if it lands) |
| **YouTube** | Record video | 2-min demo walkthrough | Chess YouTube picks it up |

### Tagline candidates (≤60 chars)

- "Free chess analysis for Mac. No subscription. Ever."
- "Your chess studio. Local. Mac-native. Free."
- "The ChessBase Mac users have been waiting for."

### Pre-launch checklist

- [x] ~~Pick working product name~~ → **macbase**
- [x] ~~Remove Settings page / unnecessary features~~ → Done
- [x] ~~Rebrand all code references~~ → Done
- [ ] Build landing page (single page, stunning design)
- [ ] Create 60-second demo video
- [ ] Prepare 5 screenshots (Dashboard, Analysis, Database, Repertoire, Insights)
- [ ] Write maker comment / founder story for PH + HN
- [ ] Write tagline (≤60 characters)
- [ ] Package unsigned DMG
- [ ] Test download → install → first-use flow with 3+ beta testers
- [ ] Prepare posts for each Tier 1 + Tier 2 platform
- [ ] Start commenting on r/chess to build karma (parallel task)

---

## 2. Business Model: Phased Approach

### Your 3 Selling Points (validated by Margot)

1. **Built for Mac** — ChessBase is Windows-only. Mac users currently use Wine/Parallels or inferior web tools. No native Mac chess analysis app exists at this quality level.
2. **One-time cost** — ChessBase charges €199-499 for software + €50/year for Premium + €230 for Mega Database. That's €300-700+ to get started. We charge $0 (free) or $29 (one-time).
3. **Local-first** — All analysis, PGNs, and repertoires stored on the user's Mac. No cloud dependency. No account needed. Their data is their data.

### Competitive Pricing Landscape

| Product | Price | Platform | Model |
|---|---|---|---|
| ChessBase '26 Starter | €249.90 | Windows only | One-time + annual DB subscription |
| ChessBase '26 Mega | €349.90 | Windows only | One-time + annual DB subscription |
| ChessBase Premium Account | €49.90/year | Web | Subscription |
| En Croissant | Free | Cross-platform | Open source |
| HIARCS | $49.99 | Mac | One-time |
| Scid vs. PC | Free | Cross-platform | Open source |
| **Us (Free tier)** | **$0** | **Mac** | **Free** |
| **Us (Pro tier)** | **$29 one-time** | **Mac** | **One-time purchase** |

### Phase 1: Validation (Product Hunt Launch)

**Goal:** Validate demand. Get 200+ downloads. Collect feedback.

- **Price:** 100% free, unsigned DMG
- **All features unlocked** — no gating yet
- **Distribution:** GitHub Releases + landing page
- **Duration:** 4-8 weeks post-launch
- **Success metrics:**
  - 200+ downloads
  - 50+ daily active users (tracked via opt-in anonymous analytics)
  - 20+ pieces of feedback
  - Featured on Product Hunt (#1-5 of the day)

### Phase 2: Polish + Sign ($99 Apple Dev)

**Trigger:** Phase 1 success metrics met.

- Pay $99 for Apple Developer account
- Code-sign and notarize the app
- Smooth install experience (no right-click workaround)
- Add optional anonymous usage analytics (PostHog free tier)
- Fix top 5 feedback issues from Phase 1

### Phase 3: Monetize (Pro tier)

**Trigger:** 500+ downloads, clear demand for advanced features.

- **Free tier** (stays forever):
  - Stockfish analysis (depth ≤ 18)
  - Import up to 100 games
  - 1 repertoire folder
  - Basic opening recognition
  - Dashboard

- **Pro tier** ($29 one-time):
  - Unlimited analysis depth (up to 30)
  - Unlimited game imports + TWIC auto-sync
  - Unlimited repertoire folders + flashcard training
  - Advanced insights (opening trends, win rate by ECO)
  - Priority support
  - Future pro features included forever

- **Payment:** Gumroad or LemonSqueezy (handles payment, delivers license key)
- **License activation:** Simple key check on app launch, stored locally

### Phase 4: Growth (optional, if traction continues)

- Mac App Store listing ($99/year already paid)
- Database marketplace (users share/sell opening databases)
- Cloud sync (optional, paid add-on for backup)
- Multi-engine support (Leela Chess Zero)
- Windows/Linux versions via Tauri

---

## 3. Timeline: Fail-Fast Sprint (5 Days)

> **Pace:** 4 hours/day, one sprint per day
> **Launch target:** Day 5 (Feb 26, 2026 — Wednesday)
> **Philosophy:** Ship ugly, learn fast. Perfect is the enemy of launched.
> **Today's date:** Feb 21, 2026

### 5-Day Sprint Plan

```
DAY 1 — Fri Feb 21 (4 hrs) ✅ DONE
┌─────────────────────────────────────────────────────┐
│ ✅ Rebrand to macbase                               │
│ ✅ Remove Settings page + unnecessary features      │
│ ✅ Create launch plan                               │
│ ✅ Define business model + launch channels          │
│                                                     │
│ Result: App is clean, branded, plan is clear        │
└─────────────────────────────────────────────────────┘

DAY 2 — Sat Feb 22 (4 hrs)
┌─────────────────────────────────────────────────────┐
│ Hour 1:   Fix 4 dashboard bugs                      │
│ Hour 2-3: Build landing page (1 page, good enough)  │
│ Hour 4:   Package unsigned DMG + test install        │
│                                                     │
│ Result: Downloadable app + landing page live         │
└─────────────────────────────────────────────────────┘

DAY 3 — Sun Feb 23 (4 hrs)
┌─────────────────────────────────────────────────────┐
│ Hour 1:   Create GitHub repo + README w/ screenshots│
│ Hour 2:   Take 5 screenshots of the app             │
│ Hour 3:   Write HN post + PH listing + IH post      │
│ Hour 4:   Write maker story (your "why")            │
│                                                     │
│ Result: All launch content ready to post             │
└─────────────────────────────────────────────────────┘

DAY 4 — Mon Feb 24 (4 hrs)
┌─────────────────────────────────────────────────────┐
│ Hour 1:   Beta test — 1-2 friends install DMG       │
│ Hour 2:   Fix any showstopper bugs they find         │
│ Hour 3:   Record 60-sec demo (skip if takes too long)│
│ Hour 4:   Final review of all launch materials       │
│                                                     │
│ Result: Tested, polished, ready to ship              │
└─────────────────────────────────────────────────────┘

DAY 5 — Wed Feb 26 (4 hrs) 🚀 LAUNCH
┌─────────────────────────────────────────────────────┐
│ Morning:  Show HN + Product Hunt + Indie Hackers    │
│ Midday:   MicroLaunch + Uneed.best                   │
│ Afternoon: r/SideProject, r/macapps, chess forums   │
│ All day:  RESPOND TO EVERY COMMENT                   │
│                                                     │
│ 🎯 Goal: 1000+ eyeballs on the app                 │
└─────────────────────────────────────────────────────┘

DAYS 6-10 — FEEDBACK SPRINT
┌─────────────────────────────────────────────────────┐
│ Monitor downloads, comments, GitHub issues           │
│ Fix top 3 bugs users report                          │
│ Reply to every piece of feedback                     │
│                                                     │
│ 🎯 FAIL-FAST CHECK (Day 10, ~Mar 8):               │
│    > 50 downloads   = SIGNAL → keep going            │
│    > 10 GitHub stars = SIGNAL → community interested │
│    > 0 after 10 days = PIVOT or STOP                 │
└─────────────────────────────────────────────────────┘
```

### What to SKIP to ship faster

| Skip This | Why |
|---|---|
| Demo video | Screenshots are enough. Do it post-launch if traction. |
| Perfect landing page | Good-enough with download button > perfect in 2 weeks. |
| Custom domain | Use GitHub URL or free Vercel URL. Buy domain only if traction. |
| Hype list | You don't have one. Ship now, build audience after. |
| PH hunter | Hunt it yourself. Authentic > manufactured. |

### Fail-Fast Decision Framework (Day 10)

| Signal | Downloads | Stars | Comments | Action |
|---|---|---|---|---|
| 🟢 **Go** | 50+ | 10+ | 5+ meaningful | Keep building. Phase 2. |
| 🟡 **Pivot** | 10-50 | 1-10 | Few/generic | Reposition or add killer feature, relaunch. |
| 🔴 **Stop** | <10 | 0 | None | No demand. Save your time. Move on. |

### What "feedback" looks like

- **Hacker News:** Blunt but actionable comments
- **Product Hunt:** Usually more positive reviews
- **GitHub Issues:** Bug reports + feature requests (most valuable)
- **Reddit:** "Does it do X?" = reveals what people want
- **Chess forums:** "How vs Y?" = reveals competitive gaps

---

## 4. V1 Scope: What Ships, What Gets Cut

### Ship in v1 (core value)

- ✅ Dashboard (TWIC issues, database health, manual import)
- ✅ Database (game list, PGN import, search/filter)
- ✅ Analysis (Stockfish WASM, engine lines, eval bar, interactive board)
- ✅ Repertoire (folders, PGN management, flashcard training)
- ✅ Insights (opening trends, performance analytics by rating)
- ✅ ECO opening recognition (554-line lookup table)

### Cut from v1 → move to v2

- ❌ Settings page → **simplify or remove entirely**
  - Analysis depth slider → hardcode to 20 for now
  - Multi-PV selector → hardcode to 3
  - Lichess/Chess.com profile import → v2 feature
  - External Sync tab → v2
  - Training Logic tab → v2
- ❌ Profile/account system (not needed for local-first)

### v1 polish (test before launch, fix if broken)

- [ ] Verify all pages load without errors
- [ ] Test PGN import flow end-to-end
- [ ] Test Analysis page with a loaded game

---

## 5. Immediate Action Items

### ✅ DONE

| # | Task | Status |
|---|---|---|
| 1 | Pick working product name → **macbase** | ✅ Done |
| 2 | Rebrand all code (frontend + backend) | ✅ Done |
| 3 | Remove Settings page + Lichess/Chess.com integration | ✅ Done |

### 🔴 Do NOW (this week)

| # | Task | Owner | Est. Time |
|---|---|---|---|
| 4 | **Build landing page** | Antigravity | 2-3 hours |
| 5 | **Package unsigned DMG** (shell-script .app wrapper) | Antigravity | 3-4 hours |
| 6 | **Verify domain availability** (macbase.app, etc.) | Margot | 30 min |

### 🟡 Do NEXT (before launch)

| # | Task | Owner | Est. Time |
|---|---|---|---|
| 8 | Create 60-second demo video | Margot | 2 hours |
| 9 | Take 5 polished screenshots | Margot + Antigravity | 1 hour |
| 10 | Write tagline + maker story for PH + HN posts | Margot | 1 hour |
| 11 | Create GitHub repo + polished README | Antigravity | 1 hour |
| 12 | Draft posts for each launch venue | Margot | 2 hours |
| 13 | Start commenting on r/chess for karma | Margot | Ongoing |

### 🟢 Do LATER (post-launch)

| # | Task | Notes |
|---|---|---|
| 14 | Evaluate Phase 1 metrics | 4-8 weeks post-launch |
| 15 | Sign app ($99 Apple Dev) | Only if Phase 1 succeeds |
| 16 | Implement free/pro tier gating | Only if Phase 2 triggered |
| 17 | Backend refactoring (split main.py) | Engineering health |
| 18 | Expand test coverage to 50+ | Engineering health |

---

## 6. Distribution Architecture

```
Landing Page (Vercel, free)
├── macbase.app (or similar)
├── Hero section + screenshots + video
├── "Download for Mac" button → GitHub Releases
├── Feature comparison vs ChessBase
└── Pricing (Free now, Pro coming soon)

GitHub (free — open core model)
├── Source code (MIT/GPL for core, closed for Pro features)
├── Releases → macbase-v1.0.0.dmg
├── README with screenshots + install instructions
├── CONTRIBUTING.md for community
└── Submit to Awesome Mac + Awesome Chess lists

Launch Day Posts (all platforms simultaneously)
├── Hacker News: "Show HN: macbase – Free ChessBase for Mac"
├── Product Hunt: Full listing with screenshots + video
├── Indie Hackers: "I launched macbase" builder post
├── r/SideProject + r/macapps: Screenshot posts
├── Chess.com + Lichess forums: "Free chess analysis for Mac"
└── X/Twitter: Thread with demo GIF
```

---

## 7. Key Risks

| Risk | Mitigation |
|---|---|
| Gatekeeper scares users away | Clear install instructions with screenshots; video showing how to bypass |
| En Croissant (free competitor) | Differentiate on Mac-native experience, UX polish, one-click install |
| Low PH traction | Cross-post to r/chess (900K members), r/macapps, chess forums |
| Stockfish WASM performance | Document that native Stockfish (v2, signed app) will be faster |
| Name already taken | Check trademark + domain availability before committing |

---

*This document is the single source of truth for launch planning. Update it as decisions are made.*
