import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulation } from '../lib/stores/useSimulation';

/**
 * This component handles the simulation updates using the useFrame hook
 * from React Three Fiber. It must be used within a Canvas component.
 */
const SimulationUpdater: React.FC = () => {
  const { running, updateSimulation } = useSimulation();
  
  // Reference to track time between updates
  const lastUpdateTimeRef = useRef(0);
  const updateIntervalRef = useRef(1/30); // Update at 30 fps maximum
  
  // Run simulation loop using useFrame but at a lower, more stable rate
  useFrame((state, delta) => {
    if (running) {
      const currentTime = state.clock.getElapsedTime();
      // Only update every 1/30th of a second
      if (currentTime - lastUpdateTimeRef.current >= updateIntervalRef.current) {
        updateSimulation(updateIntervalRef.current); // Fixed timestep
        lastUpdateTimeRef.current = currentTime;
      }
    }
  });
  
  // For debugging purposes
  useEffect(() => {
    console.log('SimulationUpdater mounted with stabilized update rate');
    return () => console.log('SimulationUpdater unmounted');
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default SimulationUpdater;