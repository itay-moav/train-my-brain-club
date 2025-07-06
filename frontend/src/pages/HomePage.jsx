import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { isReturningUser } from '../store/applicationSlice';
import { getUnlockedGames } from '../store/gameSlice/gameSlice';
import Title from '../components/atoms/typography/Title';
import Subtitle from '../components/atoms/typography/Subtitle';
import Card from '../components/atoms/containers/Card';
import PrimaryButton from '../components/atoms/buttons/PrimaryButton';

const HomePage = () => {
  // Check if user is returning from Redux store
  const returningUser = useSelector(isReturningUser());
  const unlockedGames = useSelector(getUnlockedGames);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a192f] p-4">
      {/* Main container */}
      <div className="w-full max-w-md">
        <Card className="text-center">
          <Title>Train My Brain Club</Title>
          
          {returningUser ? (
            <>
              <Subtitle>Welcome back!</Subtitle>
              {/* TODO: Display personalized content based on user's previous performance */}
              <p className="text-gray-300 mb-6">
                Ready to continue your brain training journey?
              </p>
            </>
          ) : (
            <>
              <Subtitle>Welcome to Brain Training</Subtitle>
              <p className="text-gray-300 mb-6">
                Challenge yourself with arcade-style games designed to improve your cognitive abilities.
              </p>
            </>
          )}
          
          <div className="flex flex-col space-y-4">
            {unlockedGames.length > 1 ? (
              <Link to="/games">
                <PrimaryButton className="w-full">
                  Browse Available Games ({unlockedGames.length})
                </PrimaryButton>
              </Link>
            ) : (
              <Link to={`/game/memory`}>
                <PrimaryButton className="w-full bg-green-600 hover:bg-green-700">
                  Start Memory Training
                </PrimaryButton>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;