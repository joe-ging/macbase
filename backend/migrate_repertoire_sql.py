
import sqlite3
import os

DB_PATH = "macbase.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Creating repertoire_folders table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS repertoire_folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR NOT NULL,
        parent_id INTEGER,
        color VARCHAR DEFAULT 'neon-lime',
        created_at VARCHAR,
        FOREIGN KEY(parent_id) REFERENCES repertoire_folders(id)
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_repertoire_folders_parent_id ON repertoire_folders (parent_id);")

    print("Creating repertoire_games table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS repertoire_games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folder_id INTEGER,
        title VARCHAR,
        white VARCHAR,
        black VARCHAR,
        white_elo VARCHAR,
        black_elo VARCHAR,
        event VARCHAR,
        pgn TEXT,
        fen VARCHAR,
        is_flashcard INTEGER DEFAULT 0,
        arrows_json TEXT,
        created_at VARCHAR,
        FOREIGN KEY(folder_id) REFERENCES repertoire_folders(id)
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_repertoire_games_folder_id ON repertoire_games (folder_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_repertoire_games_is_flashcard ON repertoire_games (is_flashcard);")
    
    # Create root folders for White and Black if they don't exist
    cursor.execute("SELECT count(*) FROM repertoire_folders WHERE parent_id IS NULL AND name IN ('White Repertoire', 'Black Repertoire')")
    count = cursor.fetchone()[0]
    if count < 2:
        print("Creating root folders...")
        cursor.execute("INSERT INTO repertoire_folders (name, color, created_at) VALUES ('White Repertoire', 'neon-lime', datetime('now'))")
        cursor.execute("INSERT INTO repertoire_folders (name, color, created_at) VALUES ('Black Repertoire', 'neon-lime', datetime('now'))")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
