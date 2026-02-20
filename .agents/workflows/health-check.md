---
description: Quick health check - file sizes, build status, git state, and code quality
---

# Health Check Workflow

## Purpose
A quick diagnostic scan of the entire project. Run this at the start of a session or when something feels off.

## Steps

// turbo
1. Git status — any uncommitted work?
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac
echo "=== GIT STATUS ===" && git status --short
echo "" && echo "=== LAST 5 COMMITS ===" && git log --oneline -5
echo "" && echo "=== REMOTE SYNC ===" && git log --oneline origin/main..main 2>/dev/null | wc -l | xargs -I {} echo "{} commits not yet pushed"
```

// turbo
2. File size check — any files getting too big?
```bash
echo "=== LARGEST FRONTEND FILES ==="
find frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l 2>/dev/null | sort -rn | head -10
echo ""
echo "=== LARGEST BACKEND FILES ==="
find backend -name "*.py" | xargs wc -l 2>/dev/null | sort -rn | head -10
```

// turbo
3. Build check — does the frontend compile?
```bash
echo "=== BUILD CHECK ==="
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend
npm run build 2>&1 | tail -5
```

// turbo
4. TODO/FIXME items — any unfinished work?
```bash
echo "=== TODOS & FIXMES ==="
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac
grep -rn "TODO\|FIXME\|HACK\|XXX\|BUG" frontend/src/ backend/ --include="*.jsx" --include="*.js" --include="*.py" 2>/dev/null | head -15
echo ""
echo "=== DEAD CODE (commented out) ==="
grep -rn "^[[:space:]]*//" frontend/src/pages/ --include="*.jsx" | wc -l | xargs -I {} echo "{} commented lines in pages/"
```

// turbo
5. Dependency check:
```bash
echo "=== DISK USAGE ==="
du -sh /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend/node_modules 2>/dev/null || echo "node_modules not installed"
du -sh /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/.git
echo ""
echo "=== PROJECT STRUCTURE ==="
echo "Components:" && ls frontend/src/components/ 2>/dev/null | wc -l | xargs -I {} echo "  {} files"
echo "Pages:" && ls frontend/src/pages/*.jsx 2>/dev/null | wc -l | xargs -I {} echo "  {} files"
echo "Data modules:" && ls frontend/src/data/ 2>/dev/null | wc -l | xargs -I {} echo "  {} files"
echo "Backend services:" && ls backend/services/*.py 2>/dev/null | wc -l | xargs -I {} echo "  {} files"
```

## Interpreting Results
- **Uncommitted work:** Run `/git-push` first
- **Unpushed commits:** Run `git push origin main`
- **Files over 400 lines:** Consider running `/refactor`
- **Build fails:** Run `/fix-bug`
- **Many TODOs:** Prioritize and address them
