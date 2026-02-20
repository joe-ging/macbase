
import sqlite3

db_path = "/Users/jingsmacbookpro/.gemini/antigravity/scratch/grandmaster-mac/backend/grandmaster_mac.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Correcting tag assignments for arbiter annotated games...")
cursor.execute("UPDATE games SET is_personal = 0 WHERE id IN (3602, 97069)")
cursor.execute("UPDATE games SET is_commented = 1 WHERE id IN (3602, 97069)")

count = cursor.rowcount
print(f"Updated {count} games. Their 'MY STUDY' badge is removed, but 'ANNOTATED' remains.")

conn.commit()
conn.close()
