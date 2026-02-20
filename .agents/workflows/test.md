---
description: Run automated tests to verify core logic before committing
---

# Test Workflow

## Purpose
Run all automated tests to ensure existing core features (like ECO parsing and eval bar math) haven't been broken by recent changes.

## Steps

// turbo
1. Run the frontend tests:
```bash
cd /Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/frontend
npm test
```

2. If tests **pass**, you are safe to commit your changes using `/git-push`.

3. If tests **fail**:
   - DO NOT commit.
   - Read the test output to see what exactly broke.
   - Fix the broken code.
   - Run `/test` again until they pass.

## Optional: How to add more tests
When you build a new complex calculation or data-parsing function (e.g. backend PGN logic or new chess maths):
1. Ask the AI: *"Write a unit test for the function I just built."*
2. Save it in `frontend/src/__tests__/` or `backend/tests/`.
3. It will automatically run every time you use `/test`.
