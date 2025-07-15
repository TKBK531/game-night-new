/**
 * Team logo utility functions for consistent team image handling
 */

// Available team logos with their exact file names (without extension)
const AVAILABLE_TEAM_LOGOS = [
    'BON',
    'DEVALA DEVILS',
    'Dragon Worriers',
    'Hellborn',
    'MAHAGEDARA KILLERS',
    'Mind Processing',
    'Reapers',
    'RED_FLAME',
    'Rsl',
    'ShadowRift',
    'Silent Reapers',
    'Tactical Naps',
    'Team Mythics',
    'TeamNotFound',
    'TF141',
    // Sample teams for testing
    'Team Alpha',
    'Elite Squad',
    'Phoenix Riders'
];

/**
 * Normalize team name for matching
 * Removes special characters, converts to lowercase, removes extra spaces
 */
function normalizeTeamName(teamName: string): string {
    return teamName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
        .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

/**
 * Find best matching team logo for a given team name
 * Uses fuzzy matching to handle variations in team names
 */
function findBestLogoMatch(teamName: string): string | null {
    const normalizedInput = normalizeTeamName(teamName);

    // First try exact match
    for (const logo of AVAILABLE_TEAM_LOGOS) {
        if (normalizeTeamName(logo) === normalizedInput) {
            return logo;
        }
    }

    // Try partial matches - check if team name contains logo name or vice versa
    for (const logo of AVAILABLE_TEAM_LOGOS) {
        const normalizedLogo = normalizeTeamName(logo);

        // Check if input contains the logo name
        if (normalizedInput.includes(normalizedLogo)) {
            return logo;
        }

        // Check if logo name contains the input
        if (normalizedLogo.includes(normalizedInput)) {
            return logo;
        }
    }

    // Try word-based matching for multi-word teams
    const inputWords = normalizedInput.split(' ').filter(word => word.length > 2);

    for (const logo of AVAILABLE_TEAM_LOGOS) {
        const logoWords = normalizeTeamName(logo).split(' ').filter(word => word.length > 2);

        // Check if any significant words match
        const matchingWords = inputWords.filter(word =>
            logoWords.some(logoWord => logoWord.includes(word) || word.includes(logoWord))
        );

        // If more than half the words match, consider it a match
        if (matchingWords.length > 0 && matchingWords.length >= Math.min(inputWords.length, logoWords.length) / 2) {
            return logo;
        }
    }

    return null;
}

/**
 * Get team logo URL with proper fallback handling
 * @param teamName - The team name to find a logo for
 * @returns URL to the team logo or default image
 */
export function getTeamLogoUrl(teamName: string): string {
    if (!teamName || teamName.trim() === '') {
        // Return default team logo from GitHub raw URL
        return 'https://raw.githubusercontent.com/TKBK531/game-night-new/refs/heads/leaderboard/images/TeamLogos/DefaultteamLogo.jpg';
    }

    const matchedLogo = findBestLogoMatch(teamName);

    if (matchedLogo) {
        // Use GitHub raw URL with proper URL encoding for spaces and special characters
        const encodedTeamName = encodeURIComponent(matchedLogo);
        return `https://raw.githubusercontent.com/TKBK531/game-night-new/refs/heads/leaderboard/images/TeamLogos/${encodedTeamName}.jpg`;
    }

    // Return default team logo from GitHub raw URL
    return 'https://raw.githubusercontent.com/TKBK531/game-night-new/refs/heads/leaderboard/images/TeamLogos/DefaultteamLogo.jpg';
}

/**
 * Get all available team logos for admin purposes
 */
export function getAvailableTeamLogos(): string[] {
    return [...AVAILABLE_TEAM_LOGOS];
}

/**
 * Check if a team has a custom logo available
 */
export function hasCustomLogo(teamName: string): boolean {
    return findBestLogoMatch(teamName) !== null;
}
