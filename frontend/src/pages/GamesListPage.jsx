import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUnlockedGames, loadSavedProgress } from '../store/gameSlice/gameSlice';
import Title from '../components/atoms/typography/Title';
import Card from '../components/atoms/containers/Card';

const GamesListPage = () => {
  const dispatch = useDispatch();
  const unlockedGames = useSelector(getUnlockedGames);
  
  // Load saved game progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = JSON.parse(localStorage.getItem('trainMyBrainGames'));
      if (savedProgress) {
        dispatch(loadSavedProgress(savedProgress));
      }
    } catch (error) {
      console.error('Error loading saved game progress:', error);
    }
  }, [dispatch]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Title className="text-center mb-8">Train My Brain Games</Title>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unlockedGames.map(game => (
          <Link to={`/game/${game.id}`} key={game.id} className="block">
            <Card className="h-full transform transition-transform hover:scale-105">
              <h2 className="text-xl font-bold text-white mb-2">{game.name}</h2>
              <p className="text-gray-300 mb-4">{game.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between items-center">
                <span className="text-blue-400">Play</span>
                <span className="bg-blue-900 px-2 py-1 rounded text-sm">
                  {game.id === 'memory' && 'Memory Game'}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      {unlockedGames.length === 0 && (
        <div className="text-center text-gray-300 py-16">
          <p>No games available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default GamesListPage;