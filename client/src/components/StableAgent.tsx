import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { Agent as AgentType } from '../lib/types';
import { useSimulation } from '../lib/stores/useSimulation';
import { useFrame } from '@react-three/fiber';

interface StableAgentProps {
  agentId: string;
  initialData: AgentType;
}

/**
 * Completely Re-designed Stable Agent Component
 * This component uses a custom frame-by-frame animation approach
 * instead of relying on React's render cycle
 */
const StableAgent: React.FC<StableAgentProps> = ({ agentId, initialData }) => {
  // Store refs for direct WebGL manipulation
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Store a ref to avoid accessing the store too frequently
  const dataRef = useRef<AgentType>(initialData);
  
  // Flags for optimization
  const initializedRef = useRef<boolean>(false);
  const frameCountRef = useRef<number>(0);
  
  // Get what we need from the simulation store
  const { getAgentById, focusedAgentId, setFocusedAgent } = useSimulation();
  
  // Only use these for identity, never for rendering
  const isAdam = agentId === 'adam';
  const isEve = agentId === 'eve';
  
  // Fixed colors - NEVER changing
  const agentColor = useMemo(() => {
    if (isAdam) return '#ff5555'; // Red for Adam
    if (isEve) return '#5555ff';  // Blue for Eve
    
    // For others, use seeded random color based on ID
    // This ensures the color is always the same for the same ID
    const numericId = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = (numericId % 360) / 360;
    const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
    return color.getStyle();
  }, [agentId]);
  
  // Fixed label text - NEVER changing
  const labelText = useMemo(() => {
    if (isAdam) return 'adam';
    if (isEve) return 'eve';
    return `Gen ${initialData.generation}`;
  }, [agentId]);
  
  // One-time initialization
  useEffect(() => {
    if (!initializedRef.current && meshRef.current) {
      // Position the mesh
      meshRef.current.position.set(
        initialData.position.x,
        0.5,
        initialData.position.z
      );
      
      // Set initial rotation
      meshRef.current.rotation.y = initialData.rotation.y;
      
      // Set scale
      const scale = initialData.scale;
      meshRef.current.scale.set(scale, scale, scale);
      
      initializedRef.current = true;
    }
  }, []);
  
  // Use frame-based animation for super smooth movement
  useFrame((_, delta) => {
    // Only update every few frames for performance
    frameCountRef.current += 1;
    if (frameCountRef.current % 5 !== 0) return;
    
    // Get fresh agent data every 5th frame
    const agent = getAgentById(agentId);
    if (!agent) return;
    
    // Store the latest data
    dataRef.current = agent;
    
    if (meshRef.current) {
      // Extremely smooth interpolation - important for stopping flicker
      const lerpFactor = 0.01; // Very slow movement for stability
      
      meshRef.current.position.x += (agent.position.x - meshRef.current.position.x) * lerpFactor;
      meshRef.current.position.z += (agent.position.z - meshRef.current.position.z) * lerpFactor;
      
      // Smooth rotation
      const targetRotation = agent.rotation.y;
      let currentRotation = meshRef.current.rotation.y;
      
      // Handle rotation wrap-around
      while (currentRotation - targetRotation > Math.PI) currentRotation -= 2 * Math.PI;
      while (targetRotation - currentRotation > Math.PI) currentRotation += 2 * Math.PI;
      
      // Apply smooth rotation
      meshRef.current.rotation.y += (targetRotation - currentRotation) * lerpFactor;
      
      // Update text position
      if (textRef.current) {
        textRef.current.position.x = meshRef.current.position.x;
        textRef.current.position.y = meshRef.current.position.y + 1.2;
        textRef.current.position.z = meshRef.current.position.z;
      }
      
      // Animate eyes
      if (eyesRef.current && frameCountRef.current % 100 === 0) {
        // Occasional blink animation
        eyesRef.current.scale.y = 0.1;
        setTimeout(() => {
          if (eyesRef.current) eyesRef.current.scale.y = 1;
        }, 100);
      }
    }
  });
  
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
          ref={materialRef}
          color={agentColor}
          roughness={0.7}
          metalness={0.1}
          emissive={agentColor}
          emissiveIntensity={0.2}
        />
        
        {/* Eyes */}
        <group ref={eyesRef} position={[0, 0.5, 0.3]}>
          <mesh position={[-0.15, 0, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
        
        {/* Generation indicator (dots on back) - fixed at initialization */}
        {Array.from({ length: Math.min(5, initialData.generation) }).map((_, i) => (
          <mesh key={i} position={[0, 0.4 - i * 0.15, -0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}
      </mesh>
      
      {/* Agent label - pre-rendered and fixed */}
      <Text
        ref={textRef}
        position={[initialData.position.x, initialData.position.y + 1.2, initialData.position.z]}
        fontSize={0.3}
        color="#FFFFFF"
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

// Use React.memo to ensure this component only renders once
export default React.memo(StableAgent);