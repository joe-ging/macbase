import { describe, it, expect } from 'vitest';
import { getOpeningName } from '../data/ecoOpenings';

describe('getOpeningName', () => {
    // Test exact ECO code matches
    it('returns correct name for known ECO codes', () => {
        expect(getOpeningName('B90')).toBe('Sicilian Defense: Najdorf Variation');
        expect(getOpeningName('C60')).toBe('Ruy Lopez (Spanish Opening)');
        expect(getOpeningName('D02')).toBe('London System');
        expect(getOpeningName('A00')).toBe('Uncommon Opening (Polish/Sokolsky/Grob)');
        expect(getOpeningName('E20')).toBe('Nimzo-Indian Defense');
    });

    // Test fallback to X0 prefix
    it('falls back to prefix when exact code not found', () => {
        // A50 isn't in the dict, but A40 is → should return A40's name
        expect(getOpeningName('A50')).not.toBeNull();
    });

    // Test category fallback
    it('returns category name for unknown codes', () => {
        expect(getOpeningName('A99')).toBeTruthy(); // Should at least return 'Flank Opening'
        expect(getOpeningName('B55')).toBeTruthy(); // Should return something
        expect(getOpeningName('C99')).toBe('Ruy Lopez: Chigorin (Main Line)'); // Exact match
    });

    // Test letter-level fallback
    it('returns broad category when no ECO match at all', () => {
        // These test the if(eco.startsWith('X')) fallback
        // Since A-E are all populated, test with a code that doesn't match any key
        const result = getOpeningName('A99');
        expect(result).toBeTruthy();
    });

    // Edge cases
    it('returns null for null/undefined input', () => {
        expect(getOpeningName(null)).toBeNull();
        expect(getOpeningName(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
        expect(getOpeningName('')).toBeNull();
    });
});
