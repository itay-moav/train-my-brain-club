import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getCurrentLevel,
  getSessionProgress,
  recordSuccess,
  recordFailure,
  decreaseLevel,
  resetGame
} from '../../store/gameSlice/gameSlice';
import { WORD_POOLS, TYPE_TO_SURVIVE_PARAMS as PARAMS } from '../config/typeToSurviveParams';

/**
 * Type To Survive Game Component
 * 
 * A typing game where players must type words correctly before time runs out.
 * The difficulty increases as players advance through levels with more words
 * and less time.
 */
const TypeToSurviveGame = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gameId = 'typetosurvive';
  
  // Get game configuration for current level
  const currentLevel = useSelector(getCurrentLevel(gameId));
  const sessionProgress = useSelector(getSessionProgress(gameId));
  
  // Game state
  const [gameState, setGameState] = useState('ready'); // ready, playing, success, failure
  const [currentChallenge, setCurrentChallenge] = useState({
    words: [],
    currentWordIndex: 0
  });
  const [wordInput, setWordInput] = useState('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [displayPhase, setDisplayPhase] = useState(false); // Whether we're showing words or typing
  const [challengeStats, setChallengeStats] = useState({
    totalChars: 0,
    avgWordLength: 0,
    displayTime: 0,
    typingTime: 0
  });
  
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const displayTimerRef = useRef(null);
  
  // Initialize game or handle level changes
  useEffect(() => {
    if (currentLevel && gameState === 'ready') {
      // Reset game state for new level
      setWordsCompleted(0);
      
      // Generate the word challenge based on level
      generateWordChallenge(currentLevel);
    }
  }, [currentLevel, gameState]);
  
  // Generate word challenge based on level configuration
  const generateWordChallenge = (levelConfig) => {
    // Determine which word pools to use based on difficulty
    let wordPool = [];
    
    switch (levelConfig.difficulty) {
      case 'easy':
        wordPool = [...WORD_POOLS.easy];
        break;
      case 'medium':
        wordPool = [...WORD_POOLS.medium];
        if (levelConfig.id > 7) { // Mix in some easy words for variety
          wordPool = [...wordPool, ...WORD_POOLS.easy.slice(0, 10)];
        }
        break;
      case 'hard':
        wordPool = [...WORD_POOLS.hard];
        if (levelConfig.id > 17) { // Mix in some special character words for highest levels
          wordPool = [...wordPool, ...WORD_POOLS.special];
        }
        break;
      default:
        wordPool = [...WORD_POOLS.easy];
    }
    
    // Shuffle the word pool
    for (let i = wordPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordPool[i], wordPool[j]] = [wordPool[j], wordPool[i]];
    }
    
    // Select words for this challenge
    const selectedWords = wordPool.slice(0, levelConfig.wordCount);
    
    // Calculate challenge statistics
    const totalChars = selectedWords.reduce((sum, word) => sum + word.length, 0);
    const avgWordLength = totalChars / selectedWords.length;
    
    // Calculate display and typing times based on level focus
    let displayTime, typingTime;
    
    // Calculate display time - time to view the words
    if (PARAMS.LEVEL_FOCUS.DISPLAY_TIME_FOCUS.includes(levelConfig.id)) {
      // For levels 1-5: decreasing display time
      displayTime = Math.max(
        PARAMS.MIN_DISPLAY_TIME,
        PARAMS.BASE_DISPLAY_TIME - ((levelConfig.id - 1) * PARAMS.DISPLAY_TIME_DECREMENT)
      );
      // Generous typing time
      typingTime = selectedWords.length * avgWordLength * PARAMS.BASE_TIME_PER_CHAR;
    } 
    else if (PARAMS.LEVEL_FOCUS.TYPING_TIME_FOCUS.includes(levelConfig.id)) {
      // For levels 6-10: fixed display time, decreasing typing time
      displayTime = Math.max(
        PARAMS.MIN_DISPLAY_TIME,
        PARAMS.BASE_DISPLAY_TIME - (5 * PARAMS.DISPLAY_TIME_DECREMENT)
      );
      // Decreasing typing time per character
      const timePerChar = Math.max(
        PARAMS.MIN_TIME_PER_CHAR,
        PARAMS.BASE_TIME_PER_CHAR - ((levelConfig.id - 5) * PARAMS.TIME_PER_CHAR_DECREMENT)
      );
      typingTime = totalChars * timePerChar;
    }
    else {
      // For higher levels: minimal display time, typing time based on character count
      displayTime = PARAMS.MIN_DISPLAY_TIME;
      typingTime = totalChars * PARAMS.MIN_TIME_PER_CHAR * 1.2; // Slight buffer
    }
    
    // Set the challenge with words and initial word index
    setCurrentChallenge({
      words: selectedWords,
      currentWordIndex: 0
    });
    
    // Store challenge statistics
    setChallengeStats({
      totalChars,
      avgWordLength,
      displayTime,
      typingTime
    });
    
    // Set initial time remaining to total time
    setTimeRemaining(displayTime + typingTime);
  };
  
  // Start the game
  const startGame = () => {
    // First phase: display the words to memorize
    setDisplayPhase(true);
    setGameState('displaying');
    
    // Set timeout to transition from display phase to typing phase
    displayTimerRef.current = setTimeout(() => {
      setDisplayPhase(false);
      setGameState('playing');
      
      // Focus the input field
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Start the typing timer
      setTimeRemaining(challengeStats.typingTime);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 100;
          
          // Check if time is up
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            handleGameOver(false);
            return 0;
          }
          
          return newTime;
        });
      }, 100);
      
    }, challengeStats.displayTime);
  };
  
  // Handle game completion
  const handleGameOver = (success) => {
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (displayTimerRef.current) {
      clearTimeout(displayTimerRef.current);
      displayTimerRef.current = null;
    }
    
    // Update game state
    setGameState(success ? 'success' : 'failure');
    setDisplayPhase(false);
    
    // Record result in Redux store
    if (success) {
      dispatch(recordSuccess({ gameId, level: currentLevel.id }));
    } else {
      dispatch(recordFailure({ gameId }));
    }
    
    // Prepare for next attempt
    setTimeout(() => {
      setGameState('ready');
      setWordInput('');
    }, 2000);
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setWordInput(value);
    
    // Get the current word to match against
    const currentWord = currentChallenge.words[currentChallenge.currentWordIndex];
    
    // Check if the word is completed (case insensitive match)
    if (value.toLowerCase().trim() === currentWord.toLowerCase()) {
      // Increment words completed counter
      const nextWordIndex = wordsCompleted + 1;
      setWordsCompleted(nextWordIndex);
      
      // Clear input field
      setWordInput('');
      
      // Check if all words are completed
      if (nextWordIndex >= currentChallenge.words.length) {
        handleGameOver(true);
      } else {
        // Move to next word
        setCurrentChallenge(prev => ({
          ...prev,
          currentWordIndex: prev.currentWordIndex + 1
        }));
      }
    }
  };
  
  // Decrease level button handler
  const handleDecreaseLevel = () => {
    dispatch(decreaseLevel({ gameId }));
    
    // Reset game state
    setGameState('ready');
    setWordInput('');
    setDisplayPhase(false);
    
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (displayTimerRef.current) {
      clearTimeout(displayTimerRef.current);
      displayTimerRef.current = null;
    }
  };
  
  // Reset game button handler
  const handleResetGame = () => {
    dispatch(resetGame({ gameId }));
    
    // Reset game state
    setGameState('ready');
    setWordInput('');
    setDisplayPhase(false);
    
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (displayTimerRef.current) {
      clearTimeout(displayTimerRef.current);
      displayTimerRef.current = null;
    }
  };
  
  // Format time as seconds with one decimal place
  const formatTime = (ms) => {
    return (ms / 1000).toFixed(1);
  };
  
  // Format progress as fraction (e.g., 3/10)
  const formatProgress = () => {
    return `${wordsCompleted}/${currentChallenge.words.length}`;
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-full bg-gray-800 rounded-lg p-6 shadow-lg relative min-h-[450px] flex flex-col">
        {/* Game controls */}
        <div className="flex justify-between mb-4">
          {/* Home button */}
          <div>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg flex items-center justify-center"
              title="Return Home"
            >
              <span className="text-sm">🏠 Home</span>
            </button>
          </div>
          
          {/* Title in center */}
          <div className="flex-grow mx-4 text-center">
            <h1 className="text-2xl font-bold text-white">Type to Survive</h1>
          </div>
          
          {/* Empty div for layout balance */}
          <div className="w-[76px]"></div>
        </div>
        
        <p className="text-gray-400 text-center">Level {currentLevel?.id}: {currentLevel?.difficulty}</p>
        
        {/* Level controls */}
        <div className="flex justify-center gap-4 mt-2 mb-4">
          <button 
            onClick={handleDecreaseLevel}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            Decrease Level
          </button>
          <button 
            onClick={handleResetGame}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            Reset Game
          </button>
        </div>
        
        {/* Game area */}
        <div className="flex-grow">
          {/* Game status indicators */}
          <div className="flex justify-between mb-4">
            <div className="text-white">
              <span className="text-gray-400">Words: </span>
              <span className="font-mono">{formatProgress()}</span>
            </div>
            <div className="text-white">
              <span className="text-gray-400">Time: </span>
              <span className={`font-mono ${timeRemaining < 5000 ? 'text-red-500' : 'text-green-500'}`}>
                {formatTime(timeRemaining)}s
              </span>
            </div>
          </div>
          
          {/* Game content */}
          {gameState === 'ready' && (
            <div className="text-center py-8">
              <p className="text-white mb-6">
                {currentLevel?.id <= 5 ? 
                  `Memorize and type ${currentChallenge.words.length} words quickly!` :
                  `Type ${currentChallenge.words.length} words before time runs out!`
                }
              </p>
              <div className="mb-6">
                <p className="text-sm text-gray-400">
                  Level {currentLevel?.id} Challenge: 
                  {PARAMS.LEVEL_FOCUS.DISPLAY_TIME_FOCUS.includes(currentLevel?.id) && 
                    "Decreasing display time"}
                  {PARAMS.LEVEL_FOCUS.TYPING_TIME_FOCUS.includes(currentLevel?.id) && 
                    "Decreasing time per character"}
                  {PARAMS.LEVEL_FOCUS.WORD_COUNT_FOCUS.includes(currentLevel?.id) && 
                    "More words to type"}
                  {PARAMS.LEVEL_FOCUS.MIXED_FOCUS.includes(currentLevel?.id) && 
                    "Mixed challenge"}
                </p>
              </div>
              <button 
                onClick={startGame}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Level {currentLevel?.id}
              </button>
            </div>
          )}
          
          {gameState === 'displaying' && (
            <div className="text-center py-8">
              <div className="mb-4">
                <p className="text-gray-400 mb-2">Memorize these words:</p>
                <div className="bg-gray-700 p-4 rounded-lg my-4">
                  {currentChallenge.words.map((word, index) => (
                    <span 
                      key={index} 
                      className="text-2xl font-bold text-white font-mono mx-2 my-2 inline-block"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-yellow-400 animate-pulse mt-2">
                Words will disappear in {Math.ceil(challengeStats.displayTime / 1000)} seconds
              </div>
            </div>
          )}
          
          {gameState === 'playing' && (
            <div className="text-center py-8">
              <div className="mb-8">
                <p className="text-gray-400 mb-2">Type this word:</p>
                <p className="text-3xl font-bold text-white font-mono">
                  {currentChallenge.words[currentChallenge.currentWordIndex]}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Word {currentChallenge.currentWordIndex + 1} of {currentChallenge.words.length}
                </p>
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={wordInput}
                onChange={handleInputChange}
                className="w-full py-2 px-4 bg-gray-700 text-white text-xl font-mono border-2 border-gray-600 rounded focus:outline-none focus:border-blue-500"
                autoFocus
                placeholder="Type here..."
              />
            </div>
          )}
          
          {gameState === 'success' && (
            <div className="text-center py-8">
              <p className="text-3xl font-bold text-green-500 mb-4">Success!</p>
              <p className="text-white">Great job! Get ready for the next challenge...</p>
              <div className="mt-4 text-gray-400">
                <p>You typed {challengeStats.totalChars} characters in {Math.round(challengeStats.typingTime / 1000)} seconds</p>
                <p>That's about {Math.round(challengeStats.totalChars / (challengeStats.typingTime / 60000))} characters per minute!</p>
              </div>
            </div>
          )}
          
          {gameState === 'failure' && (
            <div className="text-center py-8">
              <p className="text-3xl font-bold text-red-500 mb-4">Time's Up!</p>
              <p className="text-white">You completed {wordsCompleted} of {currentChallenge.words.length} words.</p>
              <p className="text-gray-400 mt-2">Try again to improve your speed!</p>
              {wordsCompleted > 0 && (
                <div className="mt-4 bg-gray-700 p-3 rounded-lg text-left">
                  <p className="text-sm text-white">Remaining words were:</p>
                  {currentChallenge.words.slice(wordsCompleted).map((word, index) => (
                    <span key={index} className="text-sm text-gray-300 mr-2">{word}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypeToSurviveGame;