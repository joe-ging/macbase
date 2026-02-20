import { Chess } from 'chess.js';

// Lichess CBurnett piece set URLs
export const PIECE_IMAGES = {
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

// Helper: Convert UCI (e2e4) to SAN (e4) for a specific FEN
export const convertUciToSan = (uciMove, fen) => {
    if (!uciMove || !fen || fen === 'start') return uciMove;
    try {
        const game = new Chess(fen);
        const from = uciMove.slice(0, 2);
        const to = uciMove.slice(2, 4);
        const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
        const move = game.move({ from, to, promotion });
        return move ? move.san : uciMove;
    } catch (e) {
        return uciMove;
    }
};

// Format eval for display - shows from WHITE's perspective
export const formatEval = (move, isBlackToMove = false) => {
    if (!move) return '';
    if (move.Mate !== null && move.Mate !== undefined) {
        const mateFromWhite = move.Mate;
        return `M${mateFromWhite > 0 ? '+' : ''}${mateFromWhite}`;
    }
    if (move.Centipawn !== null && move.Centipawn !== undefined) {
        const cpFromWhite = move.Centipawn;
        const cp = cpFromWhite / 100;
        return (cp >= 0 ? '+' : '') + cp.toFixed(2);
    }
    return '';
};
