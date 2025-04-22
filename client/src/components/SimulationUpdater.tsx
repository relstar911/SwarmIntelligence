import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulation } from '../lib/stores/useSimulation';

/**
 * This component handles the simulation updates using the useFrame hook
 * from React Three Fiber. It must be used within a Canvas component.
 */
const SimulationUpdater: React.FC = () => {
  const { running, updateSimulation } = useSimulation();
  
  // Run simulation loop using useFrame
  useFrame((_, delta) => {
    if (running) {
      updateSimulation(delta);
    }
  });
  
  // For debugging purposes
  useEffect(() => {
    console.log('SimulationUpdater mounted');
    return () => console.log('SimulationUpdater unmounted');
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default SimulationUpdater;