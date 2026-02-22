import sys
import os

APP_JSX = "frontend/src/App.jsx"
ANALYSIS_JSX = "frontend/src/pages/Analysis.jsx"

def toggle_frontend(mode):
    if not os.path.exists(APP_JSX):
        print(f"Error: {APP_JSX} not found")
        return

    with open(APP_JSX, "r") as f:
        content = f.read()

    if mode == "pro":
        # Point to /pro/ versions
        content = content.replace("import Insights from './pages/Insights';", "import Insights from './pro/Insights';")
        content = content.replace("import Repertoire from './pages/Repertoire';", "import Repertoire from './pro/Repertoire';")
        content = content.replace("import Analysis from './pages/Analysis';", "import Analysis from './pro/Analysis';")
        print("✅ Frontend: Switched to PRO Mode (Private Logic)")
    else:
        # Point to /pages/ versions
        content = content.replace("import Insights from './pro/Insights';", "import Insights from './pages/Insights';")
        content = content.replace("import Repertoire from './pro/Repertoire';", "import Repertoire from './pages/Repertoire';")
        content = content.replace("import Analysis from './pro/Analysis';", "import Analysis from './pages/Analysis';")
        print("✅ Frontend: Switched to CORE Mode (Public/Promotional)")

    with open(APP_JSX, "w") as f:
        f.write(content)

    # Handle Analysis component's Chessboard import
    if os.path.exists(ANALYSIS_JSX):
        with open(ANALYSIS_JSX, "r") as f:
            ana_content = f.read()
        
        if mode == "pro":
            ana_content = ana_content.replace(
                "import InteractiveChessboard from '../components/InteractiveChessboard';",
                "import InteractiveChessboard from '../pro/InteractiveChessboard';"
            )
        else:
            ana_content = ana_content.replace(
                "import InteractiveChessboard from '../pro/InteractiveChessboard';",
                "import InteractiveChessboard from '../components/InteractiveChessboard';"
            )
        
        with open(ANALYSIS_JSX, "w") as f:
            f.write(ana_content)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python toggle_pro.py [pro|core]")
    else:
        target_mode = sys.argv[1].lower()
        toggle_frontend(target_mode)
