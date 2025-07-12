// This file is updated to include Type to Survive in the GAMES array

import { GAMES, TYPE_TO_SURVIVE_GAME } from './gameSlice/gamesConfig';

// Add Type to Survive game to the GAMES array if it's not already included
if (!GAMES.find(game => game.id === TYPE_TO_SURVIVE_GAME.id)) {
  GAMES.push(TYPE_TO_SURVIVE_GAME);
}

export default GAMES;
