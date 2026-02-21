from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
import concurrent.futures
from sqlalchemy.orm import Session
from sqlalchemy import func, not_, or_, and_
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from eco_lookup import ECO_DICT
from pydantic import BaseModel
import io
import chess.pgn
import asyncio

app = FastAPI(title="macbase API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from services.twic_service import TWICService
from services.database import SessionLocal, Game, ExcludedIssue, RepertoireFolder, RepertoireGame

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

twic_service = TWICService()

# Cache for TWIC issues to avoid scraping on every request
TWIC_CACHE_DURATION = 3600 # 1 hour
_twic_issues_cache = {
    "data": None,
    "fetched_at": None
}

# Global dictionary to track import status: { issue_number: { "status": "processing", "progress": "...", "message": "..." } }
import_status: Dict[int, Dict] = {}

def get_issue_events(issue_num):
    """Fetch and parse events from a specific TWIC issue page"""
    try:
        url = f"https://theweekinchess.com/html/twic{issue_num}.html"
        headers = {
             "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        # Try to find the Contents section
        text = soup.get_text()
        
        # Look for "Contents" followed by numbered list
        events = []
        
        # Method 1: Regex for "1) Event Name" pattern
        # This matches the pattern in the content dump we saw
        matches = re.findall(r'\d+\)\s+(.+?)(?=\n|\r)', text)
        
        # Filter matches to avoid grabbing random text
        # The first match is usually "Introduction", skip it
        # Take up to 5 major events
        clean_events = []
        for m in matches:
            m = m.strip()
            if m and "Introduction" not in m and len(m) > 3:
                clean_events.append(m)
        
        return clean_events[:5] # Return top 5 events
        
    except Exception as e:
        print(f"Error fetching events for issue {issue_num}: {e}")
        return []


@app.get("/api/twic-issues")
def get_twic_issues(limit: int = 15):
    """Fetch latest TWIC issues from theweekinchess.com"""
    global _twic_issues_cache
    
    # Return cached data if fresh
    if _twic_issues_cache["data"] and _twic_issues_cache["fetched_at"]:
        cache_age = (datetime.now() - _twic_issues_cache["fetched_at"]).total_seconds()
        if cache_age < TWIC_CACHE_DURATION:
            data = _twic_issues_cache["data"]
            # Inject imported status
            db = SessionLocal()
            try:
                for issue in data[:limit]:
                    issue_num = issue["issue"]
                    exists = db.query(Game).filter(Game.twic_issue == issue_num).first()
                    excluded = db.query(ExcludedIssue).filter(ExcludedIssue.twic_issue == issue_num).first()
                    issue["imported"] = exists is not None
                    issue["excluded"] = excluded is not None
                    
                    status_info = import_status.get(issue_num)
                    if status_info and status_info.get("status") == "processing":
                        issue["processing"] = True
                        issue["progress"] = status_info.get("progress", "")
                    else:
                        issue["processing"] = False
                
                return data[:limit]
            finally:
                db.close()
    
    try:
        # Scrape TWIC archive page
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get("https://theweekinchess.com/twic", headers=headers, timeout=8)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Find the issues table - it's a standard HTML table with columns:
        # TWIC, Date, Read, PGN, CBV, Games, Stories
        issues = []
        seen_issues = set()
        
        # Look for all table rows
        for row in soup.find_all("tr"):
            cells = row.find_all("td")
            if len(cells) >= 6:  # at least 6 columns expected
                try:
                    # First cell should contain issue number (4-digit)
                    first_cell_text = cells[0].get_text(strip=True)
                    
                    # Check if this is a valid issue number row
                    if first_cell_text.isdigit() and len(first_cell_text) == 4:
                        issue_num = int(first_cell_text)
                        
                        # Second cell should contain date (YYYY-MM-DD format)
                        date_str = cells[1].get_text(strip=True) if len(cells) > 1 else "Unknown"
                        
                        # Games count is usually in column 6 (0-indexed: 5)
                        games_count = None
                        if len(cells) > 5:
                            games_text = cells[5].get_text(strip=True).replace(",", "").replace(".", "")
                            if games_text.isdigit():
                                games_count = int(games_text)
                        
                        if issue_num not in seen_issues:
                            issues.append({
                                "issue": issue_num,
                                "date": date_str if date_str else "Unknown",
                                "games": games_count,
                                "pgn_url": f"https://theweekinchess.com/zips/twic{issue_num}g.zip",
                                "events": [] # Will be populated for top issues
                            })
                            seen_issues.add(issue_num)
                except (ValueError, IndexError) as e:
                    continue  # Skip malformed rows
        
        # Parallel fetch events for the top issues
        # only fetch for the requested limit to save time
        issues_to_enrich = issues[:limit]
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            # Create a map of future -> issue dict
            future_to_issue = {executor.submit(get_issue_events, issue["issue"]): issue for issue in issues_to_enrich}
            
            for future in concurrent.futures.as_completed(future_to_issue):
                issue = future_to_issue[future]
                try:
                    events = future.result()
                    issue["events"] = events
                except Exception as e:
                    issue["events"] = []

        # Before returning, update cache and append any DB items not found on page
        db = SessionLocal()
        try:
            db_imported = [r[0] for r in db.query(Game.twic_issue).distinct().all()]
            db_excluded = [r[0] for r in db.query(ExcludedIssue.twic_issue).all()]
            all_managed = set(db_imported) | set(db_excluded)
            
            scraped_nums = {i["issue"] for i in issues}
            for m_num in all_managed:
                if m_num not in scraped_nums:
                    db_count = db.query(Game).filter(Game.twic_issue == m_num).count()
                    issues.append({
                        "issue": m_num,
                        "date": "Managed",
                        "games": db_count,
                        "pgn_url": f"https://theweekinchess.com/zips/twic{m_num}g.zip",
                        "events": ["In Local Database"],
                        "is_managed": True
                    })
            
            issues.sort(key=lambda x: x["issue"], reverse=True)

            # Update cache with full list
            _twic_issues_cache["data"] = issues
            _twic_issues_cache["fetched_at"] = datetime.now()

            # Return and inject status
            for issue in issues[:limit]:
                issue_num = issue["issue"]
                exists = db.query(Game).filter(Game.twic_issue == issue_num).first()
                excluded = db.query(ExcludedIssue).filter(ExcludedIssue.twic_issue == issue_num).first()
                
                issue["imported"] = exists is not None
                issue["excluded"] = excluded is not None
                
                status_info = import_status.get(issue_num)
                if status_info and status_info.get("status") == "processing":
                    issue["processing"] = True
                    issue["progress"] = status_info.get("progress", "")
                else:
                    issue["processing"] = False
                    
            return issues[:limit]
        finally:
            db.close()

        
    except Exception as e:
        print(f"Error fetching TWIC issues: {e}")
        # Return cached data even if stale, or empty list
        if _twic_issues_cache["data"]:
            return _twic_issues_cache["data"][:limit]
        raise HTTPException(status_code=503, detail=f"Could not fetch TWIC issues: {str(e)}")

# Background task for importing TWIC
def import_twic_task(issue_number: int):
    global import_status
    import_status[issue_number] = {"status": "processing", "progress": "Starting...", "message": "Initializing import"}
    
    try:
        def set_progress(msg):
            import_status[issue_number]["progress"] = msg

        # 1. Download
        success, msg = twic_service.download_twic(issue_number, progress_callback=set_progress)
        if not success:
            import_status[issue_number] = {"status": "error", "progress": "Failed", "message": msg}
            return

        # 2. Parse
        pgn_filename = f"twic{issue_number}.pgn"
        pgn_path = os.path.join(twic_service.download_dir, pgn_filename)
        
        if not os.path.exists(pgn_path):
            import_status[issue_number] = {"status": "error", "progress": "Failed", "message": f"PGN file not found: {pgn_filename}"}
            return

        def parse_progress(count):
            import_status[issue_number]["progress"] = f"Importing... {count} games"
            
        success, msg = twic_service.parse_pgn(pgn_path, issue_number, progress_callback=parse_progress)
        
        if success:
            import_status[issue_number] = {"status": "success", "progress": "Completed", "message": msg}
        else:
            import_status[issue_number] = {"status": "error", "progress": "Failed", "message": msg}
            
    except Exception as e:
        import_status[issue_number] = {"status": "error", "progress": "Error", "message": str(e)}


@app.post("/api/fetch-twic/{issue_number}")
def fetch_twic(issue_number: int, background_tasks: BackgroundTasks):
    # Check if already processing
    if issue_number in import_status and import_status[issue_number]["status"] == "processing":
        return {"status": "processing", "message": f"Import for {issue_number} is already in progress"}

    # Start background task
    background_tasks.add_task(import_twic_task, issue_number)
    
    return {"status": "started", "message": f"Background import started for TWIC {issue_number}"}

@app.get("/api/import-status/{issue_number}")
def get_import_status(issue_number: int):
    status = import_status.get(issue_number)
    if not status:
        return {"status": "idle", "progress": "", "message": ""}
    return status

@app.delete("/api/issues/{issue_number}")
def delete_issue(issue_number: int, db: Session = Depends(get_db)):
    """Delete all games associated with a specific TWIC issue and remove the PGN file"""
    # 1. Delete from DB
    games = db.query(Game).filter(Game.twic_issue == issue_number)
    count = games.count()
    
    games.delete(synchronize_session=False)
    db.commit()

    # 2. Delete file from disk
    # Construct filename based on issue number (e.g., twic1500.pgn)
    pgn_filename = f"twic{issue_number}.pgn"
    pgn_path = os.path.join(twic_service.download_dir, pgn_filename)
    
    file_msg = ""
    if os.path.exists(pgn_path):
        try:
            os.remove(pgn_path)
            file_msg = " and PGN file removed"
        except Exception as e:
            file_msg = f" but failed to remove file: {e}"
    else:
        # Check for zip file too? Usually we expand it. 
        # But let's check for the zip just in case
        zip_filename = f"twic{issue_number}g.zip"
        zip_path = os.path.join(twic_service.download_dir, zip_filename)
        if os.path.exists(zip_path):
             try:
                os.remove(zip_path)
                file_msg = " and ZIP file removed"
             except:
                pass

    return {"status": "success", "message": f"Deleted {count} games{file_msg} from issue {issue_number}"}

@app.post("/api/issues/{issue_number}/exclude")
def exclude_issue(issue_number: int, db: Session = Depends(get_db)):
    """Mark an issue as excluded so it doesn't show up in the dashboard"""
    # Check if already excluded
    existing = db.query(ExcludedIssue).filter(ExcludedIssue.twic_issue == issue_number).first()
    if existing:
        return {"status": "success", "message": f"Issue {issue_number} already excluded"}
    
    exclusion = ExcludedIssue(twic_issue=issue_number)
    db.add(exclusion)
    db.commit()
    return {"status": "success", "message": f"Issue {issue_number} excluded"}

@app.delete("/api/issues/{issue_number}/exclude")
def unexclude_issue(issue_number: int, db: Session = Depends(get_db)):
    """Remove exclusion for an issue"""
    exclusion = db.query(ExcludedIssue).filter(ExcludedIssue.twic_issue == issue_number).first()
    if exclusion:
        db.delete(exclusion)
        db.commit()
        return {"status": "success", "message": f"Issue {issue_number} unexcluded"}
    return {"status": "error", "message": f"Issue {issue_number} not found in exclusions"}

@app.put("/api/games/{game_id}")
def update_game(game_id: int, pgn: str = Query(...), db: Session = Depends(get_db)):
    """Update the PGN for a specific game (saves analysis/edits)"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game.pgn = pgn
    # Automatically tag as commented if any analysis is added
    if "{" in pgn or "(" in pgn:
        game.is_commented = 1
    else:
        game.is_commented = 0
        
    # Always tag as personal if user saves via this endpoint
    game.is_personal = 1
        
    db.commit()
    return {"status": "success", "message": "Analysis saved to database"}

@app.get("/api/games")
def get_games(
    skip: int = 0, 
    limit: int = 50, 
    player: str = None, 
    min_elo: int = None, 
    max_elo: int = None, 
    eco: str = None,
    event: str = None,
    twic_issue: int = None,
    commented_only: bool = False,
    personal_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Game)

    if commented_only:
        query = query.filter(Game.is_commented == 1)
        
    if personal_only:
        query = query.filter(Game.is_personal == 1)
    
    if player:
        # Search both white and black
        search = f"%{player}%"
        query = query.filter((Game.white.ilike(search)) | (Game.black.ilike(search)))
    
    if min_elo:
        query = query.filter((Game.white_elo >= min_elo) | (Game.black_elo >= min_elo))
        
    if max_elo:
        query = query.filter((Game.white_elo <= max_elo) | (Game.black_elo <= max_elo))
        
    if eco:
        import json
        try:
            # Check if eco is a JSON encoded list of prefixes
            eco_list = json.loads(eco)
            if isinstance(eco_list, list):
                conditions = [Game.eco.startswith(prefix) for prefix in eco_list]
                query = query.filter(or_(*conditions))
            else:
                 query = query.filter(Game.eco.ilike(f"{eco}%"))
        except json.JSONDecodeError:
            query = query.filter(Game.eco.ilike(f"{eco}%"))
        
    if event:
        query = query.filter(Game.event.ilike(f"%{event}%"))
    
    if twic_issue:
        query = query.filter(Game.twic_issue == twic_issue)

    # Sort by ID descending (newest games first by import order)
    # Date sorting removed temporarily as it may cause issues with mixed formats
    # query = query.order_by(Game.date.desc(), Game.id.desc())
    query = query.order_by(Game.id.desc())
    
    print(f"DEBUG: SQL Query: {query}")
    games = query.offset(skip).limit(limit).all()
    print(f"DEBUG: Found {len(games)} games (skip={skip}, limit={limit})")
    if not games and skip == 0:
         # Fallback to check if ANY games exist without sorting
         count = db.query(Game).count()
         print(f"DEBUG: Total games in DB (no filters): {count}")
    return games

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    # Get list of excluded issue numbers
    excluded_issues = db.query(ExcludedIssue.twic_issue).all()
    excluded_ids = [e[0] for e in excluded_issues]
    
    # Get breakdown of unexcluded issues
    from sqlalchemy import func
    breakdown_query = db.query(Game.twic_issue, func.count(Game.id)).group_by(Game.twic_issue)
    if excluded_ids:
        breakdown_query = breakdown_query.filter(Game.twic_issue.notin_(excluded_ids))
    
    breakdown_results = breakdown_query.all()
    # Format: "issue-1574: 39228, issue-1628: 6014"
    breakdown_str = ", ".join([f"issue-{r[0]}: {r[1]}" for r in sorted(breakdown_results, key=lambda x: x[0], reverse=True)])
    
    query = db.query(Game)
    if excluded_ids:
        query = query.filter(Game.twic_issue.notin_(excluded_ids))
        
    total_games = query.count()
    
    return {
        "total_games": total_games,
        "breakdown": breakdown_str
    }

@app.get("/api/insights")
def get_insights(min_elo: int = 1700, max_elo: int = 2000, db: Session = Depends(get_db)):
    # Exclude disallowed issues
    excluded_issues = db.query(ExcludedIssue.twic_issue).all()
    excluded_ids = [e[0] for e in excluded_issues]

    # Relaxed query: At least ONE player in range
    base_query = db.query(Game).filter(
        or_(
            and_(Game.white_elo >= min_elo, Game.white_elo <= max_elo),
            and_(Game.black_elo >= min_elo, Game.black_elo <= max_elo)
        )
    )
    
    if excluded_ids:
        base_query = base_query.filter(Game.twic_issue.notin_(excluded_ids))

    def calculate_stats(games, is_white_pov=True):
        if not games: return []
        stats = {}
        for g in games:
            raw_name = g.opening
            eco_name = ECO_DICT.get(g.eco)
            if eco_name and "Queen's Pawn" not in eco_name and "King's Pawn" not in eco_name: 
                 opening_name = eco_name
            else:
                 opening_name = raw_name or eco_name or f"ECO {g.eco}"

            key = (g.eco, opening_name)
            if key not in stats:
                stats[key] = {"count": 0, "wins": 0, "draws": 0, "losses": 0}
            
            stats[key]["count"] += 1
            if g.result == "1-0":
                 stats[key]["wins" if is_white_pov else "losses"] += 1
            elif g.result == "0-1":
                 stats[key]["losses" if is_white_pov else "wins"] += 1
            else:
                 stats[key]["draws"] += 1
                 
        result_list = []
        for (eco, name), data in stats.items():
            total = data["count"]
            if total < 3: continue 
            
            win_rate = (data["wins"] / total) * 100
            loss_rate = (data["losses"] / total) * 100
            draw_rate = (data["draws"] / total) * 100
            score = (data["wins"] + 0.5 * data["draws"]) / total * 100
            
            result_list.append({
                "name": name,
                "eco": eco, 
                "total": total,
                "win_rate": round(win_rate, 1),
                "loss_rate": round(loss_rate, 1),
                "draw_rate": round(draw_rate, 1),
                "score": round(score, 1)
            })
            
        return sorted(result_list, key=lambda x: (x["win_rate"], x["total"]), reverse=True)[:15]

    # 1. e4 games
    e4_games = base_query.filter(Game.pgn.like("%\n1. e4%")).all()
    d4_games = base_query.filter(Game.pgn.like("%\n1. d4%")).all()
    all_white_games = base_query.all() 

    # --- INTELLIGENT GROUPING FOR WHITE E4 ---
    def get_best_responses_by_defense(games):
        defense_map = {
            "Sicilian (1... c5)":   [g for g in games if "1. e4 c5" in g.pgn],
            "French (1... e6)":     [g for g in games if "1. e4 e6" in g.pgn],
            "Caro-Kann (1... c6)":  [g for g in games if "1. e4 c6" in g.pgn],
            "1... e5 Response":     [g for g in games if "1. e4 e5" in g.pgn],
            "Pirc/Modern (d6/g6)":  [g for g in games if "1. e4 d6" in g.pgn or "1. e4 g6" in g.pgn]
        }
        
        best_responses = []
        
        for defense_name, defense_games in defense_map.items():
            if not defense_games: continue
            stats = calculate_stats(defense_games, is_white_pov=True)
            if stats:
                best_move = stats[0] 
                best_move["name"] = f"Best vs {defense_name.split(' ')[0]}: {best_move['name']}"
                best_responses.append(best_move)
        
        return sorted(best_responses, key=lambda x: x["win_rate"], reverse=True)

    # --- TREND DATA (Filtered by Elo!) ---
    # We want trends for the specific Elo range users are looking at
    # Re-use base_query to ensure consistent filtering
    # Note: We need a new query grouping by issue/eco, but applying the same filters
    
    # Extract IDs from base query to filter aggregate (safest way to keep filters sync)
    # OR better, duplicate the filter logic on a new query
    trend_query = db.query(Game.twic_issue, Game.eco, func.count(Game.id)).filter(
        or_(
            and_(Game.white_elo >= min_elo, Game.white_elo <= max_elo),
            and_(Game.black_elo >= min_elo, Game.black_elo <= max_elo)
        )
    ).group_by(Game.twic_issue, Game.eco)
    
    if excluded_ids:
        trend_query = trend_query.filter(Game.twic_issue.notin_(excluded_ids))
        
    trend_results = trend_query.all()
    
    # Aggregate by NAME instead of ECO to be user-friendly
    # e.g. A45 and A46 might both be "Queen's Pawn Game" -> sum them up
    aggregated_trends = {}
    
    for r in trend_results:
        issue = r[0]
        eco_code = r[1]
        count = r[2]
        
        if not eco_code: continue
        
        # Get readable name
        # Use ECO_DICT
        base_name = ECO_DICT.get(eco_code, eco_code)
        
        # User wants ECO in legend: "B90: Sicilian, Najdorf"
        # We use this full label as the key.
        # This effectively treats distinct ECOs as valid distinct trends, 
        # but gives them readable names.
        full_label = f"{eco_code}: {base_name}"
        
        key = (issue, full_label)
        aggregated_trends[key] = aggregated_trends.get(key, 0) + count

    # Convert back to list format for frontend
    # Use 'eco' field for the name to avoid breaking frontend logic that expects 'eco' key
    trend_data = [{"issue": k[0], "eco": k[1], "count": v} for k, v in aggregated_trends.items()]

    return {
        "white_e4": get_best_responses_by_defense(e4_games),
        "white_all": calculate_stats(all_white_games, is_white_pov=True),
        "black_vs_e4": calculate_stats(e4_games, is_white_pov=False),
        "black_vs_d4": calculate_stats(d4_games, is_white_pov=False),
        "popularity_trend": trend_data
    }

class PgnRequest(BaseModel):
    pgn: str

@app.post("/api/parse-pgn")
def parse_pgn_api(request: PgnRequest):
    """Professional PGN parser using python-chess to extract comments and variations"""
    pgn_text = request.pgn
    pgn_io = io.StringIO(pgn_text)
    game = chess.pgn.read_game(pgn_io)
    
    moves = []
    fens = []
    comments = {}
    variations = {}

    if not game:
        return {"moves": [], "fens": [], "comments": {}, "variations": {}}

    # Initial position comment
    root_fen = game.board().fen()
    if game.comment:
        comments[root_fen] = game.comment

    def traverse(node, is_main):
        current_board = node.board()
        for i, child in enumerate(node.variations):
            try:
                san = current_board.san(child.move)
                after_fen = child.board().fen()
                
                if is_main and i == 0:
                    moves.append(san)
                    fens.append(after_fen)
                    if child.comment: 
                        comments[after_fen] = child.comment
                    traverse(child, True)
                else:
                    # It's a variation (side branch)
                    parent_fen = current_board.fen()
                    if parent_fen not in variations: 
                        variations[parent_fen] = []
                    
                    # Store move in variations map
                    variations[parent_fen].append({
                        "san": san,
                        "fen": after_fen,
                        "parentFen": parent_fen
                    })
                    
                    if child.comment: 
                        comments[after_fen] = child.comment
                    traverse(child, False)
            except Exception as e:
                print(f"Error parsing child move: {e}")
                continue

    traverse(game, True)
    return {
        "moves": moves, 
        "fens": fens, 
        "comments": comments, 
        "variations": variations
    }

@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    """Get all distinct events from the database for filter dropdown"""
    events = db.query(Game.event).distinct().order_by(Game.event).all()
    return [e[0] for e in events if e[0]]

from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from stockfish import Stockfish

# Initialize Stockfish - assume it's in PATH after brew install
# If not, we might need to find it. brew install usually puts it in /opt/homebrew/bin/stockfish or /usr/local/bin/stockfish
def get_stockfish_path():
    paths = ["/opt/homebrew/bin/stockfish", "/usr/local/bin/stockfish", "/usr/bin/stockfish"]
    for p in paths:
        if os.path.exists(p):
            return p
    return "stockfish" # fallback to PATH

STOCKFISH_PATH = get_stockfish_path()

# Shared Stockfish instance for REST API to prevent process explosion
_shared_stockfish = None
_stockfish_lock = asyncio.Lock()

# REDUNDANT DUAL-ENGINE ARCHITECTURE
# Prevents preloading from blocking active user analysis
_stockfish_main = None
_stockfish_preload = None
_lock_main = asyncio.Lock()
_lock_preload = asyncio.Lock()

def get_engine(type="main"):
    global _stockfish_main, _stockfish_preload
    if type == "main":
        if _stockfish_main is None:
            # OPTIMIZATION: Lower depth to 12 for SNAPPY feedback, 14 was still laggy
            _stockfish_main = Stockfish(path=STOCKFISH_PATH, depth=12, parameters={"Threads": 6, "Hash": 256, "MultiPV": 3})
        return _stockfish_main
    else:
        if _stockfish_preload is None:
            _stockfish_preload = Stockfish(path=STOCKFISH_PATH, depth=10, parameters={"Threads": 2, "Hash": 64, "MultiPV": 3})
        return _stockfish_preload

@app.get("/api/analyze")
async def analyze_fen(fen: str, priority: str = "main"):
    """
    Analyze with dual-engine priority. 
    Main = Depth 16 (Current UI)
    Preload = Depth 10 (Background)
    """
    lock = _lock_main if priority == "main" else _lock_preload
    async with lock:
        try:
            stockfish = get_engine(priority)
            
            # Use to_thread for blocking calls
            # Clear hash to prevent stale info from previous deep searches
            await asyncio.to_thread(stockfish.set_fen_position, fen)
            
            # OPTIMIZATION: One search provides both top moves and the evaluation
            top_moves = await asyncio.to_thread(stockfish.get_top_moves, 3)
            
            if not top_moves:
                evaluation = {"type": "cp", "value": 0}
            else:
                best = top_moves[0]
                if best.get("Mate") is not None:
                    evaluation = {"type": "mate", "value": best["Mate"]}
                else:
                    evaluation = {"type": "cp", "value": best.get("Centipawn", 0)}
            
            is_black = " b " in fen
            if is_black:
                if evaluation["type"] == "cp": evaluation["value"] = -evaluation["value"]
                elif evaluation["type"] == "mate": evaluation["value"] = -evaluation["value"]
                for m in top_moves:
                    if m.get("Centipawn") is not None: m["Centipawn"] = -m["Centipawn"]
                    if m.get("Mate") is not None: m["Mate"] = -m["Mate"]
            
            return {"fen": fen, "eval": evaluation, "top_moves": top_moves}
        except Exception as e:
            print(f"Stockfish error ({priority}): {e}")
            # Reset engine on error
            global _stockfish_main, _stockfish_preload
            if priority == "main": _stockfish_main = None
            else: _stockfish_preload = None
            raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    stockfish = None
    try:
        # Each connection gets a stockfish instance with multi-PV enabled
        print(f"WebSocket: Connecting to Stockfish at {STOCKFISH_PATH}")
        stockfish = Stockfish(
            path=STOCKFISH_PATH, 
            depth=15,  # Reduced from 22 for faster real-time responses
            parameters={
                "Threads": 4,  # Reduced threads for stability
                "Hash": 256,   # Reduced hash for faster startup
                "MultiPV": 3   # Keep top 3 lines
            }
        )
        print("WebSocket: Stockfish initialized (depth=15, MultiPV=3)")
        
        last_fen = None  # Track last analyzed position to avoid duplicates
        
        while True:
            data = await websocket.receive_text()
            # Expecting FEN string
            fen = data.strip()
            
            # Skip if same position as last (prevents constant re-analysis)
            if fen and fen != last_fen:
                last_fen = fen
                try:
                    # Debug: log received FEN
                    print(f"[WS] Received FEN: {fen[:60]}...")
                    
                    stockfish.set_fen_position(fen)
                    
                    # Debug: Verify position was set
                    current_fen = stockfish.get_fen_position()
                    print(f"[WS] Stockfish FEN after set: {current_fen[:60]}...")
                    
                    # Get evaluation
                    # stockfish.get_evaluation() returns relative to side-to-move.
                    # stockfish.get_top_moves() also returns relative to side-to-move.
                    
                    evaluation = stockfish.get_evaluation()
                    top_moves = stockfish.get_top_moves(3)
                    
                    # Standardize to ABSOLUTE perspective
                    is_black = " b " in fen
                    if is_black:
                        if evaluation["type"] == "cp":
                            evaluation["value"] = -evaluation["value"]
                        elif evaluation["type"] == "mate":
                            evaluation["value"] = -evaluation["value"]
                        
                        for move in top_moves:
                            if move.get("Centipawn") is not None:
                                move["Centipawn"] = -move["Centipawn"]
                            if move.get("Mate") is not None:
                                move["Mate"] = -move["Mate"]

                    # Debug: log evaluation results
                    print(f"[WS] Eval (Abs): {evaluation}, Top move: {top_moves[0] if top_moves else 'None'}")
                    
                    response = {
                        "fen": fen,
                        "eval": evaluation,
                        "top_moves": top_moves,
                        "best_move": top_moves[0]["Move"] if top_moves else None,
                        "turn": fen.split(' ')[1] if ' ' in fen else 'w' # Explicitly send whose turn it is
                    }
                    await websocket.send_json(response)
                except Exception as e:
                    print(f"Stockfish analysis error: {e}")
                    await websocket.send_json({"fen": fen, "error": str(e)})
    except WebSocketDisconnect:
        print("Client disconnected normally")
    except Exception as e:
        print(f"WS Error: {e}")
        # Only try to close if not already closed
        try:
             if websocket.client_state != 3: # 3 = DISCONNECTED
                 await websocket.close()
        except:
             pass
    finally:
        if stockfish:
            del stockfish


# --- Repertoire API Endpoints ---

class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None
    color: str = 'neon-lime'

@app.get("/api/repertoire/folders")
def get_repertoire_folders(db: Session = Depends(get_db)):
    # Simple flat list for now, frontend builds tree
    return db.query(RepertoireFolder).all()

@app.post("/api/repertoire/folders")
def create_repertoire_folder(folder: FolderCreate, db: Session = Depends(get_db)):
    new_folder = RepertoireFolder(
        name=folder.name,
        parent_id=folder.parent_id,
        color=folder.color,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder

@app.put("/api/repertoire/folder/{folder_id}")
def update_repertoire_folder(folder_id: int, folder: FolderCreate, db: Session = Depends(get_db)):
    f = db.query(RepertoireFolder).filter(RepertoireFolder.id == folder_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Folder not found")
    f.name = folder.name
    f.color = folder.color
    db.commit()
    return f

class GameSave(BaseModel):
    id: Optional[int] = None
    folder_id: int
    title: str
    white: Optional[str] = None
    black: Optional[str] = None
    white_elo: Optional[str] = None
    black_elo: Optional[str] = None
    event: Optional[str] = None
    pgn: str
    fen: Optional[str] = None
    is_flashcard: bool = False
    arrows: list = [] # JSON list of arrows
    orientation: Optional[str] = 'white'
    tags: Optional[str] = None # comma separated

@app.post("/api/repertoire/save")
def save_repertoire_game(payload: GameSave, db: Session = Depends(get_db)):
    import json
    
    # Check if update
    if payload.id:
        existing_game = db.query(RepertoireGame).filter(RepertoireGame.id == payload.id).first()
        if existing_game:
            existing_game.title = payload.title
            existing_game.white = payload.white
            existing_game.black = payload.black
            existing_game.white_elo = payload.white_elo
            existing_game.black_elo = payload.black_elo
            existing_game.event = payload.event
            existing_game.pgn = payload.pgn
            existing_game.fen = payload.fen
            existing_game.is_flashcard = 1 if payload.is_flashcard else 0
            existing_game.arrows_json = json.dumps(payload.arrows) if payload.arrows else None
            existing_game.orientation = payload.orientation if payload.orientation else 'white'
            existing_game.tags = payload.tags
            # update folder if changed? let's assume yes
            existing_game.folder_id = payload.folder_id
            
            db.commit()
            db.refresh(existing_game)
            return {"status": "success", "id": existing_game.id, "message": "Game updated"}
            
    # Create new
    new_game = RepertoireGame(
        folder_id=payload.folder_id,
        title=payload.title,
        white=payload.white,
        black=payload.black,
        white_elo=payload.white_elo,
        black_elo=payload.black_elo,
        event=payload.event,
        pgn=payload.pgn,
        fen=payload.fen,
        is_flashcard=1 if payload.is_flashcard else 0,
        arrows_json=json.dumps(payload.arrows) if payload.arrows else None,
        orientation=payload.orientation if payload.orientation else 'white',
        tags=payload.tags,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    return {"status": "success", "id": new_game.id, "message": "Game created"}

@app.get("/api/repertoire/folder/{folder_id}")
def get_folder_contents(folder_id: int, db: Session = Depends(get_db)):
    games = db.query(RepertoireGame).filter(RepertoireGame.folder_id == folder_id).order_by(RepertoireGame.id.desc()).all()
    # Decode arrows json
    import json
    result = []
    for g in games:
        # Manually construct dict to avoid serialization issues
        g_dict = {
            "id": g.id,
            "folder_id": g.folder_id,
            "title": g.title,
            "white": g.white,
            "black": g.black,
            "white_elo": g.white_elo,
            "black_elo": g.black_elo,
            "event": g.event,
            "pgn": g.pgn,
            "fen": g.fen,
            "is_flashcard": g.is_flashcard,
            "orientation": g.orientation or 'white',
            "tags": g.tags,
            "created_at": g.created_at
        }
        if g.arrows_json:
            try:
                g_dict['arrows'] = json.loads(g.arrows_json)
            except:
                g_dict['arrows'] = []
        else:
            g_dict['arrows'] = []
        result.append(g_dict)
    return result

@app.put("/api/games/{game_id}/study")
def mark_game_as_study(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game.is_personal = 1
    db.commit()
    return {"status": "success", "message": "Marked as study"}

@app.get("/api/repertoire/flashcards")
def get_all_flashcards(db: Session = Depends(get_db)):
    games = db.query(RepertoireGame).filter(RepertoireGame.is_flashcard == 1).order_by(RepertoireGame.id.desc()).all()
    import json
    result = []
    for g in games:
        g_dict = {
            "id": g.id,
            "folder_id": g.folder_id,
            "title": g.title,
            "white": g.white,
            "black": g.black,
            "white_elo": g.white_elo,
            "black_elo": g.black_elo,
            "event": g.event,
            "pgn": g.pgn,
            "fen": g.fen,
            "is_flashcard": g.is_flashcard,
            "orientation": g.orientation or 'white',
            "tags": g.tags,
            "created_at": g.created_at,
            "arrows": json.loads(g.arrows_json) if g.arrows_json else []
        }
        result.append(g_dict)
    return result

@app.delete("/api/repertoire/game/{game_id}")
def delete_repertoire_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(RepertoireGame).filter(RepertoireGame.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    db.delete(game)
    db.commit()
    return {"status": "success", "message": "Game deleted"}

@app.put("/api/repertoire/game/{game_id}/move")
def move_repertoire_game(game_id: int, target_folder_id: int, db: Session = Depends(get_db)):
    game = db.query(RepertoireGame).filter(RepertoireGame.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Verify folder exists
    folder = db.query(RepertoireFolder).filter(RepertoireFolder.id == target_folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Target folder not found")
    
    game.folder_id = target_folder_id
    db.commit()
    return {"status": "success", "message": "Game moved"}

@app.get("/api/repertoire/folder/{folder_id}/export")
def export_folder_pgn(folder_id: int, db: Session = Depends(get_db)):
    games = db.query(RepertoireGame).filter(RepertoireGame.folder_id == folder_id).all()
    if not games:
        return {"pgn": ""}
    
    combined_pgn = ""
    for g in games:
        combined_pgn += g.pgn + "\n\n"
    
    return {"pgn": combined_pgn, "filename": f"repertoire_folder_{folder_id}.pgn"}

@app.delete("/api/repertoire/folder/{folder_id}")
def delete_folder(folder_id: int, db: Session = Depends(get_db)):
    # Check if folder exists
    folder = db.query(RepertoireFolder).filter(RepertoireFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check for subfolders - prevent delete if not empty (safe mode)
    sub = db.query(RepertoireFolder).filter(RepertoireFolder.parent_id == folder_id).first()
    if sub:
        raise HTTPException(status_code=400, detail="Folder contains subfolders. Please delete them first.")

    # Delete all games within this folder
    db.query(RepertoireGame).filter(RepertoireGame.folder_id == folder_id).delete()
    
    # Delete the folder itself
    db.delete(folder)
    db.commit()
    
    return {"status": "success", "message": "Folder deleted"}

# ==========================================
# Serve Frontend Static Files
# ==========================================

import sys
if getattr(sys, 'frozen', False):
    # If the application is run as a bundle, the PyInstaller bootloader
    # extends the sys module by a flag frozen=True and sets the app 
    # path into variable _MEIPASS'.
    frontend_dist = os.path.join(sys._MEIPASS, "frontend_dist")
else:
    frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="frontend_assets")
    
    # Also mount any other directories in dist if needed, like macbase DB or things in public folder
    
    # Serve index.html for root path specifically
    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    # Catch-all route to serve the React SPA for any non-API routes
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        
        # If the requested file exists (like favicon.ico, vite.svg), serve it directly
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise, return the index.html for client-side routing
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import threading
    import webbrowser
    import time
    
    def open_browser():
        time.sleep(2)
        webbrowser.open("http://127.0.0.1:8000")
        
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000)
