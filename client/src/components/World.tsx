import React, { useRef, Suspense } from 'react';
import { Stats, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '../lib/stores/useSimulation';
import Terrain from './Terrain';

/**
 * Vereinfachte Simulationsupdater-Komponente mit festen Intervallen
 */
const IntervalSimulationUpdater: React.FC = () => {
  const { updateSimulation, running } = useSimulation();
  
  React.useEffect(() => {
    console.log("Simulation mit Intervallen statt Animation gestartet");
    
    let intervalId: NodeJS.Timeout | null = null;
    
    if (running) {
      // 1-Sekunden-Intervall für Updates statt Animation-Frame
      intervalId = setInterval(() => {
        updateSimulation(1/60);
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
 * Stark vereinfachte Welt ohne komplexe Animation
 */
const World: React.FC = () => {
  const { world, focusedAgentId } = useSimulation();
  const { agents, resources, dayNightCycle } = world;
  
  // Ref für Orbit-Controls
  const controlsRef = useRef<any>();
  
  // Tag/Nacht-Zyklus Beleuchtung
  const ambientIntensity = 0.3 + Math.sin(dayNightCycle * Math.PI * 2) * 0.2;
  
  // Vereinfachte Sonnenposition 
  const sunPosition: [number, number, number] = [
    50 * Math.cos(dayNightCycle * Math.PI * 2),
    Math.max(5, 30 * Math.sin(dayNightCycle * Math.PI * 2)), // Sonne bleibt immer über dem Horizont
    0
  ];
  
  return (
    <>
      {/* Simulation Updater mit Interval */}
      <IntervalSimulationUpdater />
      
      {/* Performance-Statistiken */}
      <Stats />
      
      {/* Kamerasteuerung */}
      <OrbitControls 
        ref={controlsRef} 
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
      />
      
      {/* Grundbeleuchtung */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={sunPosition} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      
      {/* Keine animierten Elemente, nur ein statischer Sternenhimmel */}
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={4} 
        fade={true}
        speed={0} // Keine Animation
      />
      
      {/* Vereinfachtes Terrain */}
      <Suspense fallback={null}>
        <Terrain size={200} height={5} resolution={64} position={[0, -0.5, 0]} />
      </Suspense>
      
      {/* Statische Agenten ohne Animation */}
      {agents.map(agent => (
        <mesh 
          key={agent.id} 
          position={[agent.position.x, agent.position.y, agent.position.z]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={agent.color} />
        </mesh>
      ))}
      
      {/* Ressourcen */}
      {resources.map(resource => (
        <mesh 
          key={resource.id} 
          position={[resource.position.x, resource.position.y + 0.5, resource.position.z]}
          castShadow
        >
          {resource.type === 'food' ? (
            <sphereGeometry args={[0.5, 8, 8]} />
          ) : resource.type === 'water' ? (
            <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
          ) : (
            <boxGeometry args={[0.5, 0.5, 0.5]} />
          )}
          
          <meshStandardMaterial 
            color={
              resource.type === 'food' 
                ? '#4CAF50' 
                : resource.type === 'water' 
                ? '#2196F3' 
                : '#FFEB3B'
            }
          />
        </mesh>
      ))}
    </>
  );
};

export default World;
