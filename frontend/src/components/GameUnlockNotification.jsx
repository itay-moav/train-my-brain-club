import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { GENERAL_SETTINGS } from '../games/config/gameParameters';
import { getNewlyUnlockedGames, markNotificationsSeen } from '../store/gameSlice/gameSlice';

const GameUnlockNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unlockedGames = useSelector(getNewlyUnlockedGames);
  const [visible, setVisible] = useState(false);
  
  // Show notification and mark as seen after timeout
  useEffect(() => {
    if (unlockedGames.length > 0) {
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
        dispatch(markNotificationsSeen());
      }, GENERAL_SETTINGS.NOTIFICATION_DURATION || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [unlockedGames, dispatch]);
  
  if (!visible || unlockedGames.length === 0) {
    return null;
  }
  
  // Handle click to navigate to the newly unlocked game
  const handlePlayNow = (gameId) => {
    setVisible(false);
    dispatch(markNotificationsSeen());
    navigate(`/game/${gameId}`);
  };
  
  // Handle dismiss button click
  const handleDismiss = () => {
    setVisible(false);
    dispatch(markNotificationsSeen());
  };
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-blue-900 border-2 border-blue-500 text-white p-6 rounded-lg shadow-lg z-50">
      <h3 className="font-bold text-lg mb-2">🎮 New Game{unlockedGames.length > 1 ? 's' : ''} Unlocked!</h3>
      
      {unlockedGames.map(game => (
        <div key={game.id} className="mb-3 pb-3 border-b border-blue-700 last:border-0">
          <p className="text-blue-200 mb-2">{game.name} is now available!</p>
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePlayNow(game.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Play Now
            </button>
          </div>
        </div>
      ))}
      
      <div className="flex justify-between mt-2">
        <button 
          onClick={handleDismiss}
          className="text-sm text-blue-300 hover:text-white"
        >
          Dismiss
        </button>
        
        <Link to="/games">
          <button className="text-sm text-blue-300 hover:text-white">
            View All Games
          </button>
        </Link>
      </div>
    </div>
  );
};

export default GameUnlockNotification;