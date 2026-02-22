---
description: Push core (public) changes to GitHub. Automatically toggles to Core mode.
---

# /push-core Workflow (Public)

Use this to push the public part of the project to GitHub.

// turbo
1. Toggle to Core Mode (Ensure public imports):
```bash
python3 toggle_pro.py core
```

// turbo
2. Stage and Commit public changes:
```bash
git add .
git commit -m "chore: push core updates"
```

// turbo
3. Push to Public Repository:
```bash
git push origin main
```

4. Verify on GitHub:
[View Public Repo](https://github.com/joe-ging/grandmaster-mac)
