import requests
import zipfile
import io
import os
import re
import chess.pgn
from datetime import datetime
from sqlalchemy.orm import Session
from .database import SessionLocal, Game, init_db


TWIC_BASE_URL = "https://theweekinchess.com/zips/"

class TWICService:
    def __init__(self, download_dir="data/downloads", db_dir="data/db"):
        self.download_dir = download_dir
        self.db_dir = db_dir
        os.makedirs(self.download_dir, exist_ok=True)
        os.makedirs(self.db_dir, exist_ok=True)

    def get_latest_issue_number(self):
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            response = requests.get("https://theweekinchess.com/twic", headers=headers, timeout=10)
            if response.status_code != 200:
                print(f"Failed to fetch TWIC page: {response.status_code}")
                return None
                
            # Naive scrape: find first link like "twic1578.html"
            match = re.search(r'twic(\d+)\.html', response.text)
            if match:
                return int(match.group(1))
            return None
        except Exception as e:
            print(f"Error checking latest TWIC: {e}")
            return None

    def download_twic(self, issue_number: int, progress_callback=None):
        # File format is usually twic<number>g.zip
        filename = f"twic{issue_number}g.zip"
        url = f"{TWIC_BASE_URL}{filename}"
        
        print(f"Downloading {url}...")
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        try:
            response = requests.get(url, headers=headers, stream=True, timeout=30)
            
            if response.status_code == 200:
                total_size = int(response.headers.get('content-length', 0))
                zip_path = os.path.join(self.download_dir, filename)
                
                downloaded = 0
                with open(zip_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            if progress_callback and total_size > 0:
                                percent = int((downloaded / total_size) * 100)
                                progress_callback(f"Downloading... {percent}%")
                
                # Unzip
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(self.download_dir)
                
                return True, f"Downloaded and extracted {filename}"
            else:
                return False, f"Failed to download {filename}: Status {response.status_code}"
        except Exception as e:
            return False, f"Download error: {str(e)}"

    def parse_pgn(self, pgn_path, issue_number, progress_callback=None):
        session = SessionLocal()
        init_db() # Ensure tables exist
        
        count = 0
        try:
            with open(pgn_path, encoding="utf-8", errors="replace") as pgn_file:
                while True:
                    game_node = chess.pgn.read_game(pgn_file)
                    if game_node is None:
                        break
                    
                    headers = game_node.headers
                    
                    game_db = Game(
                        event=headers.get("Event", "?"),
                        site=headers.get("Site", "?"),
                        date=headers.get("Date", "????.??.??"),
                        round=headers.get("Round", "?"),
                        white=headers.get("White", "?"),
                        black=headers.get("Black", "?"),
                        result=headers.get("Result", "*"),
                        eco=headers.get("ECO", ""),
                        opening=headers.get("Opening", None),  # Extract Opening from PGN header
                        white_elo=int(headers.get("WhiteElo", 0)) if headers.get("WhiteElo", "").isdigit() else None,
                        black_elo=int(headers.get("BlackElo", 0)) if headers.get("BlackElo", "").isdigit() else None,
                        pgn=str(game_node), # Stores full PGN including moves
                        twic_issue=issue_number,
                        is_commented=0
                    )
                    session.add(game_db)
                    count += 1
                    
                    if count % 100 == 0:
                        session.commit()
                        if progress_callback:
                            progress_callback(count)
            
            session.commit()
            return True, f"Imported {count} games from {pgn_path}"
        except Exception as e:
            session.rollback()
            return False, f"Error parsing PGN: {str(e)}"
        finally:
            session.close()
