import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulation } from '../lib/stores/useSimulation';

/**
 * This component handles the simulation updates using the useFrame hook
 * from React Three Fiber. It must be used within a Canvas component.
 */
const SimulationUpdater = () => {
  const { updateSimulation, running, saveToDatabase } = useSimulation();
  const throttleRef = useRef({ 
    lastUpdate: 0,
    lastDbSave: 0
  });
  
  // Only log once
  useEffect(() => {
    console.log("SimulationUpdater mounted with stabilized update rate");
    
    return () => {
      console.log("SimulationUpdater unmounted");
    };
  }, []);
  
  // Use useFrame hook to update simulation in animation loop
  useFrame((_, delta) => {
    // Skip updates when simulation is not running
    if (!running) return;
    
    const now = Date.now();
    
    // EXTREME throttling to 4fps max for simulation logic updates
    if (now - throttleRef.current.lastUpdate > 250) { // 250ms = 4fps
      updateSimulation(delta);
      throttleRef.current.lastUpdate = now;
      
      // Save to database every 30 seconds
      if (now - throttleRef.current.lastDbSave > 30000) {
        saveToDatabase().then(() => {
          console.log('Simulation state saved to database.');
        });
        throttleRef.current.lastDbSave = now;
      }
    }
  });
  
  return null;
};

// Export as a memoized component to prevent unnecessary re-renders
export default SimulationUpdater;