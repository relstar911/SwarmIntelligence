import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Agent as AgentType } from '../lib/types';
import { useSimulation } from '../lib/stores/useSimulation';
import { Text, Html } from '@react-three/drei';

interface AgentProps {
  agent: AgentType;
  isFocused: boolean;
}

const Agent: React.FC<AgentProps> = ({ agent, isFocused }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { setFocusedAgent } = useSimulation();
  
  // Create smooth animation for agent movement and rotation
  useFrame(() => {
    if (meshRef.current) {
      // Smoothly move to target position
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, agent.position.x, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, agent.position.z, 0.1);
      
      // Smoothly rotate to target rotation
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, agent.rotation.y, 0.1);
      
      // Update text position to follow the agent
      if (textRef.current) {
        textRef.current.position.x = meshRef.current.position.x;
        textRef.current.position.y = meshRef.current.position.y + 1.2;
        textRef.current.position.z = meshRef.current.position.z;
        
        // Make text face the camera
        textRef.current.lookAt(0, 0, 0);
      }
    }
  });
  
  // Calculate consciousness-based visual effects
  const consciousnessScale = Math.max(0.5, Math.min(1.5, agent.consciousnessValue / 100 + 0.5));
  const pulseSpeed = 0.5 + (agent.consciousnessValue / 100) * 2;
  const glowIntensity = Math.min(1, agent.consciousnessValue / 100);
  
  // Pulse effect based on consciousness
  const [phase, setPhase] = useState(0);
  useFrame((_, delta) => {
    setPhase(prev => (prev + delta * pulseSpeed) % (Math.PI * 2));
  });
  
  // Color based on traits
  const traitColor = new THREE.Color(agent.color);
  
  // Animation for new agents
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(0, 0, 0);
      
      // Grow animation
      const startTime = Date.now();
      const duration = 1000; // 1 second
      
      const growAnimation = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Ease function (elastic out)
        const eased = Math.pow(2, -10 * progress) * Math.sin((progress - 0.1) * 5 * Math.PI) + 1;
        
        if (meshRef.current) {
          const scale = agent.scale * eased;
          meshRef.current.scale.set(scale, scale, scale);
        }
        
        if (progress < 1) {
          requestAnimationFrame(growAnimation);
        }
      };
      
      requestAnimationFrame(growAnimation);
    }
  }, [agent.id, agent.scale]);
  
  // Consciousness indicator pulse
  const pulseScale = 1 + Math.sin(phase) * 0.1 * glowIntensity;
  
  return (
    <group>
      {/* Agent body */}
      <mesh
        ref={meshRef}
        position={[agent.position.x, 0.5, agent.position.z]}
        rotation={[0, agent.rotation.y, 0]}
        onClick={() => setFocusedAgent(agent.id)}
        onPointerOver={() => setShowDetails(true)}
        onPointerOut={() => setShowDetails(false)}
        castShadow
      >
        {/* Base body */}
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial 
          color={traitColor} 
          roughness={0.6}
          metalness={0.2}
          emissive={traitColor}
          emissiveIntensity={glowIntensity * 0.3}
        />
        
        {/* Consciousness indicator */}
        <group position={[0, 0.8, 0]} scale={[pulseScale, pulseScale, pulseScale]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={glowIntensity}
            transparent
            opacity={0.7}
          />
        </group>
        
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
        {Array.from({ length: Math.min(5, agent.generation) }).map((_, i) => (
          <mesh key={i} position={[0, 0.4 - i * 0.15, -0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}
      </mesh>
      
      {/* Agent label */}
      <Text
        ref={textRef}
        position={[agent.position.x, agent.position.y + 1.2, agent.position.z]}
        fontSize={0.3}
        color={isFocused ? "#FFFF00" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {agent.id === 'adam' || agent.id === 'eve' 
          ? agent.id 
          : `Gen ${agent.generation}`}
      </Text>
      
      {/* Detailed information popup */}
      {showDetails && (
        <Html
          position={[agent.position.x, agent.position.y + 2, agent.position.z]}
          center
          distanceFactor={10}
        >
          <div className="bg-slate-800/90 p-2 rounded shadow-lg text-white text-xs w-48">
            <div className="font-bold mb-1">
              {agent.id === 'adam' || agent.id === 'eve' 
                ? agent.id 
                : `Agent ${agent.id.substring(0, 4)}`}
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-xs">
              <div>Consciousness:</div>
              <div>{agent.consciousnessValue.toFixed(1)}</div>
              
              <div>Generation:</div>
              <div>{agent.generation}</div>
              
              <div>Age:</div>
              <div>{agent.age.toFixed(1)}</div>
              
              <div>Energy:</div>
              <div className="relative w-full bg-gray-700 h-2 rounded">
                <div 
                  className="absolute left-0 top-0 bg-green-500 h-2 rounded" 
                  style={{ width: `${agent.energy}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-1 mb-1 font-bold text-xs">Traits:</div>
            <div className="grid grid-cols-2 gap-x-2 text-xs">
              <div>Curiosity:</div>
              <div>{(agent.traits.curiosity * 100).toFixed(0)}%</div>
              
              <div>Social:</div>
              <div>{(agent.traits.socialAffinity * 100).toFixed(0)}%</div>
              
              <div>Resources:</div>
              <div>{(agent.traits.resourceAffinity * 100).toFixed(0)}%</div>
              
              <div>Exploration:</div>
              <div>{(agent.traits.exploration * 100).toFixed(0)}%</div>
              
              <div>Adaptability:</div>
              <div>{(agent.traits.adaptability * 100).toFixed(0)}%</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Agent;
