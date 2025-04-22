import { useRef, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, Sky, Stars, Cloud, Clouds, useTexture } from '@react-three/drei';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '../lib/stores/useSimulation';
import Agent from './Agent';
import Environment from './Environment';
import SimulationUpdater from './SimulationUpdater';
import Terrain from './Terrain';
import Water from './Water';
import Vegetation from './Vegetation';
import { Controls } from '../lib/types';

/**
 * Enhanced natural world environment with terrain, water, and vegetation
 */
const World = () => {
  const controlsRef = useRef<any>();
  const { camera } = useThree();
  
  // Keyboard controls subscription
  const forward = useKeyboardControls<Controls>(state => state.forward);
  const backward = useKeyboardControls<Controls>(state => state.backward);
  const leftward = useKeyboardControls<Controls>(state => state.leftward);
  const rightward = useKeyboardControls<Controls>(state => state.rightward);
  const up = useKeyboardControls<Controls>(state => state.up);
  const down = useKeyboardControls<Controls>(state => state.down);
  
  // Get simulation state
  const { world, focusedAgentId } = useSimulation();
  const { agents, resources, cellGrid, dayNightCycle } = world;
  
  // Handle camera movement based on keyboard input
  useFrame((_, delta) => {
    if (controlsRef.current) {
      // Move camera with keyboard controls
      const moveSpeed = 10 * delta;
      const rotateSpeed = 1 * delta;
      
      // Get camera forward direction (ignoring y component for flat movement)
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      
      // Get camera right direction
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
      
      // Apply movement in camera direction
      if (forward) {
        camera.position.addScaledVector(forward, moveSpeed * 2);
      }
      if (backward) {
        camera.position.addScaledVector(forward, -moveSpeed * 2);
      }
      if (leftward) {
        camera.position.addScaledVector(right, -moveSpeed * 2);
      }
      if (rightward) {
        camera.position.addScaledVector(right, moveSpeed * 2);
      }
      
      // Up/down movement
      if (up) {
        camera.position.y += moveSpeed * 2;
      }
      if (down) {
        camera.position.y = Math.max(1, camera.position.y - moveSpeed * 2);
      }
      
      // Update controls to prevent jump when starting mouse control
      controlsRef.current.update();
    }
  });
  
  // Change camera to focus on a specific agent if selected
  useEffect(() => {
    if (focusedAgentId) {
      const agent = agents.find(a => a.id === focusedAgentId);
      if (agent) {
        // Create a target position slightly above and behind the agent
        const targetPos = new THREE.Vector3(
          agent.position.x - Math.sin(agent.rotation.y) * 5,
          agent.position.y + 3,
          agent.position.z - Math.cos(agent.rotation.y) * 5
        );
        
        // Animate camera to target
        const originalPos = camera.position.clone();
        const startTime = Date.now();
        const duration = 1000; // 1 second
        
        const animateCamera = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          
          // Ease function (easeOutCubic)
          const eased = 1 - Math.pow(1 - progress, 3);
          
          // Interpolate position
          camera.position.lerpVectors(originalPos, targetPos, eased);
          
          // Continue animation until complete
          if (progress < 1) {
            requestAnimationFrame(animateCamera);
          }
        };
        
        requestAnimationFrame(animateCamera);
      }
    }
  }, [focusedAgentId, agents, camera]);
  
  // Calculate ambient light based on day/night cycle
  const ambientIntensity = 0.3 + Math.sin(dayNightCycle * Math.PI * 2) * 0.2;
  const sunIntensity = 0.5 + Math.sin(dayNightCycle * Math.PI * 2) * 0.5;
  const sunPosition = [
    50 * Math.cos(dayNightCycle * Math.PI * 2),
    30 * Math.sin(dayNightCycle * Math.PI * 2),
    0
  ];
  
  // Time of day parameters for sky
  const isDay = dayNightCycle > 0.25 && dayNightCycle < 0.75;
  const sunriseOrSunset = (dayNightCycle > 0.2 && dayNightCycle < 0.3) || 
                          (dayNightCycle > 0.7 && dayNightCycle < 0.8);
  
  // Cloud parameters based on time of day
  const cloudOpacity = isDay ? 1 : 0.3;
  
  return (
    <>
      {/* Add the simulation updater */}
      <SimulationUpdater />
      
      <Stats />
      
      {/* Camera Controls */}
      <OrbitControls 
        ref={controlsRef} 
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below ground
      />
      
      {/* Enhanced Atmospheric Lighting with softer shadows */}
      <ambientLight intensity={ambientIntensity * 0.7 + 0.2} /> {/* Higher base to reduce contrast */}
      <directionalLight 
        position={sunPosition as [number, number, number]} 
        intensity={sunIntensity * 0.8} // Reduced intensity
        castShadow
        shadow-mapSize={[1024, 1024]} // Lower resolution but adequate
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-radius={2} // Blur shadow edges for softer look
        shadow-bias={-0.001} // Reduce shadow acne
      />
      
      {/* Secondary fill light to soften shadows */}
      <directionalLight 
        position={[-30, 30, 30]} 
        intensity={0.2} 
        color="#E0E8FF" // Slightly blue to simulate sky light
      />
      
      {/* Hemisphere light - gentler ground/sky contrast */}
      <hemisphereLight args={['#d0e0ff', '#f0e0c0', 0.4]} />
      
      {/* Dynamic Sky based on day/night cycle - gentler parameters */}
      <Sky 
        distance={450000} 
        sunPosition={sunPosition as [number, number, number]}
        inclination={0.6}
        azimuth={dayNightCycle * 360}
        turbidity={isDay ? 8 : 12} // Less extreme values
        rayleigh={isDay ? 0.5 : 0.8} // Less extreme for night
        mieCoefficient={0.003} // Reduced
        mieDirectionalG={0.7} // Less directional
      />
      
      {/* Stars with dynamic opacity based on time of day */}
      <group visible={true}>
        <Stars 
          radius={100} 
          depth={50} 
          count={1500} // Reduced count for better performance
          factor={4} 
          fade 
          speed={0.1} // Slower animation
        />
        {/* Custom shader to control star opacity */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial 
            color="black" 
            transparent 
            opacity={isDay ? 0.9 : 0} // Overlay to dim stars during day
          />
        </mesh>
      </group>
      
      {/* Gentle clouds with fixed properties */}
      <Suspense fallback={null}>
        <group position={[0, 80, 0]}>
          {Array.from({ length: 8 }).map((_, i) => {
            // Use fixed positions for less random appearance
            const angle = (i / 8) * Math.PI * 2;
            const radius = 50 + (i % 3) * 15;
            return (
              <Cloud 
                key={i}
                position={[
                  Math.cos(angle) * radius, 
                  20 + Math.sin(i * 0.5) * 10, 
                  Math.sin(angle) * radius
                ]}
                speed={0.05} // Very slow movement
                opacity={0.4} // Fixed mid-range opacity
              />
            );
          })}
        </group>
      </Suspense>
      
      {/* Natural Terrain with height variation */}
      <Terrain 
        size={100} 
        height={8} 
        resolution={128} 
        roughness={0.8}
        position={[0, -0.5, 0]}
      />
      
      {/* Water Features */}
      <Water 
        position={[-15, 0, 20]} 
        size={25}
        depth={2}
        color={sunriseOrSunset ? '#FF9E80' : '#29B6F6'} // Sunset reflection
        opacity={0.8}
      />

      {/* Vegetation */}
      <Vegetation 
        count={200}
        area={100}
        minHeight={1}
        maxHeight={5}
        centerClearRadius={10}
      />
      
      {/* Resources */}
      {resources.map(resource => (
        <mesh 
          key={resource.id} 
          position={[
            resource.position.x, 
            resource.position.y + (resource.type === 'light' ? 4 : 0), // Light resources float above
            resource.position.z
          ]}
          castShadow
        >
          {resource.type === 'food' ? (
            <sphereGeometry args={[0.5, 16, 16]} />
          ) : resource.type === 'water' ? (
            <cylinderGeometry args={[1, 1, 0.2, 32]} />
          ) : (
            <coneGeometry args={[0.5, 1, 16]} />
          )}
          
          <meshStandardMaterial 
            color={
              resource.type === 'food' 
                ? '#8BC34A' 
                : resource.type === 'water' 
                ? '#29B6F6' 
                : '#FFD600'
            }
            emissive={resource.type === 'light' ? '#FFEB3B' : '#000000'}
            emissiveIntensity={resource.type === 'light' ? 0.5 : 0}
          />
        </mesh>
      ))}
      
      {/* Agents */}
      {agents.map(agent => (
        <Agent key={agent.id} agent={agent} isFocused={agent.id === focusedAgentId} />
      ))}
      
      {/* Resource visualization (simplified) - hidden by default */}
      {cellGrid.flat().map((cell, index) => (
        <mesh 
          key={`cell-${index}`} 
          position={[cell.position.x, 0.02, cell.position.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false} // Hidden by default, can be toggled via UI
        >
          <planeGeometry args={[9.5, 9.5]} />
          <meshBasicMaterial 
            color={new THREE.Color(
              0.5 - cell.resources.food * 0.5,
              0.5 + cell.resources.food * 0.5,
              0.5 - cell.resources.water * 0.5
            )}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </>
  );
};

export default World;
