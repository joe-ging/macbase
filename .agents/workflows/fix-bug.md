---
description: Systematic debugging workflow - save state, diagnose, fix, verify
---

# Fix Bug Workflow

## Purpose
Debug issues systematically without making things worse. Creates a save point first so you can always revert if the fix introduces new problems.

## Steps

// turbo
1. Create a save point before debugging:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac
git add -A && git stash save "pre-debug save point"
```

2. Ask the user: **"Describe the bug — what did you expect vs. what happened?"**

3. Gather diagnostic info:
```bash
# Check for build errors
cd frontend && npm run build 2>&1 | tail -20

# Check for import errors
grep -rn "import.*from" src/pages/ | grep -v node_modules | sort

# Check for console errors in recent changes
git diff HEAD~1 --name-only
```

4. Identify the root cause before writing any fix.

5. Implement the fix — change as few lines as possible.

// turbo
6. Verify the build still works:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend
npm run build 2>&1 | tail -5
```

7. If the fix works, commit it:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac
git add -A && git commit -m "fix: <describe what was fixed>"
git push origin main
```

8. If the fix made things worse, revert:
```bash
git stash pop
```

## Debugging Checklist
- [ ] Can you reproduce the bug?
- [ ] Did you read the error message / stack trace?
- [ ] Is it a missing import? (Most common cause of "disappear into darkness")
- [ ] Is it a state initialization issue? (Second most common)
- [ ] Did you check the browser console? (F12 → Console tab)
