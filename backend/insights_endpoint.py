
@app.get("/api/insights")
def get_insights(min_elo: int = 1700, max_elo: int = 2000, db: Session = Depends(get_db)):
    """
    Detailed insights for a specific Elo range.
    Returns opening stats for White and Black.
    """
    # Exclude disallowed issues
    excluded_issues = db.query(ExcludedIssue.twic_issue).all()
    excluded_ids = [e[0] for e in excluded_issues]

    base_query = db.query(Game).filter(
        Game.white_elo >= min_elo,
        Game.white_elo <= max_elo,
        Game.black_elo >= min_elo,
        Game.black_elo <= max_elo
    )
    
    if excluded_ids:
        base_query = base_query.filter(Game.twic_issue.notin_(excluded_ids))

    # Helper to calculate stats
    def calculate_stats(games, is_white_pov=True):
        if not games: 
            return []
            
        # Group by ECO (or opening name if available and clean)
        # Using ECO for now as it's more standardized in this DB
        stats = {}
        for g in games:
            key = g.eco or "Unclassified"
            # Try to get a better name if possible, maybe first word of opening? 
            # But kept simple for now.
            
            if key not in stats:
                stats[key] = {"count": 0, "wins": 0, "draws": 0, "losses": 0, "opening_name": g.opening}
            
            stats[key]["count"] += 1
            if g.result == "1-0":
                 stats[key]["wins" if is_white_pov else "losses"] += 1
            elif g.result == "0-1":
                 stats[key]["losses" if is_white_pov else "wins"] += 1
            else:
                 stats[key]["draws"] += 1
                 
        # Format as list
        result_list = []
        for eco, data in stats.items():
            total = data["count"]
            if total < 5: continue # Filter out very rare ones
            
            win_rate = (data["wins"] / total) * 100
            draw_rate = (data["draws"] / total) * 100
            loss_rate = (data["losses"] / total) * 100
            score = (data["wins"] + 0.5 * data["draws"]) / total * 100 # Standard chess score %
            
            result_list.append({
                "eco": eco,
                "name": data["opening_name"],
                "total": total,
                "win_rate": round(win_rate, 1),
                "draw_rate": round(draw_rate, 1),
                "loss_rate": round(loss_rate, 1),
                "score": round(score, 1)
            })
            
        # Sort by count (popularity) by default
        return sorted(result_list, key=lambda x: x["total"], reverse=True)

    # 1. White Openings (1. e4 vs others)
    # We filter by PGN to separate 1. e4 from 1. d4 etc.
    white_e4_games = base_query.filter(Game.pgn.ilike("1. e4%")).all()
    white_d4_games = base_query.filter(Game.pgn.ilike("1. d4%")).all()
    
    white_e4_stats = calculate_stats(white_e4_games, is_white_pov=True)
    # white_d4_stats = calculate_stats(white_d4_games, is_white_pov=True) # Optional if user wants d4 insights too

    # 2. Black vs 1. e4
    black_vs_e4_games = base_query.filter(Game.pgn.ilike("1. e4%")).all()
    black_vs_e4_stats = calculate_stats(black_vs_e4_games, is_white_pov=False)

    # 3. Black vs 1. d4
    black_vs_d4_games = base_query.filter(Game.pgn.ilike("1. d4%")).all()
    black_vs_d4_stats = calculate_stats(black_vs_d4_games, is_white_pov=False)

    return {
        "white_e4": white_e4_stats[:10], # Top 10 popularity
        "black_vs_e4": black_vs_e4_stats[:10],
        "black_vs_d4": black_vs_d4_stats[:10]
    }
