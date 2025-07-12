/**
 * Game configuration file
 * 
 * This file contains the configuration for all games in the application.
 * Each game has:
 *  - id: unique identifier
 *  - name: display name
 *  - slug: URL path
 *  - description: short game description
 *  - levels: array of level configurations
 *  - unlocks: array of game IDs that this game unlocks
 *  - initiallyUnlocked: whether the game is available from the start
 */

import { MEMORY_GAME_PARAMS } from '../../games/config/gameParameters';

// Memory Game Configuration
export const MEMORY_GAME = {
  id: 'memory',
  name: 'Memory Master',
  slug: 'memory',
  description: 'Test your short-term memory by remembering characters',
  initiallyUnlocked: true,
  levels: [
    {
      id: 1,
      chars: 1, // Number of characters to display
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME, 
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 2,
      chars: 2,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME,
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 3,
      chars: 3,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME,
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 4,
      chars: 3,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME - MEMORY_GAME_PARAMS.DISPLAY_TIME_DECREMENT, 
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 5,
      chars: 4,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME - MEMORY_GAME_PARAMS.DISPLAY_TIME_DECREMENT,
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 6,
      chars: 4,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME - (2 * MEMORY_GAME_PARAMS.DISPLAY_TIME_DECREMENT),
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 7,
      chars: 5,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME - (2 * MEMORY_GAME_PARAMS.DISPLAY_TIME_DECREMENT),
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 8,
      chars: 5,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME - (3 * MEMORY_GAME_PARAMS.DISPLAY_TIME_DECREMENT),
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 9,
      chars: 6,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME - (3 * MEMORY_GAME_PARAMS.DISPLAY_TIME_DECREMENT),
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    },
    {
      id: 10,
      chars: 6,
      displayTime: MEMORY_GAME_PARAMS.BASE_DISPLAY_TIME - (4 * MEMORY_GAME_PARAMS.DISPLAY_TIME_DECREMENT),
      breakTime: MEMORY_GAME_PARAMS.WAIT_TIME,
    }
  ],
  // Games this unlocks after reaching certain levels
  unlocks: ['reaction', 'pattern'],
};

// Additional games (initially locked)
// Import Type to Survive parameters
import { TYPE_TO_SURVIVE_PARAMS as PARAMS } from '../../games/config/typeToSurviveParams';

