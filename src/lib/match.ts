import {InsuranceMatch, Insured} from "@/types/insurance";

export const INSUREDS: Insured[] = [
    {internalId: "A1B2", name: "Riley HealthCare LLC"},
    {internalId: "C3D4", name: "Quail Creek RE LLC"},
    {internalId: "E5F6", name: "William James Group LLC"},
    {internalId: "G7H8", name: "Northstar Logistics Inc."},
    {internalId: "I9J0", name: "Evergreen Farms Ltd."},
    {internalId: "K1L2", name: "Beacon Financial Services Corp"},
    {internalId: "M3N4", name: "Hudson Valley Medical Partners"},
    {internalId: "O5P6", name: "Sierra Manufacturing Co."},
    {internalId: "Q7R8", name: "Lakeside Property Holdings, LLC"},
    {internalId: "S9T0", name: "Atlas Retail Group, Inc."},
    {internalId: "U1V2", name: "Pioneer Energy Solutions"},
    {internalId: "W3X4", name: "Blue Ridge Hospitality Partners"},
    {internalId: "Y5Z6", name: "Copper Mountain Mining Corp."},
    {internalId: "B7C8", name: "Silverline Software Ltd."},
    {internalId: "D9E0", name: "Harbor Point Marine Services"},
    {internalId: "F1G2", name: "Metro Transit Authority"},
    {internalId: "H3I4", name: "Golden Gate Ventures LLC"},
    {internalId: "J5K6", name: "Cypress Pharmaceuticals, Inc."},
    {internalId: "L7M8", name: "Redwood Timber Holdings"},
    {internalId: "N9O0", name: "Summit Peak Outdoor Gear"},
    {internalId: "P1Q2", name: "Capital Square Investments"},
    {internalId: "R3S4", name: "Ironclad Security Solutions"},
    {internalId: "T5U6", name: "Frontier Airlines Group"},
    {internalId: "V7W8", name: "Majestic Resorts & Spas Ltd."},
    {internalId: "X9Y0", name: "Orchard Valley Foods"},
    {internalId: "Z1A2", name: "Starlight Entertainment Corp"},
    {internalId: "B3D4", name: "Cascade Water Works"},
    {internalId: "F5H6", name: "Urban Grid Construction"},
    {internalId: "J7L8", name: "Vertex Capital Management"},
]


/**
 * Calculates the Jaro-Winkler distance between two strings
 * Returns a value between 0 and 1, where 1 means the strings are identical
 */
export function jaroWinklerDistance(s1: string, s2: string): number {
    // If one of the strings is empty, return 0
    if (s1.length === 0 || s2.length === 0) return 0.0;

    // Normalize whitespace and convert to lowercase for case-insensitive comparison
    s1 = s1.trim().replace(/\s+/g, ' ').toLowerCase();
    s2 = s2.trim().replace(/\s+/g, ' ').toLowerCase();

    // If the strings are equal, return 1
    if (s1 === s2) return 1.0;

    // Calculate the Jaro distance
    const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    const s1Matches = new Array(s1.length).fill(false);
    const s2Matches = new Array(s2.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Find matching characters
    for (let i = 0; i < s1.length; i++) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(s2.length, i + matchDistance + 1);

        for (let j = start; j < end; j++) {
            if (!s2Matches[j] && s1[i] === s2[j]) {
                s1Matches[i] = true;
                s2Matches[j] = true;
                matches++;
                break;
            }
        }
    }

    if (matches === 0) return 0.0;

    // Count transpositions
    let k = 0;
    for (let i = 0; i < s1.length; i++) {
        if (s1Matches[i]) {
            while (!s2Matches[k]) k++;
            if (s1[i] !== s2[k]) transpositions++;
            k++;
        }
    }

    // Calculate Jaro distance
    const jaro = (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;

    // Calculate common prefix length (up to 4 characters)
    let prefixLength = 0;
    for (let i = 0; i < Math.min(4, Math.min(s1.length, s2.length)); i++) {
        if (s1[i] === s2[i]) prefixLength++;
        else break;
    }

    // Calculate Jaro-Winkler distance
    return jaro + (prefixLength * 0.1 * (1 - jaro));
}

/**
 * Finds the closest matching company name and returns its ID
 * @param companyName - The company name to search for
 * @param threshold - The minimum similarity score required (default: 0.8)
 * @returns The internalId of the closest match, or null if no match is found within threshold
 */
export function findIdByFuzzyName(companyName: string, threshold: number = 0.8): InsuranceMatch | null {
    if (!companyName) return null;

    const searchName = companyName.toLowerCase();
    let bestMatch: InsuranceMatch | null = null;

    for (const insured of INSUREDS) {
        const score = jaroWinklerDistance(searchName, insured.name.toLowerCase());

        if (score >= threshold) {
            if (!bestMatch || score > bestMatch.score) {
                bestMatch = {insured, score};
            }
        }
    }

    return bestMatch;
}

