import { configureStore, combineReducers } from '@reduxjs/toolkit';
import ApplicationReducer from './applicationSlice';
import GameReducer from './gameSlice/gameSlice';

// Combine reducers
const reducer = combineReducers({
  application: ApplicationReducer,
  games: GameReducer
});

// Custom middleware to handle level management actions
const levelManagementMiddleware = store => next => action => {
  // Process normal action flow first
  const result = next(action);
  
  // Handle decrease level action
  if (action.type === 'games/decreaseLevel') {
    const state = store.getState();
    const { gameId } = action.payload;
    const gameProgress = state.games.gameProgress[gameId];
    
    if (gameProgress && gameProgress.currentLevel > 1) {
      // Directly modify the state using the reducer
      store.dispatch({
        type: 'games/manualLevelDecrease',
        payload: { gameId }
      });
    }
  }
  
  // Handle reset game action
  if (action.type === 'games/resetGame') {
    const state = store.getState();
    const { gameId } = action.payload;
    
    // Directly modify the state using the reducer
    store.dispatch({
      type: 'games/manualLevelReset',
      payload: { gameId }
    });
  }
  
  return result;
};

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(levelManagementMiddleware)
});
