import { useEffect } from 'react';
import { useSimulation } from '../lib/stores/useSimulation';

/**
 * This component uses setInterval instead of animation frame
 * to drastically slow down simulation updates
 */
const SimulationUpdater = () => {
  const { updateSimulation, running } = useSimulation();
  
  useEffect(() => {
    console.log("SimulationUpdater mounted with stabilized interval");
    
    // Instead of animation frame, use a slow interval
    // This will completely separate simulation from rendering
    let intervalId: NodeJS.Timeout | null = null;
    
    if (running) {
      // Update only once per second (1 FPS)
      intervalId = setInterval(() => {
        updateSimulation(1/60); // Fixed time step
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
      console.log("SimulationUpdater unmounted");
    };
  }, [running, updateSimulation]);
  
  return null;
};

export default SimulationUpdater;