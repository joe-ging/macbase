# 🚀 Product Launch Plan

> **Working Name:** macbase
> **Status:** Day 2 In Progress
> **Created:** Feb 21, 2026
> **Last Updated:** Feb 21, 2026 (11:24 PM HKT)
> **Target Platforms:** Multi-channel (see Launch Venues below)

---

## 0. Branding

**Working Name:** `macbase` (styled lowercase like macOS)

**Positioning:** Low-cost ChessBase alternative, built natively for Mac, local-first.

**Pricing:** Free for first 100 users → one-time purchase after that (no subscriptions).

**Logo concept:** ♞ macbase — chess knight icon, "mac" in white, "base" in neon lime

**Status:**
- ✅ Code rebranded from "Grandmaster Mac" → "macbase" (Feb 21)
- ✅ GitHub repo renamed: `github.com/joe-ging/macbase` (Feb 21)
- ✅ `jl-intelligence-parser` repo set to PRIVATE (API key exposure) (Feb 21)
- ✅ `joe-ging.github.io` now redirects to macbase landing page (Feb 21)

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

- "Chess analysis for Mac. One-time purchase. Done."
- "Your chess studio. Local. Mac-native."
- "The ChessBase Mac users have been waiting for."

### Pre-launch checklist

- [x] Pick working product name → **macbase**
- [x] Remove Settings page / unnecessary features
- [x] Rebrand all code references
- [x] Rename GitHub repo to `macbase`
- [x] Build landing page (GitHub Pages: `joe-ging.github.io/macbase`)
- [x] Set up pricing messaging (free for first 100, one-time purchase after)
- [x] Add TWIC donation link to landing page
- [ ] Set up Google Form for email collection + download gating
- [ ] Take 5 real screenshots (Dashboard, Analysis, Database, Repertoire, Insights)
- [ ] Add screenshots to landing page
- [ ] Create 60-second demo video
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
2. **One-time cost** — ChessBase charges €199-499 for software + €50/year for Premium + €230 for Mega Database. That's €300-700+ to get started. We charge a one-time fee (free for first 100 users).
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
| **macbase (launch)** | **$0** | **Mac** | **Free for first 100 users** |
| **macbase (after 100)** | **TBD** | **Mac** | **One-time purchase** |

### Phase 1: Validation (Launch)

**Goal:** Validate demand. Get 100 downloads. Collect emails. Gather feedback.

- **Price:** Free for first 100 users (gated via Google Form)
- **All features unlocked** — no gating yet
- **Distribution:** Google Form (email) → GitHub Releases (download)
- **Duration:** 4-8 weeks post-launch
- **Success metrics:**
  - 100 downloads (free tier exhausted)
  - 50+ email signups
  - 20+ pieces of feedback
  - Featured on Product Hunt or front page HN

### Phase 2: Polish + Sign ($99 Apple Dev)

**Trigger:** Phase 1 success metrics met.

- Pay $99 for Apple Developer account
- Code-sign and notarize the app
- Smooth install experience (no right-click workaround)
- Add optional anonymous usage analytics (PostHog free tier)
- Fix top 5 feedback issues from Phase 1

### Phase 3: Monetize (One-Time Purchase)

**Trigger:** 100 free downloads exhausted, clear demand.

- **Price:** One-time purchase (TBD — $29-49 range)
- **Payment:** Choose own payment processor (NOT Gumroad — avoid 10% cut)
  - Options: Stripe Checkout, Paddle, LemonSqueezy, Ko-fi
  - Decision deferred to post-validation
- **License activation:** Simple key check on app launch, stored locally
- All features included — no free/pro split initially

### Phase 4: Growth (optional, if traction continues)

- Mac App Store listing ($99/year already paid)
- Free/Pro tier split (if user base warrants it)
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
DAY 1 — Fri Feb 21 (4 hrs) ✅ COMPLETE
┌─────────────────────────────────────────────────────┐
│ ✅ Rebrand to macbase (code + GitHub repo)          │
│ ✅ Remove Settings page + unnecessary features      │
│ ✅ Create launch plan                               │
│ ✅ Define business model + launch channels          │
│ ✅ Fix Dashboard TWIC timeout bug                   │
│ ✅ Fix duplicate max_elo filter bug                 │
│ ✅ Delete dead Settings.jsx file                    │
│ ✅ Set up GitHub Pages hosting                      │
│ ✅ Redirect joe-ging.github.io → /macbase           │
│ ✅ Make jl-intelligence-parser repo private          │
│ ✅ Push all changes to GitHub                       │
│                                                     │
│ Result: App clean, branded, bugs fixed, plan clear  │
└─────────────────────────────────────────────────────┘

