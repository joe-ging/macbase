# ♟️ Open Core Architecture

Macbase follows an **Open Core** model. The project consists of a **Public Core** (Open Source) and a **Private Pro Layer** (Commercial secrets).

## 🗺️ Sync Architecture

Your local environment contains the **Full Application**. However, Git separates it based on your target destination.

### 1. Public Repository (`joe-ging/macbase`)
*Contains the engine, board, and core database functionality.*

| Folder/File | Sync Status | Role |
| :--- | :--- | :--- |
| `frontend/src/pages/` | ✅ Public | Core pages (Analysis, DB, Dashboard) |
| `frontend/src/components/` | ✅ Public | Visual components (EvalBar, Board) |
| `backend/main.py` | ✅ Public | The main FastAPI server (with "Safe Imports") |
| `backend/services/` | ✅ Public | Database and Utility services |
| **`frontend/src/pro/`** | ❌ **HIDDEN** | Proprietary Logic (Arrows, Spaced Repetition) |
| **`backend/pro/`** | ❌ **HIDDEN** | Secret Backend Logic (TWIC Sync, Insights API) |

### 2. Private Repository (`joe-ging/macbase-pro-private`)
*Contains only the professional "Secret Sauce".*

| Folder | Sync Path | Role |
| :--- | :--- | :--- |
| `frontend/src/pro/` | ✅ Private | Full tactical arrow logic and Pro components. |
| `backend/pro/` | ✅ Private | Advanced analytics, scraping, and Insight logic. |

---

## 🔄 The "Toggle" Mechanic

Because the public repository does not have access to the `/pro` folders, we use **`toggle_pro.py`** to swap "Wires" (Imports).

*   **CORE MODE:** Frontend imports from `./pages/Analysis` (The promotional/simplified version). Safe for Public GitHub.
*   **PRO MODE:** Frontend imports from `./pro/Analysis` (The full commercial version). Used for Building DMGs.

## 📦 Build & Push Workflow

1.  **Back up secrets:** Run `/push-pro` to sync `/pro` folders to the hidden repo.
2.  **Push public updates:** Run `/push-core` to clean imports and update the community repo.
3.  **Ship commercial DMG:** Run `/build-pro` (Toggles Pro -> Build -> Toggles Core).
