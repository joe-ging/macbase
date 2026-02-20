import React, { useMemo } from 'react';
import { Chess } from 'chess.js';

const PIECE_IMAGES = {
    'wK': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/wK.svg',
    'wQ': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/wQ.svg',
    'wR': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/wR.svg',
    'wB': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/wB.svg',
    'wN': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/wN.svg',
    'wP': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/wP.svg',
    'bK': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/bK.svg',
    'bQ': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/bQ.svg',
    'bR': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/bR.svg',
    'bB': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/bB.svg',
    'bN': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/bN.svg',
    'bP': 'https://lichess1.org/assets/_Q2Pa3v/piece/cburnett/bP.svg',
};

const MiniChessboard = ({ fen, orientation = 'white', arrowColor = 'G' }) => {
    const boardState = useMemo(() => {
        try {
            const game = new Chess(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            return game.board(); // 8x8 array: [rank8_array, rank7_array, ... rank1_array]
        } catch (e) {
            console.error("Invalid FEN for MiniChessboard:", fen);
            return new Chess().board();
        }
    }, [fen]);

    // Define visual order of rows and cols based on orientation
    // If White: Top row is Rank 8 (index 0). Cols left to right 0..7
    // If Black: Top row is Rank 1 (index 7). Cols left to right 7..0
    const rows = orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const cols = orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(8, 1fr)',
            width: '100%',
            aspectRatio: '1',
            position: 'relative',
            userSelect: 'none'
        }}>
            {rows.map((rowIdx, rI) => (
                cols.map((colIdx, cI) => {
                    const square = boardState[rowIdx][colIdx];
                    const isLight = (rowIdx + colIdx) % 2 === 0;

                    // Theme colors matching the Analysis board (Standard Lichess-like)
                    const bg = isLight ? '#dee3e6' : '#8ca2ad';

                    return (
                        <div key={`${rowIdx}-${colIdx}`} style={{
                            backgroundColor: bg,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {square && (
                                <img
                                    src={PIECE_IMAGES[`${square.color}${square.type.toUpperCase()}`]}
                                    alt={`${square.color}${square.type}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            )}
                        </div>
                    );
                })
            ))}
        </div>
    );
};

export default MiniChessboard;
