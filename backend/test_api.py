import requests
import time

BASE_URL = "http://localhost:8000"

def test_root():
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"Root: {r.json()}")
    except Exception as e:
        print(f"Root failed: {e}")

def test_fetch_twic():
    # Trying a known older issue to avoid 404 if latest isn't out
    # TWIC 1500 is safe
    issue = 1500
    print(f"Fetching TWIC {issue}...")
    try:
        r = requests.post(f"{BASE_URL}/api/fetch-twic/{issue}")
        print(f"Fetch Result: {r.json()}")
    except Exception as e:
        print(f"Fetch failed: {e}")

def test_get_games():
    print("Getting games...")
    try:
        r = requests.get(f"{BASE_URL}/api/games?limit=5")
        games = r.json()
        print(f"Got {len(games)} games")
        if len(games) > 0:
            print(f"Sample game: {games[0]['white']} vs {games[0]['black']}")
    except Exception as e:
        print(f"Get Games failed: {e}")

if __name__ == "__main__":
    # Wait for server to start roughly
    print("Waiting for server...")
    time.sleep(2) 
    test_root()
    test_fetch_twic()
    test_get_games()
