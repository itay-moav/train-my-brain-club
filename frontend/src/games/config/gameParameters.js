/**
 * Game Parameters Configuration
 * 
 * This file contains all easily customizable parameters for game behavior.
 * Modify these values to adjust game difficulty, timing, and progression requirements.
 */

// ==================== MEMORY GAME PARAMETERS ====================

/**
 * Memory Game Parameters
 * 
 * Controls the core mechanics of the Memory Game including:
 * - Character set: What characters can appear in the memory challenges
 * - Timing: How long characters are displayed and delay before input
 * - Level progression: How many successful attempts needed to advance levels
 */
export const MEMORY_GAME_PARAMS = {
  // Character set used for generating memory challenges
  // You can modify this to make challenges easier or harder
  // Removed ambiguous characters (0/O, 1/I, etc.) to improve readability
  CHAR_SET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  
  // Base display time for characters in milliseconds (level 1)
  // Higher values give players more time to memorize
  BASE_DISPLAY_TIME: 1500,
  
  // Minimum display time in milliseconds (for highest levels)
  // This prevents the game from becoming impossible
  MIN_DISPLAY_TIME: 500,
  
  // Display time reduction per difficulty increase (milliseconds)
  // How much faster characters appear at each speed-focused level
  DISPLAY_TIME_DECREMENT: 200,
  
  // Wait time between character display and input prompt (milliseconds)
  // Lower values make the game more challenging
  WAIT_TIME: 800, // Reduced from 3000ms as requested
  
  // Number of consecutive successful attempts required to advance per level
  // This creates a more gradual progression curve
  SUCCESS_THRESHOLD: {
    1: 2,  // Level 1: 2 successful attempts needed
    2: 2,  // Level 2: 2 successful attempts needed
    3: 3,  // Level 3: 3 successful attempts needed
    4: 3,  // Level 4: 3 successful attempts needed
    5: 3,  // Level 5: 3 successful attempts needed
    6: 4,  // Level 6: 4 successful attempts needed
    7: 4,  // Level 7: 4 successful attempts needed
    8: 4,  // Level 8: 4 successful attempts needed
    9: 5,  // Level 9: 5 successful attempts needed
    10: 5, // Level 10: 5 successful attempts needed
    // Add more levels as needed
  },
  
  // Default success threshold for any level not explicitly defined
  DEFAULT_SUCCESS_THRESHOLD: 3,
  
  // Announcement display duration (milliseconds)
  // How long the "Starting Level X" message appears
  LEVEL_ANNOUNCE_DURATION: 2000,
  
  // New level starting delay after announcement (milliseconds)
  // Total time before a new level begins = LEVEL_ANNOUNCE_DURATION + LEVEL_START_DELAY
  LEVEL_START_DELAY: 500,
};

// ==================== GAME UNLOCKING REQUIREMENTS ====================

/**
 * Game Unlocking Requirements
 * 
 * Defines which games are unlocked when players reach specific levels in other games.
 * Format: { gameId: { requiredGame: 'gameId', requiredLevel: number } }
 */
export const GAME_UNLOCK_REQUIREMENTS = {
  // Games unlocked by memory progress
  'typetosurvive': { requiredGame: 'memory', requiredLevel: 2 },
  'reaction': { requiredGame: 'memory', requiredLevel: 7 },
  'pattern': { requiredGame: 'memory', requiredLevel: 8 },
  
  // Future games (currently not implemented)
  'focus': { requiredGame: 'reaction', requiredLevel: 5 },
  'logic': { requiredGame: 'pattern', requiredLevel: 5 }
};

// ==================== GENERAL GAME SETTINGS ====================

/**
 * General Game Settings
 * 
 * Settings that apply across multiple games or control meta-aspects
 * of the gaming experience.
 */
export const GENERAL_SETTINGS = {
  // How long notifications (like unlocked games) remain visible (milliseconds)
  NOTIFICATION_DURATION: 5000,
  
  // Enable/disable sound effects
  SOUND_ENABLED: true,
  
  // Default volume for sound effects (0.0 - 1.0)
  DEFAULT_VOLUME: 0.5,
  
  // Enable/disable animations
  ANIMATIONS_ENABLED: true,
};

export default {
  MEMORY_GAME_PARAMS,
  GAME_UNLOCK_REQUIREMENTS,
  GENERAL_SETTINGS,
};