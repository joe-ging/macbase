---
description: Build production bundle and verify the app is ready to ship
---

# Deploy Workflow

## Purpose
Build the production version of the frontend, verify it works, and optionally push to GitHub.

## Steps

// turbo
1. Make sure all work is committed:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac
git status
```

// turbo
2. Build the frontend production bundle:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend
npm run build 2>&1
```

// turbo
3. Check the build output size:
```bash
du -sh /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend/dist
ls -la /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend/dist/
```

4. If the build succeeded, preview it:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend
npx serve dist -p 4173
```
Preview at: **http://localhost:4173**

5. If everything looks good, push to GitHub:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac
git add -A && git commit -m "build: production build verified" && git push origin main
```

## Build Troubleshooting
- **Import errors:** Usually a missing dependency or wrong path after refactoring
- **Large bundle warning:** Check for unnecessary imports (e.g., importing all of lodash)
- **CSS not loading:** Verify index.css is imported in main.jsx