DAY 2 — Sat Feb 22 (4 hrs) 🔧 IN PROGRESS
┌─────────────────────────────────────────────────────┐
│ ✅ Build landing page v1 (hero, features, compare)  │
│ ✅ Add TWIC database positioning + donation link    │
│ ✅ Feature-by-feature walkthrough layout            │
│ ✅ Update pricing: free for first 100 users         │
│ ✅ Take full app screenshots (carousel design)      │
│ ✅ Add screenshots to landing page                  │
│ ✅ Set up Tally.so form (email gate for downloads)  │
│    - Accessible in China (unlike Google Forms)      │
│    - On submit: auto-redirects to direct DMG link   │
│ ✅ Add live download counter to landing page        │
│    - Fetches count from GitHub Releases API         │
│ ✅ Package unsigned DMG + test install              │
│                                                     │
│ Result: Downloadable app + landing page + count     │
└─────────────────────────────────────────────────────┘

DAY 3 — Sun Feb 23 (4 hrs)
┌─────────────────────────────────────────────────────┐
│ Hour 1:   Polish GitHub README w/ screenshots       │
│ Hour 2:   Take remaining screenshots if needed      │
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
| Custom domain | Use GitHub Pages URL. Buy domain only if traction. |
| Hype list | You don't have one. Ship now, build audience after. |
| PH hunter | Hunt it yourself. Authentic > manufactured. |
| Gumroad | Avoid 10% cut. Google Form + Stripe later gives full control. |

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

- ❌ Settings page → **removed**
- ❌ Lichess/Chess.com profile import → v2
- ❌ External Sync → v2
- ❌ Training Logic tab → v2
- ❌ Profile/account system (not needed for local-first)

### v1 polish (test before launch, fix if broken)

- [x] Fix Dashboard TWIC fetch timeout (added 10s AbortController)
- [x] Fix duplicate max_elo filter in Database page
- [x] Delete dead Settings.jsx file
- [ ] Verify all pages load without errors
- [ ] Test PGN import flow end-to-end
- [ ] Test Analysis page with a loaded game

---

## 5. Download Gating & Email Collection

### Approach: Tally.so → Direct DMG Download

**Why Tally.so:** Fully accessible in China (Google Forms is blocked). Clean UI. Free tier includes auto-redirects.

**Flow:**
```
Landing Page "Download" button
  → Opens Tally.so form (collects email)
    → On complete: auto-redirects to direct GitHub DMG file link
      → Download starts immediately (bypassing GitHub UI)
```

**What this gives us:**
1. **Email list** — We have their contact info
2. **China compatibility** — No blocks.
3. **Zero-friction download** — Users never have to figure out the GitHub Releases page.
4. **Live download count** — We will fetch the download count directly from the GitHub API and show it on the landing page (e.g., "12 / 100 free downloads claimed").

**Tally.so setup:**
- Field: Email (required)
- Settings: "Redirect on completion" → `https://github.com/joe-ging/macbase/releases/latest/download/macbase.dmg`

**After 100 downloads:**
- Update Tally form to say "Free period has ended" and remove redirect.
- Replace link on website with Stripe/Paddle checkout link.

### TODO
- [ ] Create Tally.so form (ask for email)
- [ ] Make Tally form redirect to DMG URL
- [ ] Wire up landing page "Download" button to Tally form
- [ ] Add GitHub API script to landing page to show current download count

---

## 6. Distribution Architecture

```
Landing Page (GitHub Pages, free)
├── joe-ging.github.io/macbase
├── Hero section + real app screenshots
├── Feature-by-feature walkthrough
├── TWIC database section + donation link
├── Feature comparison vs ChessBase
├── Pricing: "Free for first 100 users"
├── "Download for Mac" button → Google Form
└── Footer with GitHub + TWIC links

Portfolio Hub (GitHub Pages, future)
├── joe-ging.github.io (redirects to /macbase for now)
├── Future: developer portfolio + project showcase
└── See PORTFOLIO_TODO.md in joe-ging.github.io repo

Google Form (email gate)
├── Collects: email, name, rating, referral source
├── On submit: redirects to GitHub Releases
└── Responses in Google Sheet (download count + email list)

GitHub (free — open core model)
├── Source code (MIT for core)
├── Releases → macbase-v1.0.0.dmg
├── README with screenshots + install instructions
├── CONTRIBUTING.md for community
└── Submit to Awesome Mac + Awesome Chess lists

Launch Day Posts (all platforms simultaneously)
├── Hacker News: "Show HN: macbase – ChessBase alternative for Mac"
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
| Google Form feels unprofessional | Keep it simple and branded; swap to Stripe Checkout in Phase 2 |
| Free users don't convert to paid | Focus on proving demand first; monetization is Phase 3 |

---

*This document is the single source of truth for launch planning. Update it as decisions are made.*
