import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { Agent as AgentType } from '../lib/types';

interface BasicAgentProps {
  agent: AgentType;
  isFocused: boolean;
}

/**
 * Simple, static agent component with no animations or special effects
 * Just a basic 3D representation that doesn't change or animate
 */
const BasicAgent: React.FC<BasicAgentProps> = ({ agent, isFocused }) => {
  // Fixed colors by ID to prevent color changing
  const getFixedColor = () => {
    if (agent.id === 'adam') return '#ff5555'; // Red for Adam
    if (agent.id === 'eve') return '#5555ff';  // Blue for Eve
    
    // For others, use a hash of the ID
    const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = (hash % 360) / 360;
    return new THREE.Color().setHSL(hue, 0.7, 0.5).getStyle();
  };
  
  const color = getFixedColor();
  
  // We'll use simple, static text for the label
  const labelText = agent.id === 'adam' ? 'Adam' : 
                   agent.id === 'eve' ? 'Eve' : 
                   `Gen ${agent.generation}`;
  
  return (
    <group position={[agent.position.x, 0.5, agent.position.z]}>
      {/* Agent body - very simple geometry */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 1, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Simple text label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {labelText}
      </Text>
    </group>
  );
};

export default BasicAgent;