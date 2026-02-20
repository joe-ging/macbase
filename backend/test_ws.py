import websocket
import json
import time

def on_message(ws, message):
    data = json.loads(message)
    print(f"Received Eval for {data.get('fen')[:20]}...")
    print(f"Main Eval: {data.get('eval')}")
    if data.get('top_moves'):
        top = data.get('top_moves')[0]
        print(f"Top Move: {top.get('Move')} Score: {top.get('Centipawn')} Mate: {top.get('Mate')}")
    ws.close()

def on_error(ws, error):
    print(error)

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")

def on_open(ws):
    print("Opened connection")
    # Send a tactical FEN where White has a winning attack
    # Position: White to move, mate in 2. (r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4) - Scholar's Mate threat pattern
    # Better one: r1b2rk1/pp1p1pp1/1b1p2B1/n2Q2p1/8/5N2/P4PPP/4R1K1 w - - 0 1 (White mates in 3)
    fen = "r1b2rk1/pp1p1pp1/1b1p2B1/n2Q2p1/8/5N2/P4PPP/4R1K1 w - - 0 1"
    ws.send(fen)

if __name__ == "__main__":
    # websocket-client needs to be installed
    # pip install websocket-client
    ws = websocket.WebSocketApp("ws://localhost:8000/ws/analyze",
                              on_open=on_open,
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close)
    ws.run_forever()