// Generate levels dynamically for Type to Survive game
const generateTypeLevels = () => {
  const levels = [];
  
  // Helper function to calculate time limit based on level and word length
  const calculateTimeLimit = (level, wordCount, avgCharsPerWord) => {
    // For display time focused levels (1-5)
    if (PARAMS.LEVEL_FOCUS.DISPLAY_TIME_FOCUS.includes(level)) {
      // Base display time for early levels, decreasing each level
      const displayTime = Math.max(
        PARAMS.MIN_DISPLAY_TIME,
        PARAMS.BASE_DISPLAY_TIME - ((level - 1) * PARAMS.DISPLAY_TIME_DECREMENT)
      );
      
      // Generous typing time for early levels
      const typingTime = wordCount * avgCharsPerWord * PARAMS.BASE_TIME_PER_CHAR;
      
      return displayTime + typingTime;
    }
    // For typing time focused levels (6-10)
    else if (PARAMS.LEVEL_FOCUS.TYPING_TIME_FOCUS.includes(level)) {
      // Consistent display time
      const displayTime = PARAMS.BASE_DISPLAY_TIME - (5 * PARAMS.DISPLAY_TIME_DECREMENT);
      
      // Decreasing typing time per character
      const timePerChar = Math.max(
        PARAMS.MIN_TIME_PER_CHAR,
        PARAMS.BASE_TIME_PER_CHAR - ((level - 5) * PARAMS.TIME_PER_CHAR_DECREMENT)
      );
      const typingTime = wordCount * avgCharsPerWord * timePerChar;
      
      return displayTime + typingTime;
    }
    // For word count focused levels (11-15)
    else if (PARAMS.LEVEL_FOCUS.WORD_COUNT_FOCUS.includes(level)) {
      // Fixed display and typing times, but more words
      const displayTime = PARAMS.MIN_DISPLAY_TIME + 200;
      const typingTime = wordCount * avgCharsPerWord * PARAMS.MIN_TIME_PER_CHAR * 1.5;
      
      return displayTime + typingTime;
    }
    // For mixed challenge levels (16+)
    else {
      // Minimal display time
      const displayTime = PARAMS.MIN_DISPLAY_TIME;
      
      // Minimal typing time
      const typingTime = wordCount * avgCharsPerWord * PARAMS.MIN_TIME_PER_CHAR;
      
      return displayTime + typingTime;
    }
  };
  
  // Create 20 levels
  for (let i = 1; i <= 20; i++) {
    let wordCount;
    let difficulty;
    let avgCharsPerWord;
    
    // Set difficulty and word count based on level
    if (i <= 5) {
      difficulty = 'easy';
      wordCount = PARAMS.BASE_WORD_COUNT;
      avgCharsPerWord = 3.5; // Average for easy words
    } else if (i <= 10) {
      difficulty = i <= 7 ? 'easy' : 'medium';
      wordCount = PARAMS.BASE_WORD_COUNT;
      avgCharsPerWord = 4.5; // Average between easy and medium
    } else if (i <= 15) {
      difficulty = 'medium';
      // Increasing word count for these levels
      wordCount = PARAMS.BASE_WORD_COUNT + 
                 (Math.floor((i - 10) / 1) * PARAMS.WORD_COUNT_INCREMENT);
      avgCharsPerWord = 6; // Average for medium words
    } else {
      difficulty = i <= 18 ? 'medium' : 'hard';
      // Maximum word count for highest levels
      wordCount = Math.min(
        PARAMS.MAX_WORD_COUNT,
        PARAMS.BASE_WORD_COUNT + (Math.floor((i - 10) / 1) * PARAMS.WORD_COUNT_INCREMENT)
      );
      avgCharsPerWord = 7.5; // Average for hard words
    }
    
    // Calculate time limit based on level parameters
    const timeLimit = calculateTimeLimit(i, wordCount, avgCharsPerWord);
    
    // Add the level
    levels.push({
      id: i,
      wordCount: wordCount,
      timeLimit: Math.round(timeLimit),
      difficulty: difficulty,
      // Indicate if this level uses special characters
      useSpecialChars: i >= 15
    });
  }
  
  return levels;
};

export const TYPE_TO_SURVIVE_GAME = {
  id: 'typetosurvive',
  name: 'Type to Survive',
  slug: 'typetosurvive',
  description: 'Test your typing skills under pressure',
  initiallyUnlocked: false,
  levels: generateTypeLevels(),
  unlocks: ['reaction'],
};

export const REACTION_GAME = {
  id: 'reaction',
  name: 'Reaction Master',
  slug: 'reaction',
  description: 'Test your reaction speed',
  initiallyUnlocked: false,
  levels: [
    // TODO: Define reaction game levels
  ],
  unlocks: ['focus'],
};

export const PATTERN_GAME = {
  id: 'pattern',
  name: 'Pattern Recognition',
  slug: 'pattern',
  description: 'Improve your pattern recognition skills',
  initiallyUnlocked: false,
  levels: [
    // TODO: Define pattern game levels
  ],
  unlocks: ['logic'],
};

// Complete games collection
export const GAMES = [
  MEMORY_GAME,
  TYPE_TO_SURVIVE_GAME,
  REACTION_GAME,
  PATTERN_GAME,
];

// Game relationships - which game unlocks which
// Import from central config file
import { GAME_UNLOCK_REQUIREMENTS as UNLOCK_REQUIREMENTS } from '../../games/config/gameParameters';

export const GAME_UNLOCK_REQUIREMENTS = UNLOCK_REQUIREMENTS;

// Make sure TYPE_TO_SURVIVE_GAME is included in the GAMES array
if (!GAMES.find(game => game.id === 'typetosurvive')) {
  console.log('Adding Type to Survive game to GAMES array');
  GAMES.push(TYPE_TO_SURVIVE_GAME);
}

export default GAMES;