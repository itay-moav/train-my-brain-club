import React, { useState, useEffect } from 'react';
import Card from '../../components/atoms/containers/Card';
import PrimaryButton from '../../components/atoms/buttons/PrimaryButton';
import Title from '../../components/atoms/typography/Title';

/**
 * This is a standalone test component for the Memory game character count logic.
 * It doesn't use Redux or any other external state, making it easier to test the core issue.
 */
const TestMemory = () => {
  // Test state
  const [gameLevel, setGameLevel] = useState(1);
  const [charsToShow, setCharsToShow] = useState(1);
  const [currentChars, setCurrentChars] = useState('');
  const [userInput, setUserInput] = useState('');
  const [gameState, setGameState] = useState('ready'); // ready, showing, input, success, failure
  const [results, setResults] = useState([]);
  
  // Generate random characters
  const generateChars = (length) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  // Start test round
  const startRound = () => {
    const chars = generateChars(charsToShow);
    setCurrentChars(chars);
    setUserInput('');
    setGameState('showing');
    
    // Hide after 2 seconds
    setTimeout(() => {
      setGameState('input');
    }, 2000);
  };
  
  // Go down one level
  const decreaseLevel = () => {
    if (gameLevel > 1) {
      setGameLevel(prev => prev - 1);
      setCharsToShow(prev => Math.max(prev - 1, 1));
      setResults(prev => [...prev, {
        level: gameLevel,
        chars: charsToShow,
        shown: '-',
        input: '-',
        result: 'LEVEL DOWN'
      }]);
    }
  };
  
  // Reset game to level 1
  const resetGame = () => {
    setGameLevel(1);
    setCharsToShow(1);
    setGameState('ready');
    setResults(prev => [...prev, {
      level: gameLevel,
      chars: charsToShow,
      shown: '-',
      input: '-',
      result: 'RESET'
    }]);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Log all relevant values
    console.log(`Input length: ${value.length}, Current chars length: ${currentChars.length}`);
    console.log(`Input: "${value}", Expected: "${currentChars}"`);
    
    // Auto-submit when length matches
    if (value.length === currentChars.length) {
      if (value.toUpperCase() === currentChars) {
        setGameState('success');
        
        // Log success
        setResults(prev => [...prev, {
          level: gameLevel,
          chars: charsToShow,
          shown: currentChars,
          input: value,
          result: 'SUCCESS'
        }]);
        
        // Move to next level
        setGameLevel(prev => prev + 1);
        setCharsToShow(prev => prev + 1);
      } else {
        setGameState('failure');
        
        // Log failure
        setResults(prev => [...prev, {
          level: gameLevel,
          chars: charsToShow,
          shown: currentChars,
          input: value,
          result: 'FAILURE'
        }]);
      }
      
      // Auto-start next round after 2 seconds
      setTimeout(() => {
        setGameState('ready');
      }, 2000);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <Title>Memory Game Test</Title>
        
        <div className="mb-4 text-gray-300">
          <p>Current Level: {gameLevel}</p>
          <p>Characters to show: {charsToShow}</p>
        </div>
        
        {gameState === 'ready' && (
          <div className="flex space-x-4 mb-4">
            <PrimaryButton onClick={startRound}>
              Start Test Round
            </PrimaryButton>
            <PrimaryButton onClick={decreaseLevel} className="bg-yellow-600 hover:bg-yellow-700">
              Decrease Level
            </PrimaryButton>
            <PrimaryButton onClick={resetGame} className="bg-red-600 hover:bg-red-700">
              Reset Game
            </PrimaryButton>
          </div>
        )}
        
        {gameState === 'showing' && (
          <div className="my-8">
            <p className="mb-2">Memorize:</p>
            <div className="text-4xl font-mono tracking-[0.25em] font-bold">
              {currentChars}
            </div>
          </div>
        )}
        
        {gameState === 'input' && (
          <div className="my-8">
            <p className="mb-2">Enter what you saw:</p>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="w-full p-2 text-4xl text-center bg-gray-700 border border-gray-600 rounded text-white tracking-[0.25em] uppercase font-mono"
              autoFocus
              maxLength={currentChars.length}
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
      </Card>
      
      {/* Test Results */}
      <Card className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-white">Test Results</h2>
        
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Level</th>
              <th className="p-2">Chars</th>
              <th className="p-2">Shown</th>
              <th className="p-2">Input</th>
              <th className="p-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr key={idx} className="border-b border-gray-800">
                <td className="p-2">{result.level}</td>
                <td className="p-2">{result.chars}</td>
                <td className="p-2 font-mono">{result.shown}</td>
                <td className="p-2 font-mono">{result.input.toUpperCase()}</td>
                <td className={`p-2 ${result.result === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                  {result.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default TestMemory;