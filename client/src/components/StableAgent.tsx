import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import { Agent as AgentType } from '../lib/types';
import { useSimulation } from '../lib/stores/useSimulation';

interface StableAgentProps {
  agentId: string;
  initialData: AgentType;
}

/**
 * Stable Agent Component - Designed to minimize re-renders
 * This component does NOT use props that change frequently.
 * It uses refs and direct access to the store to update the agent.
 */
const StableAgent: React.FC<StableAgentProps> = ({ agentId, initialData }) => {
  // Store refs to avoid re-renders
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  const dataRef = useRef<AgentType>(initialData);
  const lastUpdateRef = useRef<number>(0);
  const { getAgentById, focusedAgentId, setFocusedAgent } = useSimulation();
  
  // Only reference identity-related properties from props
  const isInitiallyAdam = agentId === 'adam';
  const isInitiallyEve = agentId === 'eve';
  
  // Create fixed colors for adam and eve
  const fixedColor = useMemo(() => {
    if (isInitiallyAdam) return new THREE.Color('#ff5555'); // Red for Adam
    if (isInitiallyEve) return new THREE.Color('#5555ff');  // Blue for Eve
    return new THREE.Color(initialData.color);
  }, [isInitiallyAdam, isInitiallyEve, initialData.color]);
  
  // Set up initial position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(
        initialData.position.x,
        0.5,
        initialData.position.z
      );
      
      // Pre-set rotation
      meshRef.current.rotation.y = initialData.rotation.y;
      
      // Set scale
      const scale = initialData.scale;
      meshRef.current.scale.set(scale, scale, scale);
    }
  }, []);
  
  // Update text position
  useEffect(() => {
    if (textRef.current && meshRef.current) {
      textRef.current.position.x = meshRef.current.position.x;
      textRef.current.position.y = meshRef.current.position.y + 1.2;
      textRef.current.position.z = meshRef.current.position.z;
    }
  }, []);
  
  // Agent update effect using a low interval to stabilize
  useEffect(() => {
    const updateAgent = () => {
      // Get fresh agent data from store
      const agent = getAgentById(agentId);
      if (!agent) return;
      
      // Store the latest data
      dataRef.current = agent;
      
      // Update mesh position and rotation very smoothly
      if (meshRef.current) {
        // Super smooth interpolation
        meshRef.current.position.x += (agent.position.x - meshRef.current.position.x) * 0.02;
        meshRef.current.position.z += (agent.position.z - meshRef.current.position.z) * 0.02;
        
        // Smooth rotation
        const targetRotation = agent.rotation.y;
        let currentRotation = meshRef.current.rotation.y;
        
        // Handle rotation wrap-around
        while (currentRotation - targetRotation > Math.PI) currentRotation -= 2 * Math.PI;
        while (targetRotation - currentRotation > Math.PI) currentRotation += 2 * Math.PI;
        
        // Apply smooth rotation
        meshRef.current.rotation.y += (targetRotation - currentRotation) * 0.02;
      }
      
      // Update text position
      if (textRef.current && meshRef.current) {
        textRef.current.position.x = meshRef.current.position.x;
        textRef.current.position.y = meshRef.current.position.y + 1.2;
        textRef.current.position.z = meshRef.current.position.z;
      }
    };
    
    // Update at a fixed slower rate
    const intervalId = setInterval(updateAgent, 100); // 10 updates per second
    
    return () => clearInterval(intervalId);
  }, [agentId, getAgentById]);
  
  // Memoize label text to avoid changes
  const labelText = useMemo(() => {
    if (isInitiallyAdam) return 'adam';
    if (isInitiallyEve) return 'eve';
    return `Gen ${initialData.generation}`;
  }, [isInitiallyAdam, isInitiallyEve, initialData.generation]);
  
  return (
    <group>
      {/* Agent body */}
      <mesh
        ref={meshRef}
        position={[initialData.position.x, 0.5, initialData.position.z]}
        onClick={() => setFocusedAgent(agentId)}
        castShadow
      >
        {/* Base body */}
        <capsuleGeometry args={[0.3, 0.6, 6, 12]} />
        <meshStandardMaterial 
          color={fixedColor}
          roughness={0.7}
          metalness={0.1}
          emissive={fixedColor}
          emissiveIntensity={0.2}
        />
        
        {/* Eyes */}
        <group position={[0, 0.5, 0.3]}>
          <mesh position={[-0.15, 0, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
        
        {/* Generation indicator (dots on back) */}
        {Array.from({ length: Math.min(5, initialData.generation) }).map((_, i) => (
          <mesh key={i} position={[0, 0.4 - i * 0.15, -0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}
      </mesh>
      
      {/* Agent label */}
      <Text
        ref={textRef}
        position={[initialData.position.x, initialData.position.y + 1.2, initialData.position.z]}
        fontSize={0.3}
        color={focusedAgentId === agentId ? "#FFFF00" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {labelText}
      </Text>
    </group>
  );
};

export default React.memo(StableAgent);