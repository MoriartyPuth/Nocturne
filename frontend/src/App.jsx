import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TechVault from './views/TechVault';
import TerminalBackground from './components/Vault/TerminalBackground';

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-enter-active');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('page-enter');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('page-enter-active');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div className={transitionStage} style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
      <Routes location={displayLocation}>
        <Route path="/" element={<TechVault />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <TerminalBackground />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
