import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, useTexture } from '@react-three/drei';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '../lib/stores/useSimulation';
import Agent from './Agent';
import Environment from './Environment';
import SimulationUpdater from './SimulationUpdater';
import { Controls } from '../lib/types';

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
  
  // Ground texture
  const grassTexture = useTexture('/textures/grass.png');
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);
  
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
        maxDistance={100}
        maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below ground
      />
      
      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={sunPosition as [number, number, number]} 
        intensity={sunIntensity} 
        castShadow 
      />
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.7]} />
      
      {/* Skybox */}
      <Environment dayNightCycle={dayNightCycle} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          map={grassTexture} 
          color="#4B8B3B" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Resources */}
      {resources.map(resource => (
        <mesh 
          key={resource.id} 
          position={[resource.position.x, resource.position.y, resource.position.z]}
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
      
      {/* Visualization helpers */}
      <gridHelper 
        args={[100, 10]} 
        position={[0, 0.01, 0]} 
        rotation={[0, 0, 0]} 
      />
      
      {/* Resource visualization (simplified) */}
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
