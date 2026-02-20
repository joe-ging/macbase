---
description: Safe workflow for starting a new feature - saves current state first
---

# Start Feature Workflow

## Purpose
Creates a git save point before starting new work. This way if the new feature goes wrong, you can always revert to a known good state.

## Steps

// turbo
1. Save any current uncommitted work first:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac
git add -A && git diff --cached --stat
```

2. If there are staged changes, commit them:
```bash
git commit -m "chore: save work in progress before starting new feature"
git push origin main
```

// turbo
3. Confirm we're on a clean slate:
```bash
git status && git log --oneline -3
```

4. Ask the user: **"What feature do you want to build?"**

5. Before writing any code, outline the plan:
   - What files will be created or modified?
   - What's the expected behavior?
   - Any dependencies needed?

6. After getting user approval, begin implementation.

## Reminders
- Commit frequently during the feature (every meaningful milestone)
- If something breaks badly: `git checkout -- .` to revert uncommitted changes
- When done, run `/git-push` to save and push the completed feature
