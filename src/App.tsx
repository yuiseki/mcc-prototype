import React, { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useStore } from './store/useStore';

function App() {
  const { initialize, startUpdateLoop, stopUpdateLoop } = useStore();

  useEffect(() => {
    // Initialize data and start update loop
    initialize();
    startUpdateLoop();

    // Cleanup on unmount
    return () => {
      stopUpdateLoop();
    };
  }, [initialize, startUpdateLoop, stopUpdateLoop]);

  return (
    <div className="app">
      <AppShell />
    </div>
  );
}

export default App;