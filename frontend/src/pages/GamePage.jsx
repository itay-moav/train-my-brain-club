import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getGameById, getGameProgress, setActiveGame } from '../store/gameSlice/gameSlice';

// Import all games
import MemoryGame from '../games/memory/MemoryGame';

// Game component mapping
const GAME_COMPONENTS = {
  'memory': MemoryGame,
  // Add more games here as they're created
};

const GamePage = () => {
  const dispatch = useDispatch();
  const { gameId } = useParams();
  
  // Get game data and progress
  const game = useSelector(getGameById(gameId));
  const gameProgress = useSelector(getGameProgress(gameId));
  
  // Set active game when component mounts
  useEffect(() => {
    if (game) {
      dispatch(setActiveGame(gameId));
    }
  }, [dispatch, gameId, game]);
  
  // If game doesn't exist or isn't unlocked, redirect to home
  if (!game) {
    return <Navigate to="/" replace />;
  }
  
  if (!gameProgress?.unlocked) {
    return <Navigate to="/" replace />;
  }
  
  // Render the appropriate game component
  const GameComponent = GAME_COMPONENTS[gameId];
  
  if (!GameComponent) {
    return <div className="text-center text-white py-16">Game not implemented yet</div>;
  }
  
  return <GameComponent />;
};

export default GamePage;