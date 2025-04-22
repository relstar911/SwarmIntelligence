import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '../lib/stores/useSimulation';

/**
 * Simple simulation updater using slow intervals
 */
const SimulationUpdater: React.FC = () => {
  const { updateSimulation, running } = useSimulation();
  
  useEffect(() => {
    console.log("Simulation updating at fixed 1s intervals");
    
    // Only update at 1s intervals to prevent flickering
    let intervalId: NodeJS.Timeout | null = null;
    
    if (running) {
      intervalId = setInterval(() => {
        updateSimulation(1/60); // Fixed time step
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("SimulationUpdater unmounted");
      }
    };
  }, [running, updateSimulation]);
  
  return null;
};

/**
 * The World Component
 */
const WorldContent: React.FC = () => {
  const { world } = useSimulation();
  const { dayNightCycle } = world;
  
  // Simple day/night ambient light effect
  const ambientIntensity = 0.3 + Math.sin(dayNightCycle * Math.PI * 2) * 0.2;
  
  return (
    <>
      <Stats />
      
      {/* Camera Controls */}
      <OrbitControls 
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
      />
      
      {/* Simulation updater component */}
      <SimulationUpdater />
      
      {/* Basic lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      
      {/* Simple terrain */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#225533" />
      </mesh>
      
      {/* Adam (red cube) - static position */}
      <mesh position={[-5, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff5555" />
      </mesh>
      
      {/* Eve (blue cube) - static position */}
      <mesh position={[5, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5555ff" />
      </mesh>
      
      {/* Static resource (green sphere) */}
      <mesh position={[0, 0.5, 10]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#8BC34A" />
      </mesh>
    </>
  );
};

/**
 * Extrem vereinfachte Welt mit festen Elementen
 */
const MinimalWorld: React.FC = () => {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 8, 20], fov: 50 }}
      style={{ height: '100vh' }}
    >
      <color attach="background" args={["#000033"]} />
      <WorldContent />
    </Canvas>
  );
};

export default MinimalWorld;