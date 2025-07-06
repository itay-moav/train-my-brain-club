import { createSlice, createAction } from "@reduxjs/toolkit";
import { GAMES, GAME_UNLOCK_REQUIREMENTS } from "./gamesConfig";
import { MEMORY_GAME_PARAMS } from '../../games/config/gameParameters';

// Helper function to generate initial progress state
const generateInitialGameProgress = () => {
  const progress = {};
  
  GAMES.forEach(game => {
    progress[game.id] = {
      unlocked: game.initiallyUnlocked,
      currentLevel: 1,
      maxLevelReached: 0,
      completed: false,
    };
  });
  
  return progress;
};

const initialState = {
  games: GAMES,
  gameProgress: generateInitialGameProgress(),
  activeGameId: null,
  notifications: {
    unlockedGames: [],
    seen: true
  },
  sessionProgress: {}, // Tracks current session's progress (successes, failures, etc.)
};

const gameSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    // Set active game
    setActiveGame: (state, action) => {
      state.activeGameId = action.payload;
    },
    
    // Initialize session progress for a game
    initSessionProgress: (state, action) => {
      const { gameId } = action.payload;
      
      if (!state.sessionProgress[gameId]) {
        state.sessionProgress[gameId] = {
          successfulAttempts: 0,
          totalAttempts: 0,
          justAdvanced: false
        };
      }
    },
    
    // Record successful attempt but don't advance level yet
    recordSuccess: (state, action) => {
      const { gameId, level } = action.payload;
      const gameProgress = state.gameProgress[gameId];
      
      // Initialize session progress if needed
      if (!state.sessionProgress[gameId]) {
        state.sessionProgress[gameId] = {
          successfulAttempts: 0,
          totalAttempts: 0,
          justAdvanced: false
        };
      }
      
      // Reset the justAdvanced flag if it was set
      if (state.sessionProgress[gameId].justAdvanced) {
        state.sessionProgress[gameId].justAdvanced = false;
      }
      
      // Increment successful attempts
      state.sessionProgress[gameId].successfulAttempts++;
      state.sessionProgress[gameId].totalAttempts++;
      
      // Update max level if this is a new high
      if (level > gameProgress.maxLevelReached) {
        gameProgress.maxLevelReached = level;
      }
      
      // Get required threshold from game parameters
      const requiredSuccesses = MEMORY_GAME_PARAMS.SUCCESS_THRESHOLD[level] || 
                               MEMORY_GAME_PARAMS.DEFAULT_SUCCESS_THRESHOLD;
      
      // Check if player has reached the success threshold to advance
      if (state.sessionProgress[gameId].successfulAttempts >= requiredSuccesses) {
        // Move to next level
        const game = GAMES.find(g => g.id === gameId);
        const nextLevel = level + 1;
        
        // Check if this was the final level
        if (nextLevel > game.levels.length) {
          gameProgress.completed = true;
        } else {
          gameProgress.currentLevel = nextLevel;
        }
        
        // Reset session progress for next level
        state.sessionProgress[gameId].successfulAttempts = 0;
        
        // Track that we're starting a new level so the UI can update appropriately
        state.sessionProgress[gameId].justAdvanced = true;
      }
      
      // Check for unlocking notification
      let newlyUnlockedGames = [];
      
      // Check for unlocking other games
      Object.entries(GAME_UNLOCK_REQUIREMENTS).forEach(([targetGameId, requirement]) => {
        if (
          requirement.requiredGame === gameId && 
          level >= requirement.requiredLevel &&
          !state.gameProgress[targetGameId].unlocked
        ) {
          // Unlock the game
          state.gameProgress[targetGameId].unlocked = true;
          
          // Track newly unlocked games
          const unlockedGame = GAMES.find(g => g.id === targetGameId);
          if (unlockedGame) {
            newlyUnlockedGames.push({
              id: targetGameId,
              name: unlockedGame.name
            });
          }
        }
      });
      
      // Store notification about unlocked games if any
      if (newlyUnlockedGames.length > 0) {
        state.notifications = {
          unlockedGames: newlyUnlockedGames,
          seen: false
        };
      }
      
      // Update local storage
      localStorage.setItem('trainMyBrainGames', JSON.stringify(state.gameProgress));
    },
    
    // Record failed attempt
    recordFailure: (state, action) => {
      const { gameId } = action.payload;
      
      // Initialize session progress if needed
      if (!state.sessionProgress[gameId]) {
        state.sessionProgress[gameId] = {
          successfulAttempts: 0,
          totalAttempts: 0,
          failures: 0,
          justAdvanced: false
        };
      }
      
      // Reset the justAdvanced flag if it was set - allows levelConfig to refresh
      if (state.sessionProgress[gameId].justAdvanced) {
        state.sessionProgress[gameId].justAdvanced = false;
      }
      
      // Increment failures and total attempts
      state.sessionProgress[gameId].failures = 
        (state.sessionProgress[gameId].failures || 0) + 1;
      state.sessionProgress[gameId].totalAttempts++;
      
      // Reset successful attempts counter on failure
      state.sessionProgress[gameId].successfulAttempts = 0;
      
      // Check if we have 3 consecutive failures to drop a level
      if (state.sessionProgress[gameId].failures >= 3) {
        const gameProgress = state.gameProgress[gameId];
        
        // Go back one level, but not below level 1
        if (gameProgress.currentLevel > 1) {
          gameProgress.currentLevel -= 1;
        }
        
        // Reset failure counter
        state.sessionProgress[gameId].failures = 0;
        
        // Update local storage
        localStorage.setItem('trainMyBrainGames', JSON.stringify(state.gameProgress));
      }
    },
    
    // Load saved progress from localStorage
    loadSavedProgress: (state, action) => {
      if (action.payload) {
        state.gameProgress = action.payload;
      }
    },
    
    // Reset progress for testing
    resetProgress: (state) => {
      state.gameProgress = generateInitialGameProgress();
      localStorage.setItem('trainMyBrainGames', JSON.stringify(state.gameProgress));
    },
    
    // Mark notifications as seen
    markNotificationsSeen: (state) => {
      if (state.notifications) {
        state.notifications.seen = true;
      }
    },
    
    // Custom level decrease handler
    manualLevelDecrease: (state, action) => {
      const { gameId } = action.payload;
      const gameProgress = state.gameProgress[gameId];
      
      if (gameProgress && gameProgress.currentLevel > 1) {
        // Decrease level by one
        gameProgress.currentLevel -= 1;
        
        // Reset session progress
        if (state.sessionProgress[gameId]) {
          state.sessionProgress[gameId].successfulAttempts = 0;
          state.sessionProgress[gameId].failures = 0;
        }
        
        // Update local storage
        localStorage.setItem('trainMyBrainGames', JSON.stringify(state.gameProgress));
      }
    },
    
    // Custom level reset handler
    manualLevelReset: (state, action) => {
      const { gameId } = action.payload;
      const gameProgress = state.gameProgress[gameId];
      
      if (gameProgress) {
        // Reset to level 1
        gameProgress.currentLevel = 1;
        
        // Reset session progress
        if (state.sessionProgress[gameId]) {
          state.sessionProgress[gameId].successfulAttempts = 0;
          state.sessionProgress[gameId].failures = 0;
        }
        
        // Update local storage
        localStorage.setItem('trainMyBrainGames', JSON.stringify(state.gameProgress));
      }
    },
  },
});

