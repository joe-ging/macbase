import React from 'react';
import { Chess } from 'chess.js';

// Eval Bar Component - uses best move from topMoves for accurate deep evaluation
// Shows evaluation from WHITE's perspective (positive = white is better)
const EvalBar = ({ topMoves, isConnected, currentFen }) => {
    let whitePercent = 50;
    let evalText = '0.0';

    // Check for checkmate using chess.js
    const isBlackToMove = currentFen && currentFen.split(' ')[1] === 'b';
    let isCheckmate = false;
    try {
        const game = new Chess(currentFen);
        if (game.isCheckmate()) {
            isCheckmate = true;
            whitePercent = isBlackToMove ? 100 : 0;
            evalText = isBlackToMove ? '#' : '#';
        }
    } catch (e) {
        // Invalid FEN, ignore
    }

    // Get evaluation from the best move (first in topMoves array)
    const bestMove = topMoves && topMoves.length > 0 ? topMoves[0] : null;

    if (!isCheckmate && bestMove) {
        if (bestMove.Mate !== null && bestMove.Mate !== undefined) {
            let mateFromWhitePerspective = bestMove.Mate;
            whitePercent = mateFromWhitePerspective > 0 ? 100 : 0;
            evalText = `M${mateFromWhitePerspective > 0 ? '+' : ''}${mateFromWhitePerspective}`;
        } else if (bestMove.Centipawn !== null && bestMove.Centipawn !== undefined) {
            let cpFromWhitePerspective = bestMove.Centipawn;
            const cp = cpFromWhitePerspective / 100;
            evalText = (cp >= 0 ? '+' : '') + cp.toFixed(1);
            whitePercent = 50 + (50 * (2 / (1 + Math.exp(-cp * 0.5)) - 1));
            whitePercent = Math.max(5, Math.min(95, whitePercent));
        }
    }

    return (
        <div style={{
            width: '28px',
            height: '100%',
            backgroundColor: 'var(--bg-dark)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--border-subtle)'
        }}>
            <div style={{ flex: `${100 - whitePercent}`, backgroundColor: 'var(--bg-dark)', transition: 'flex 0.5s ease' }} />
            <div style={{ flex: `${whitePercent}`, backgroundColor: 'var(--neon-lime)', transition: 'flex 0.5s ease', boxShadow: '0 0 10px var(--neon-lime-glow)' }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                fontSize: '11px',
                fontWeight: '700',
                color: whitePercent > 50 ? '#000' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
                textShadow: whitePercent > 50 ? 'none' : '0 0 4px rgba(0,0,0,0.5)',
                opacity: isConnected && topMoves.length > 0 ? 1 : 0.5,
                animation: isConnected && topMoves.length === 0 ? 'pulse 1.5s infinite' : 'none'
            }}>
                {isConnected ? evalText : '...'}
            </div>
        </div>
    );
};

export default EvalBar;
