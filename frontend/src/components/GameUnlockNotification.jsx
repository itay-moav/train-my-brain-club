import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getNewlyUnlockedGames, markNotificationsSeen } from '../store/gameSlice/gameSlice';

const GameUnlockNotification = () => {
  const dispatch = useDispatch();
  const unlockedGames = useSelector(getNewlyUnlockedGames);
  
  // Mark notifications as seen after 5 seconds
  useEffect(() => {
    if (unlockedGames.length > 0) {
      const timer = setTimeout(() => {
        dispatch(markNotificationsSeen());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [unlockedGames, dispatch]);
  
  if (unlockedGames.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-green-800 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce">
      <h3 className="font-bold text-lg mb-2">🎮 New Game Unlocked!</h3>
      <div className="mb-4">
        <p>You've unlocked:</p>
        <ul className="list-disc ml-5 mt-2">
          {unlockedGames.map(game => (
            <li key={game.id}>{game.name}</li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end">
        <Link to="/games">
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            View Games
          </button>
        </Link>
      </div>
    </div>
  );
};

export default GameUnlockNotification;