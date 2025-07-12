import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetProgress } from '../store/gameSlice/gameSlice';

/**
 * ResetGameData Component
 * 
 * A small utility component that allows users to reset all game progress.
 * Provides a confirmation dialog to prevent accidental resets.
 */
const ResetGameData = () => {
  const dispatch = useDispatch();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleReset = () => {
    // Clear localStorage
    localStorage.removeItem('trainMyBrainGames');
    
    // Reset Redux state
    dispatch(resetProgress());
    
    // Hide confirmation dialog
    setShowConfirmation(false);
    
    // Reload the page to ensure all components update
    window.location.reload();
  };
  
  return (
    <div className="fixed bottom-4 left-4">
      {!showConfirmation ? (
        <button
          onClick={() => setShowConfirmation(true)}
          className="text-xs px-3 py-1 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
          title="Reset all game progress"
        >
          Reset Data
        </button>
      ) : (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-sm text-white mb-2">Reset all game progress?</p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="text-xs px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetGameData;