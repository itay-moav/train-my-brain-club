import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUnlockedGames, getGameProgress } from '../store/gameSlice/gameSlice';

/**
 * GameSwitcher Component
 * 
 * Displays all unlocked games as clickable square panels at the bottom of the game screen.
 * Allows users to quickly switch between available games.
 */
const GameSwitcher = ({ currentGameId }) => {
  const navigate = useNavigate();
  const unlockedGames = useSelector(getUnlockedGames);
  const memoryProgress = useSelector(getGameProgress('memory'));
  
  // Only show the game switcher if:  
  // 1. There are multiple unlocked games AND
  // 2. The memory game is at least level 5
  if (unlockedGames.length <= 1 || (memoryProgress && memoryProgress.currentLevel < 5)) {
    return null;
  }
  
  const handleGameSwitch = (gameId) => {
    if (gameId !== currentGameId) {
      navigate(`/game/${gameId}`);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">Available Games</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {unlockedGames.map(game => (
          <div
            key={game.id}
            onClick={() => handleGameSwitch(game.id)}
            className={`w-40 h-40 p-4 flex flex-col justify-between items-center cursor-pointer rounded-lg transition-all duration-200 transform hover:scale-105 ${
              game.id === currentGameId
                ? 'bg-blue-600 border-2 border-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
              {game.id === 'memory' ? (
                <span className="text-2xl">🧠</span>
              ) : game.id === 'typetosurvive' ? (
                <span className="text-2xl">⌨️</span>
              ) : (
                <span className="text-2xl">🎮</span>
              )}
            </div>
            
            <h3 className="font-bold text-center text-white">{game.name}</h3>
            
            <div className="text-xs text-center text-gray-300 mt-1">
              {game.id === currentGameId ? 'Currently Playing' : 'Click to Play'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameSwitcher;