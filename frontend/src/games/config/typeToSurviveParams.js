/**
 * Type To Survive Game Parameters
 * 
 * This file contains all configurable parameters for the Type To Survive game.
 * Modify these values to adjust game difficulty and progression.
 */

// Time per character parameters
export const TYPE_TO_SURVIVE_PARAMS = {
  // Base time per character (milliseconds) for level 1
  BASE_TIME_PER_CHAR: 2000,
  
  // Minimum time per character (milliseconds) at highest levels
  MIN_TIME_PER_CHAR: 200,
  
  // How much to reduce time per character for each level
  TIME_PER_CHAR_DECREMENT: 100,
  
  // Base display time for words (milliseconds)
  BASE_DISPLAY_TIME: 3000,
  
  // Minimum display time (milliseconds)
  MIN_DISPLAY_TIME: 500,
  
  // Display time decrement per level (milliseconds)
  DISPLAY_TIME_DECREMENT: 150,
  
  // Level groupings and their focus
  LEVEL_FOCUS: {
    // Levels 1-5: Decrease display time only
    // User has consistent typing time
    DISPLAY_TIME_FOCUS: [1, 2, 3, 4, 5],
    
    // Levels 6-10: Consistent display time, decrease typing time
    TYPING_TIME_FOCUS: [6, 7, 8, 9, 10],
    
    // Levels 11-15: Increase word count
    WORD_COUNT_FOCUS: [11, 12, 13, 14, 15],
    
    // Levels 16+: Mix of all challenges
    MIXED_FOCUS: [16, 17, 18, 19, 20]
  },
  
  // Base word count for lower levels
  BASE_WORD_COUNT: 3,
  
  // Maximum word count for higher levels
  MAX_WORD_COUNT: 15,
  
  // How many words to add at each word count increase
  WORD_COUNT_INCREMENT: 2,
  
  // Word length categories
  WORD_LENGTHS: {
    SHORT: [3, 4], // 3-4 characters
    MEDIUM: [5, 6, 7], // 5-7 characters
    LONG: [8, 9, 10], // 8+ characters
  }
};

// Word pools by difficulty
export const WORD_POOLS = {
  easy: [
    // Short common words (3-4 chars)
    'cat', 'dog', 'run', 'jump', 'play', 'red', 'blue', 'fish',
    'walk', 'talk', 'eat', 'book', 'read', 'desk', 'pen', 'cup',
    'look', 'hand', 'foot', 'tree', 'sun', 'moon', 'star', 'bird',
    'fast', 'slow', 'big', 'tiny', 'road', 'door', 'game', 'time'
  ],
  
  medium: [
    // Medium-length words (5-7 chars)
    'banana', 'monkey', 'garden', 'window', 'purple', 'orange',
    'yellow', 'planet', 'system', 'people', 'guitar', 'dinner',
    'finger', 'pencil', 'coffee', 'mirror', 'screen', 'carpet',
    'bakery', 'market', 'flower', 'rabbit', 'summer', 'winter',
    'autumn', 'spring', 'basket', 'button', 'castle', 'forest',
    'harbor', 'museum', 'palace', 'rocket', 'silver', 'sunset'
  ],
  
  hard: [
    // Longer words (8+ chars)
    'beautiful', 'wonderful', 'adventure', 'important', 'discovery',
    'excellent', 'furniture', 'happiness', 'inventory', 'knowledge',
    'landscape', 'marketing', 'nutrition', 'operation', 'paradise',
    'question', 'rectangle', 'situation', 'telephone', 'universe',
    'vegetable', 'waterfall', 'yesterday', 'zoologist', 'architect',
    'chemistry', 'dimension', 'education', 'fantastic', 'geography'
  ],
  
  // Special character words for higher levels
  special: [
    'log-in', 'e-mail', 'sign-up', 'check-in', 'Wi-Fi',
    'co-worker', 'T-shirt', 'set-up', 'follow-up', 'look-up',
    'roll-out', 'start-up', 'pop-up', 'on-site', 'off-site',
    'full-time', 'part-time', 'long-term', 'high-end', 'low-cost'
  ]
};

export default {
  TYPE_TO_SURVIVE_PARAMS,
  WORD_POOLS
};