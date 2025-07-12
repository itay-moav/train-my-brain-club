import { Route, Routes } from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { appInit } from './store/applicationSlice';
import { loadSavedProgress } from './store/gameSlice/gameSlice';
import GameUnlockNotification from "./components/GameUnlockNotification";
import ResetGameData from "./components/ResetGameData";

//LAYOUT(s)
import Layout from "./components/layout/layout.jsx";

//ROUTES
import HomePage from "./pages/HomePage";
import GamesListPage from "./pages/GamesListPage";
import GamePage from "./pages/GamePage";
import TestMemory from "./games/memory/TestMemory";

//ERROR ROUTES
import NotFound from "./components/errorPages/notFound.jsx";

function App() {
  const dispatch = useDispatch();
  
  // Initialize app and check for returning user
  useEffect(() => {
    // Load app data
    // SILENCED FOR NOW. dispatch(appInit());
    
    // Load saved game progress
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
      <>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/games" element={<GamesListPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="/test-memory" element={<TestMemory />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <GameUnlockNotification />
        <ResetGameData />
      </>
  )
}
export default App;