export const { 
  setActiveGame, 
  completeLevel, 
  initSessionProgress,
  recordSuccess,
  recordFailure,
  loadSavedProgress, 
  resetProgress,
  markNotificationsSeen,
  manualLevelDecrease,
  manualLevelReset
} = gameSlice.actions;

// Create actions for level management
export const decreaseLevel = createAction('games/decreaseLevel');
export const resetGame = createAction('games/resetGame');

export default gameSlice.reducer;

// Selectors
export const getActiveGame = (state) => {
  const activeId = state.games.activeGameId;
  if (!activeId) return null;
  return state.games.games.find(game => game.id === activeId);
};

export const getGameById = (gameId) => (state) => {
  return state.games.games.find(game => game.id === gameId);
};

export const getGameProgress = (gameId) => (state) => {
  return state.games.gameProgress[gameId];
};

export const getCurrentLevel = (gameId) => (state) => {
  const progress = state.games.gameProgress[gameId];
  if (!progress) return null;
  
  const game = state.games.games.find(g => g.id === gameId);
  const levelIndex = progress.currentLevel - 1;
  console.log(`Getting level config for level index: ${levelIndex} (level ${progress.currentLevel})`);
  
  if (levelIndex < 0 || levelIndex >= game.levels.length) {
    console.error(`Invalid level index: ${levelIndex}`);
    // Return a safe default to prevent errors
    return game.levels[0];
  }
  
  const levelConfig = game.levels[levelIndex];
  console.log('Level config retrieved:', levelConfig);
  
  return levelConfig;
};

export const getUnlockedGames = (state) => {
  return state.games.games.filter(game => 
    state.games.gameProgress[game.id]?.unlocked
  );
};

export const getAllGames = (state) => {
  return state.games.games;
};

export const getNewlyUnlockedGames = (state) => {
  return !state.games.notifications.seen ? state.games.notifications.unlockedGames : [];
};

export const getSessionProgress = (gameId) => (state) => {
  return state.games.sessionProgress[gameId] || {
    successfulAttempts: 0,
    totalAttempts: 0,
    failures: 0
  };
};

export const getRequiredSuccesses = (gameId, level) => (state) => {
  return MEMORY_GAME_PARAMS.SUCCESS_THRESHOLD[level] || 
         MEMORY_GAME_PARAMS.DEFAULT_SUCCESS_THRESHOLD;
};