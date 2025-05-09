import {findIdByFuzzyName, jaroWinklerDistance} from '../match';
import {InsuranceMatch} from '@/types/insurance';

describe('String Matching Algorithm', () => {
    describe('jaroWinklerDistance', () => {
        it('should return 1.0 for identical strings', () => {
            expect(jaroWinklerDistance('test', 'test')).toBe(1.0);
            expect(jaroWinklerDistance('COMPANY', 'COMPANY')).toBe(1.0);
        });

        it('should be case insensitive', () => {
            expect(jaroWinklerDistance('Test', 'test')).toBe(1.0);
            expect(jaroWinklerDistance('COMPANY', 'company')).toBe(1.0);
        });

        it('should return 0.0 for empty strings', () => {
            expect(jaroWinklerDistance('', 'test')).toBe(0.0);
            expect(jaroWinklerDistance('test', '')).toBe(0.0);
            expect(jaroWinklerDistance('', '')).toBe(0.0);
        });

        it('should handle similar strings with high scores', () => {
            expect(jaroWinklerDistance('MARTHA', 'MARHTA')).toBeGreaterThan(0.9);
            expect(jaroWinklerDistance('DIXON', 'DICKSONX')).toBeGreaterThan(0.8);
        });

        it('should handle completely different strings with low scores', () => {
            expect(jaroWinklerDistance('ABCD', 'WXYZ')).toBeLessThan(0.5);
            expect(jaroWinklerDistance('HELLO', 'WORLD')).toBeLessThan(0.5);
        });

        it('should handle very long strings', () => {
            const longString1 = 'ThisIsAVeryLongStringThatWeWillUseForTestingPurposesAndItShouldBeHandledCorrectlyByTheAlgorithm';
            const longString2 = 'ThisIsAVeryLongStringThatWeWillUseForTestingPurposesAndItShouldBeHandledCorrectlyByTheAlgorithmWithSomeExtraText';
            expect(jaroWinklerDistance(longString1, longString2)).toBeGreaterThan(0.8);
        });

        it('should handle strings with repeated characters', () => {
            expect(jaroWinklerDistance('aaaaaa', 'aaaaab')).toBeGreaterThan(0.9);
            expect(jaroWinklerDistance('aaaaaa', 'bbbbbb')).toBeLessThan(0.5);
        });

        it('should handle special characters', () => {
            expect(jaroWinklerDistance('!@#$%', '!@#$%')).toBe(1.0);
            expect(jaroWinklerDistance('!@#$%', '#@!$%')).toBeGreaterThan(0.7);
        });

        it('should handle unicode characters', () => {
            expect(jaroWinklerDistance('café', 'cafe')).toBeGreaterThan(0.8);
            expect(jaroWinklerDistance('über', 'uber')).toBeGreaterThan(0.8);
        });
    });

    describe('findIdByFuzzyName', () => {
        it('should return null for empty input', () => {
            expect(findIdByFuzzyName('')).toBeNull();
        });

        it('should find exact matches', () => {
            const result = findIdByFuzzyName('Riley HealthCare LLC');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBe(1.0);
        });

        it('should find matches with slight variations', () => {
            const result = findIdByFuzzyName('Riley Healthcare LLC');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBeGreaterThan(0.8);
        });

        it('should handle case insensitive matching', () => {
            const result = findIdByFuzzyName('riley healthcare llc');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBeGreaterThan(0.8);
        });

        it('should return null for no matches above threshold', () => {
            const result = findIdByFuzzyName('Non Existent Company XYZ');
            expect(result).toBeNull();
        });

        it('should respect custom threshold', () => {
            // With default threshold (0.8)
            const result1 = findIdByFuzzyName('Riley Healthcare');
            expect(result1).not.toBeNull();

            // With higher threshold
            const result2 = findIdByFuzzyName('Riley Healthcare', 0.99);
            expect(result2).toBeNull();
        });

        it('should find best match when multiple matches exist', () => {
            const result = findIdByFuzzyName('Riley HealthCare');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBeGreaterThan(0.8);
        });

        it('should handle special characters and spaces', () => {
            const result = findIdByFuzzyName('Riley-HealthCare, LLC');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBeGreaterThan(0.8);
        });

        it('should handle company suffixes in different formats', () => {
            // Test LLC vs Limited
            const result1 = findIdByFuzzyName('Evergreen Farms Limited');
            expect(result1).not.toBeNull();
            expect(result1?.insured.internalId).toBe('I9J0'); // Should match "Evergreen Farms Ltd."

            // Test Corp vs Corporation
            const result2 = findIdByFuzzyName('Beacon Financial Services Corporation');
            expect(result2).not.toBeNull();
            expect(result2?.insured.internalId).toBe('K1L2'); // Should match "Beacon Financial Services Corp"
        });

        it('should handle numbers in company names', () => {
            // Add a test company with numbers to INSUREDS first
            const result = findIdByFuzzyName('Urban Grid Construction 2');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('F5H6'); // Should match "Urban Grid Construction"
            expect(result?.score).toBeGreaterThan(0.8);
        });

        it('should handle partial company names', () => {
            const result = findIdByFuzzyName('Riley Health');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBeGreaterThan(0.8);
        });

        it('should handle companies with common prefixes', () => {
            // Both "Blue Ridge Hospitality Partners" and similar names
            const result = findIdByFuzzyName('Blue Ridge Management');
            expect(result?.insured.internalId).toBe('W3X4'); // Should match "Blue Ridge Hospitality Partners"
            expect(result?.score).toBeGreaterThan(0.8);
        });

        it('should handle whitespace variations', () => {
            const result = findIdByFuzzyName('   Riley    HealthCare    LLC   ');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBeGreaterThan(0.9);
        });

        it('should handle mixed case and special characters', () => {
            const result = findIdByFuzzyName('RILEY healthcare & LLC');
            expect(result).not.toBeNull();
            expect(result?.insured.internalId).toBe('A1B2');
            expect(result?.score).toBeGreaterThan(0.8);
        });
    });
}); 