import React from 'react';
import { Chess } from 'chess.js';
import { convertUciToSan, formatEval } from '../data/chessUtils';

// Engine Lines Panel Component - shows evaluations from WHITE's perspective
const EngineLinesPanel = ({ topMoves, isConnected, currentFen }) => {
    // Determine whose turn from FEN
    const isBlackToMove = currentFen && currentFen.split(' ')[1] === 'b';

    // Use pre-calculated SAN if available, otherwise fallback
    const getDisplayMove = (move) => {
        if (move.San) return move.San;
        if (!move.Move || !currentFen) return move.Move || '';
        return convertUciToSan(move.Move, currentFen);
    };

    // Check for game-over states using chess.js
    let gameOverMessage = null;
    try {
        const game = new Chess(currentFen);
        if (game.isCheckmate()) {
            gameOverMessage = isBlackToMove ? 'Checkmate - White wins' : 'Checkmate - Black wins';
        } else if (game.isStalemate()) {
            gameOverMessage = 'Stalemate - Draw';
        } else if (game.isDraw()) {
            gameOverMessage = 'Draw';
        }
    } catch (e) {
        // Invalid FEN, ignore
    }

    if (!isConnected) {
        return (
            <div style={{ padding: '12px', backgroundColor: '#334155', borderRadius: '6px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Engine disconnected</div>
            </div>
        );
    }

    // Show game-over message if applicable
    if (gameOverMessage) {
        return (
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-yellow)' }}>{gameOverMessage}</div>
            </div>
        );
    }

    if (!topMoves || topMoves.length === 0) {
        return (
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Analyzing...</div>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--neon-lime-muted)', fontSize: '11px', fontWeight: '700', color: 'var(--neon-lime)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border-subtle)' }}>
                BRAIN ANALYSIS
            </div>
            {topMoves.map((move, idx) => {
                // Now absolute from both Lichess and Backend
                const cpFromWhite = move.Centipawn || 0;
                const mateFromWhite = move.Mate || 0;
                const isWhiteBetter = cpFromWhite > 0 || mateFromWhite > 0;

                return (
                    <div
                        key={idx}
                        style={{
                            padding: '10px 16px',
                            borderBottom: idx < topMoves.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{
                            minWidth: '50px',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: isWhiteBetter ? 'var(--neon-lime)' : '#ff4444'
                        }}>
                            {formatEval(move, isBlackToMove)}
                        </span>
                        <span style={{
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace'
                        }}>
                            {getDisplayMove(move)}
                        </span>
                        {move.Line && (
                            <span style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {move.Line.slice(0, 5).join(' ')}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default EngineLinesPanel;
