
import sqlite3
import re

db_path = "/Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/backend/grandmaster_mac.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("Fetching games tagged as commented...")
cursor.execute("SELECT id, pgn, is_personal FROM games WHERE is_commented = 1")
games = cursor.fetchall()

print(f"Checking {len(games)} games...")
updates = []
for game in games:
    pgn = game['pgn']
    is_personal = game['is_personal']
    
    # Strip headers to search only move text
    # PGN move text usually starts after the last ] followed by a blank line
    # or just look for content not in []
    
    # Simple way: remove everything inside []
    move_text = re.sub(r'\[.*?\]', '', pgn, flags=re.DOTALL)
    
    # Check if real comments or variations exist in the move text
    has_real_comment = '{' in move_text or '(' in move_text
    
    if not has_real_comment and is_personal == 0:
        updates.append((0, game['id']))

if updates:
    print(f"Cleaning up {len(updates)} false positive tags...")
    cursor.executemany("UPDATE games SET is_commented = ? WHERE id = ?", updates)
    conn.commit()
    print("Cleanup successful.")
else:
    print("No false positives found (logic might be flawed).")

conn.close()
