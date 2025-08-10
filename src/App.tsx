import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useStore } from './store/useStore';

function App() {
  const { 
    initialize, 
    startUpdateLoop, 
    stopUpdateLoop, 
    loadCableData, 
    startCableHighlightLoop, 
    stopCableHighlightLoop 
  } = useStore();

  useEffect(() => {
    // Initialize data and start update loop
    initialize();
    startUpdateLoop();
    
    // Load cable data and start highlight loop
    loadCableData().then(() => {
      startCableHighlightLoop();
    });

    // Cleanup on unmount
    return () => {
      stopUpdateLoop();
      stopCableHighlightLoop();
    };
  }, [initialize, startUpdateLoop, stopUpdateLoop, loadCableData, startCableHighlightLoop, stopCableHighlightLoop]);

  return (
    <div className="app">
      <AppShell />
    </div>
  );
}

export default App;