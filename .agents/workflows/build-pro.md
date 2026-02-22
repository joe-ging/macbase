---
description: Build the professional DMG with all secret features enabled.
---

# /build-pro Workflow

Use this when you are ready to package the app for customers.

// turbo
1. Enable Pro Mode:
```bash
python3 toggle_pro.py pro
```

2. 📦 **Build the DMG:**
Run your usual build process here (e.g., `npm run build` in the frontend or your packaging script).

// turbo
3. Restore Core Mode:
```bash
python3 toggle_pro.py core
```

**Note:** Always return to "Core" mode before pushing to GitHub to prevent broken links in the public repo.
