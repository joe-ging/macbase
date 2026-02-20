import { describe, it, expect } from 'vitest';
import { convertUciToSan, formatEval } from '../data/chessUtils';

describe('convertUciToSan', () => {
    const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    it('converts e2e4 to e4 from starting position', () => {
        expect(convertUciToSan('e2e4', STARTING_FEN)).toBe('e4');
    });

    it('converts d2d4 to d4 from starting position', () => {
        expect(convertUciToSan('d2d4', STARTING_FEN)).toBe('d4');
    });

    it('converts g1f3 to Nf3 from starting position', () => {
        expect(convertUciToSan('g1f3', STARTING_FEN)).toBe('Nf3');
    });

    it('returns raw UCI if FEN is null', () => {
        expect(convertUciToSan('e2e4', null)).toBe('e2e4');
    });

    it('returns raw UCI if move is null', () => {
        expect(convertUciToSan(null, STARTING_FEN)).toBeNull();
    });

    it('handles invalid FEN gracefully', () => {
        const result = convertUciToSan('e2e4', 'invalid-fen');
        expect(result).toBe('e2e4'); // Falls back to raw UCI
    });
});

describe('formatEval', () => {
    it('formats positive centipawn evaluation', () => {
        const result = formatEval({ Centipawn: 150, Mate: null });
        expect(result).toBe('+1.50');
    });

    it('formats negative centipawn evaluation', () => {
        const result = formatEval({ Centipawn: -200, Mate: null });
        expect(result).toBe('-2.00');
    });

    it('formats zero evaluation', () => {
        const result = formatEval({ Centipawn: 0, Mate: null });
        expect(result).toBe('+0.00');
    });

    it('formats mate for white', () => {
        const result = formatEval({ Centipawn: null, Mate: 3 });
        expect(result).toBe('M+3');
    });

    it('formats mate for black', () => {
        const result = formatEval({ Centipawn: null, Mate: -2 });
        expect(result).toBe('M-2');
    });

    it('returns empty string for null input', () => {
        expect(formatEval(null)).toBe('');
    });

    it('returns empty string for undefined input', () => {
        expect(formatEval(undefined)).toBe('');
    });
});
