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
  REACTION_GAME,
  PATTERN_GAME,
];

// Game relationships - which game unlocks which
// Import from central config file
import { GAME_UNLOCK_REQUIREMENTS as UNLOCK_REQUIREMENTS } from '../../games/config/gameParameters';

export const GAME_UNLOCK_REQUIREMENTS = UNLOCK_REQUIREMENTS;

export default GAMES;