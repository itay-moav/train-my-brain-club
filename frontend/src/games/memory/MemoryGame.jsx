import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  initSessionProgress,
  recordSuccess,
  recordFailure,
  getCurrentLevel, 
  getGameProgress,
  getSessionProgress,
  getRequiredSuccesses,
  decreaseLevel,
  resetGame
} from '../../store/gameSlice/gameSlice';
import { MEMORY_GAME_PARAMS } from '../config/gameParameters';
import { GAMES } from '../../store/gameSlice/gamesConfig';
import Title from '../../components/atoms/typography/Title';
import Subtitle from '../../components/atoms/typography/Subtitle';
import PrimaryButton from '../../components/atoms/buttons/PrimaryButton';
import Card from '../../components/atoms/containers/Card';

const MemoryGame = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get current game level configuration
  const gameId = 'memory';
  const gameProgress = useSelector(getGameProgress(gameId));
  const sessionProgress = useSelector(getSessionProgress(gameId));
  
  // Always fetch the current level directly from game progress to ensure it's up to date
  const currentLevel = gameProgress?.currentLevel;
  console.log('Current level from gameProgress:', currentLevel);
  
  // Get level config based on current level
  const levelConfig = useSelector(getCurrentLevel(gameId));
  console.log('Level config fetched:', levelConfig);
  
  const requiredSuccesses = useSelector(getRequiredSuccesses(gameId, currentLevel));
  
  // Game state
  const [gameState, setGameState] = useState('ready'); // ready, displaying, waiting, input, success, failure, paused, level-announcement
  const [currentChars, setCurrentChars] = useState('');
  const [userInput, setUserInput] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs for timers and input
  const inputRef = useRef(null);
  const timers = useRef([]);
  
  // Removed duplicate import (moved to top)
  
  // Get the actual level config from game config directly
  const getRealLevelConfig = useCallback(() => {
    const memoryGame = GAMES.find(g => g.id === 'memory');
    const levelIndex = gameProgress.currentLevel - 1;
    return memoryGame.levels[levelIndex];
  }, [gameProgress.currentLevel]);

  // Generate random alphanumeric characters
  const generateChars = useCallback((length) => {
    const chars = MEMORY_GAME_PARAMS.CHAR_SET;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Always return uppercase for consistency
    return result.toUpperCase();
  }, []);
  
  // Initialize session progress on mount
  useEffect(() => {
    dispatch(initSessionProgress({ gameId }));
  }, [dispatch]);
  
  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  // Start the game round
  const startGameRound = useCallback(() => {
    // Get fresh level configuration to ensure it's up-to-date with the current level
    const currentLevelChars = levelConfig?.chars || 1;
    console.log("Starting new round with character count:", currentLevelChars);
    
    // Check if we need to refresh level config (if the level just changed)
    const justAdvanced = sessionProgress.justAdvanced;
    if (justAdvanced) {
      console.log("Level just advanced, new level:", gameProgress.currentLevel);
      // Force a re-render to ensure we have the latest level config
      // In a real app, we might want to dispatch an action to refresh config
    }
    
    // Reset states
    setUserInput('');
    
    // Announce level at the beginning
    if (gameState === 'ready') {
      setAnnouncement(`STARTING LEVEL ${gameProgress.currentLevel}`);
      setGameState('level-announcement');
      
      const announcementTimer = setTimeout(() => {
        // Get the actual level config directly from the source
        const realLevelConfig = getRealLevelConfig();
        const actualCharsNeeded = realLevelConfig.chars;
        console.log('Real level config:', realLevelConfig);
        console.log('Actual chars needed:', actualCharsNeeded);
        
        // Generate random characters based on ACTUAL level
        const chars = generateChars(actualCharsNeeded);
        console.log('Generated new characters:', chars); // Debug log
        setCurrentChars(chars);
        setGameState('displaying');
        
        // Set timer to hide characters
        const hideTimer = setTimeout(() => {
          setGameState('waiting');
          
          // Set timer to show input field
          const inputTimer = setTimeout(() => {
            setGameState('input');
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, levelConfig.breakTime);
          
          timers.current.push(inputTimer);
        }, levelConfig.displayTime);
        
        timers.current.push(hideTimer);
      }, MEMORY_GAME_PARAMS.LEVEL_ANNOUNCE_DURATION);
      
      timers.current.push(announcementTimer);
    } else {
      // Get the actual level config directly from the source
      const realLevelConfig = getRealLevelConfig();
      const actualCharsNeeded = realLevelConfig.chars;
      console.log('Real level config:', realLevelConfig);
      console.log('Actual chars needed:', actualCharsNeeded);
      
      // Generate random characters based on ACTUAL level
      const chars = generateChars(actualCharsNeeded);
      console.log('Generated new characters:', chars); // Debug log
      setCurrentChars(chars);
      setGameState('displaying');
      
      // Set timer to hide characters
      const hideTimer = setTimeout(() => {
        setGameState('waiting');
        
        // Set timer to show input field
        const inputTimer = setTimeout(() => {
          setGameState('input');
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, levelConfig.breakTime);
        
        timers.current.push(inputTimer);
      }, levelConfig.displayTime);
      
      timers.current.push(hideTimer);
    }
  }, [levelConfig, generateChars, gameProgress.currentLevel, gameState, sessionProgress]);
  
  // Check user's answer
  const checkAnswer = useCallback(() => {
    // More comprehensive debug logging
    console.log('Debug info:');
    console.log('User input (raw):', userInput);
    console.log('Current chars (raw):', currentChars);
    console.log('User input length:', userInput.length);
    console.log('Current chars length:', currentChars.length);
    console.log('Character by character comparison:');
    for (let i = 0; i < Math.max(userInput.length, currentChars.length); i++) {
      console.log(`Index ${i}: User: '${userInput[i]}' (${userInput.charCodeAt(i)}), Target: '${currentChars[i]}' (${currentChars.charCodeAt(i)})`);
    }
    
    // More robust comparison - normalize both strings completely
    const normalizedInput = userInput.toUpperCase().trim();
    const normalizedTarget = currentChars.toUpperCase().trim();
    
    console.log('Normalized user input:', normalizedInput);
    console.log('Normalized target:', normalizedTarget);
    console.log('Equal?', normalizedInput === normalizedTarget);
    
    if (normalizedInput === normalizedTarget) {
      console.log('SUCCESS!');
      setGameState('success');
      dispatch(recordSuccess({ gameId, level: gameProgress.currentLevel }));
    } else {
      console.log('FAILURE!');
      setGameState('failure');
      dispatch(recordFailure({ gameId }));
    }
    
    // Automatically start next round after short delay
    const nextRoundTimer = setTimeout(() => {
      startGameRound();
    }, 2000);
    
    timers.current.push(nextRoundTimer);
  }, [userInput, currentChars, dispatch, gameProgress.currentLevel, gameId, startGameRound]);
  
  // Handle input change with auto-submit when character count matches
  const handleInputChange = (e) => {
    // Store input exactly as entered for now
    const value = e.target.value;
    setUserInput(value);
    
    // Get the true character count directly from the source of truth
    const realLevelConfig = getRealLevelConfig();
    const actualCharsNeeded = realLevelConfig.chars;
    
    // Get the characters that were actually displayed to the user
    const displayedCharsCount = currentChars.length;
    
    // Explicitly log all relevant character counts for debugging
    console.log(`Current input length: ${value.length}`);
    console.log(`ACTUAL expected chars from config: ${actualCharsNeeded}`);
    console.log(`Currently displayed chars count: ${displayedCharsCount}`);
    console.log(`Currently displayed chars: "${currentChars}"`);
    console.log(`Current user input: "${value}"`);
    
    // Auto-submit when character count matches THE DISPLAYED CHARACTERS COUNT
    // This ensures we're comparing against what the user actually saw
    if (value.length === displayedCharsCount) {
      // Create a direct comparison function that doesn't rely on state
      const compareAnswer = () => {
        // Log the values we're comparing
        console.log('Direct comparison:');
        console.log('Input value from event:', value);
        console.log('Current chars from state:', currentChars);
        console.log('Level config chars count:', levelConfig.chars);
        
        // Confirm we're using the right character count
        const expectedChars = levelConfig.chars;
        console.log('Using expected character count:', expectedChars);
        
        // Compare normalized values
        const normalizedInput = value.toUpperCase().trim();
        const normalizedTarget = currentChars.toUpperCase().trim();
        
        if (normalizedInput === normalizedTarget) {
          console.log('DIRECT SUCCESS!');
          setGameState('success');
          dispatch(recordSuccess({ gameId, level: gameProgress.currentLevel }));
        } else {
          console.log('DIRECT FAILURE!');
          setGameState('failure');
          dispatch(recordFailure({ gameId }));
        }
        
        // Automatically start next round after short delay
        const nextRoundTimer = setTimeout(() => {
          startGameRound();
        }, 2000);
        
        timers.current.push(nextRoundTimer);
      };
      
      // Add a small delay to ensure rendering completes
      setTimeout(compareAnswer, 50);
    }
  };
  
  // Handle pause/resume
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      startGameRound();
    } else {
      setIsPaused(true);
      setGameState('paused');
      // Clear any pending timers
      timers.current.forEach(timer => clearTimeout(timer));
      timers.current = [];
    }
  };
  
  // Initialize game
  const startGame = () => {
    startGameRound();
  };
  
  // Leave game
  const leaveGame = () => {
    navigate('/');
  };
  
  // Decrease level - Manual implementation
  const handleDecreaseLevel = () => {
    if (gameProgress.currentLevel > 1) {
      // Directly manipulate Redux store with standard action
      dispatch({
        type: 'games/decreaseLevel',
        payload: {
          gameId,
          currentLevel: gameProgress.currentLevel
        }
      });
      
      // Clear timers
      timers.current.forEach(timer => clearTimeout(timer));
      timers.current = [];
      
      // Reset state to prepare for the new level
      setGameState('ready');
      setUserInput('');
    }
  };
  
  // Reset to level 1 - Manual implementation
  const handleResetGame = () => {
    // Directly manipulate Redux store with standard action
    dispatch({
      type: 'games/resetGame',
      payload: {
        gameId
      }
    });
    
    // Clear timers
    timers.current.forEach(timer => clearTimeout(timer));
    timers.current = [];
    
    // Reset state to prepare for the new level
    setGameState('ready');
    setUserInput('');
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Card className="w-full text-center relative min-h-[450px] flex flex-col">
        {/* Game controls */}
        <div className="flex justify-between mb-4">
          {/* Home button */}
          <div>
            <button 
              onClick={leaveGame}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg flex items-center justify-center"
              title="Return Home"
            >
              <span className="text-sm">🏠 Home</span>
            </button>
          </div>
          
          {/* Title in center */}
          <div className="flex-grow mx-4">
            <Title>Memory Master</Title>
          </div>
          
          {/* Pause button */}
          <div>
            {gameState !== 'ready' && (
              <button 
                onClick={togglePause}
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg flex items-center justify-center"
                title={isPaused ? "Resume Game" : "Pause Game"}
              >
                <span className="text-sm">{isPaused ? '▶️ Resume' : '⏸️ Pause'}</span>
              </button>
            )}
          </div>
        </div>
        
        <Subtitle>
          {(() => {
            // Get real-time level config for UI
            const realLevelConfig = getRealLevelConfig();
            return `Level ${gameProgress.currentLevel}: ${realLevelConfig.chars} character${realLevelConfig.chars > 1 ? 's' : ''} in ${realLevelConfig.displayTime/1000}s`;
          })()}
        </Subtitle>
        
        {/* Progress information */}
        <div className="mb-4 text-sm text-gray-400">
          Success: {sessionProgress.successfulAttempts}/{requiredSuccesses} needed to advance
          {sessionProgress.failures > 0 && (
            <span className="ml-3 text-red-400">Failures: {sessionProgress.failures}/3</span>
          )}
        </div>
        
        <div className="flex-grow text-gray-300">
          {gameState === 'ready' && (
            <div>
              <p>
                Remember the character{levelConfig.chars > 1 ? 's' : ''} that will appear on screen.
                <br />
                You'll have {levelConfig.displayTime / 1000} seconds to memorize.
              </p>
              <div className="flex flex-col mt-6 space-y-3">
                <PrimaryButton onClick={startGame} className="w-full">
                  Start Game
                </PrimaryButton>
                
                <div className="flex space-x-3">
                  <PrimaryButton 
                    onClick={handleDecreaseLevel} 
                    className="w-1/2 bg-yellow-600 hover:bg-yellow-700"
                    disabled={gameProgress.currentLevel <= 1}
                  >
                    Decrease Level
                  </PrimaryButton>
                  
                  <PrimaryButton 
                    onClick={handleResetGame} 
                    className="w-1/2 bg-red-600 hover:bg-red-700"
                  >
                    Reset to Level 1
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}
          
          {gameState === 'level-announcement' && (
            <div className="my-12 animate-pulse">
              <div className="text-4xl font-bold tracking-wider text-white">
                {announcement}
              </div>
            </div>
          )}
          
          {gameState === 'displaying' && (
            <div className="my-12">
              <div className="text-4xl font-bold tracking-wider text-white tracking-[0.25em] font-mono">
                {currentChars}
              </div>
              <p className="mt-4">Memorize these characters!</p>
            </div>
          )}
          
          {gameState === 'waiting' && (
            <div className="my-12">
              <div className="text-4xl font-bold tracking-wider opacity-0">
                {currentChars}
              </div>
              <p className="mt-4">Get ready...</p>
            </div>
          )}
          
          {gameState === 'input' && (
            <div className="my-8">
              <p className="mb-2">What characters did you see?</p>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="w-full p-2 text-4xl text-center bg-gray-700 border border-gray-600 rounded text-white tracking-[0.25em] uppercase font-mono"
                autoFocus
                maxLength={currentChars.length}
                disabled={gameState !== 'input'}
              />
              <p className="text-sm mt-2 text-gray-400">
                Type all {currentChars.length} character{currentChars.length > 1 ? 's' : ''} to auto-submit
              </p>
            </div>
          )}
          
          {gameState === 'success' && (
            <div className="my-8 text-green-400">
              <p className="text-xl">Correct!</p>
              <div className="text-sm mt-2">Starting next round...</div>
            </div>
          )}
          
          {gameState === 'failure' && (
            <div className="my-8 text-red-400">
              <p className="text-xl mb-2">Incorrect!</p>
              <p className="font-mono tracking-[0.25em] text-xl">Correct: {currentChars}</p>
              <p className="font-mono tracking-[0.25em] text-xl text-yellow-400 mt-2">You typed: {userInput.toUpperCase()}</p>
              <div className="text-sm mt-4">Starting next round...</div>
            </div>
          )}
          
          {gameState === 'paused' && (
            <div className="my-8">
              <p className="text-xl">Game Paused</p>
              <div className="flex flex-col mt-6 space-y-3">
                <PrimaryButton onClick={togglePause} className="w-full">
                  Resume Game
                </PrimaryButton>
                
                <div className="flex space-x-3">
                  <PrimaryButton 
                    onClick={handleDecreaseLevel} 
                    className="w-1/2 bg-yellow-600 hover:bg-yellow-700"
                    disabled={gameProgress.currentLevel <= 1}
                  >
                    Decrease Level
                  </PrimaryButton>
                  
                  <PrimaryButton 
                    onClick={handleResetGame} 
                    className="w-1/2 bg-red-600 hover:bg-red-700"
                  >
                    Reset to Level 1
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MemoryGame;