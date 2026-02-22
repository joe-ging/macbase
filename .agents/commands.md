# ⌨️ Macbase Command Reference

This document lists all available **Slash Commands** (/workflows) for the Macbase project. These commands are executed by Antigravity to automate development tasks.

## 🚀 General Workflows

| Command | Description |
| :--- | :--- |
| `/start` | Welcome message shown at the start of each session with available commands. |
| `/dev` | Start the backend and frontend development servers for local testing. |
| `/test` | Run automated tests to verify core logic before committing. |
| `/unit-test` | Run the backend and frontend unit tests individually or continuously. |
| `/health-check` | Quick health check - file sizes, build status, git state, and code quality. |
| `/deploy` | Build production bundle and verify the app is ready to ship. |

## 🛠️ Development & Maintenance

| Command | Description |
| :--- | :--- |
| `/start-feature` | Safe workflow for starting a new feature - saves current state first. |
| `/fix-bug` | Systematic debugging workflow - save state, diagnose, fix, verify. |
| `/refactor` | How to refactor code for maintainability after completing a feature. |

## 🛡️ Open Core & Git Management

| Command | Description |
| :--- | :--- |
| **`/push-core`** | **Public Push:** Toggles to Core mode and pushes to the public `macbase` repo. |
| **`/push-pro`** | **Private Backup:** Syncs and pushes the secret `/pro` folders to the private repo. |
| **`/build-pro`** | **Production Build:** Toggles to Pro mode for DMG packaging, then back to Core. |
| `/git-push` | Standard commit and push workflow (uses default `.gitignore` rules). |

---

*Use these commands by typing `/[command name]` in the chat.*
