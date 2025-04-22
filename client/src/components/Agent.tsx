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
  // Use a stable ID to ensure the component maintains identity correctly
  const agentId = agent.id;
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { setFocusedAgent } = useSimulation();
  
  // Store the agent's current position in a ref to avoid recreating the mesh on every update
  const positionRef = useRef({
    x: agent.position.x,
    y: agent.position.y,
    z: agent.position.z
  });
  
  // Store the agent's rotation in a ref
  const rotationRef = useRef({ y: agent.rotation.y });
  
  // Store current color in a ref
  const colorRef = useRef(agent.color);
  
  // Create smooth animation for agent movement and rotation
  useFrame(() => {
    if (meshRef.current) {
      // Update target positions in refs
      positionRef.current = {
        x: agent.position.x,
        y: agent.position.y, 
        z: agent.position.z
      };
      rotationRef.current = { y: agent.rotation.y };
      colorRef.current = agent.color;
      
      // Smoothly move to target position with a slower interpolation
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, positionRef.current.x, 0.05);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, positionRef.current.z, 0.05);
      
      // Smoothly rotate to target rotation
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotationRef.current.y, 0.05);
      
      // Update text position to follow the agent
      if (textRef.current) {
        textRef.current.position.x = meshRef.current.position.x;
        textRef.current.position.y = meshRef.current.position.y + 1.2;
        textRef.current.position.z = meshRef.current.position.z;
      }
    }
  });
  
  // Calculate consciousness-based visual effects
  const consciousnessScale = Math.max(0.5, Math.min(1.5, agent.consciousnessValue / 100 + 0.5));
  const pulseSpeed = 0.5 + (agent.consciousnessValue / 100) * 2;
  const glowIntensity = Math.min(1, agent.consciousnessValue / 100);
  
  // Pulse effect based on consciousness - slower for less flickering
  const [phase, setPhase] = useState(0);
  useFrame((_, delta) => {
    // Reduce update frequency for smoother appearance
    if (Math.random() > 0.5) { // Only update half the frames
      setPhase(prev => (prev + delta * (pulseSpeed * 0.3)) % (Math.PI * 2)); // Slower pulse
    }
  });
  
  // Use the previously stored color for less flickering
  const traitColor = new THREE.Color(colorRef.current);
  
  // Animation for new agents - only at initial creation
  useEffect(() => {
    if (meshRef.current) {
      // Start from a more visible size instead of zero
      meshRef.current.scale.set(0.3, 0.3, 0.3);
      
      // Grow animation - more gentle
      const startTime = Date.now();
      const duration = 1500; // Slower animation (1.5 seconds)
      
      const growAnimation = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Simpler, less bouncy ease function
        const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        
        if (meshRef.current) {
          const scale = 0.3 + (agent.scale - 0.3) * eased;
          meshRef.current.scale.set(scale, scale, scale);
        }
        
        if (progress < 1) {
          requestAnimationFrame(growAnimation);
        }
      };
      
      requestAnimationFrame(growAnimation);
    }
  }, [agent.id]); // Only depend on agent.id, not scale
  
  // Gentler consciousness indicator pulse
  const pulseScale = 1 + Math.sin(phase) * 0.05 * glowIntensity; // Reduced amplitude
  
  // Transform agentId into a consistent color (for debug purposes)
  const getDebugColor = (id: string) => {
    // This ensures that Adam is always red and Eve is always blue
    if (id === 'adam') return '#ff5555';
    if (id === 'eve') return '#5555ff';
    return agent.color;
  };
  
  return (
    <group>
      {/* Agent body with consistent identity */}
      <mesh
        ref={meshRef}
        position={[agent.position.x, 0.5, agent.position.z]}
        rotation={[0, agent.rotation.y, 0]}
        onClick={() => setFocusedAgent(agent.id)}
        onPointerOver={() => setShowDetails(true)}
        onPointerOut={() => setShowDetails(false)}
        castShadow
      >
        {/* Base body - simpler geometry for better performance */}
        <capsuleGeometry args={[0.3, 0.6, 6, 12]} />
        <meshStandardMaterial 
          color={agent.id === 'adam' || agent.id === 'eve' ? getDebugColor(agent.id) : traitColor}
          roughness={0.7} // Higher roughness for less visual noise
          metalness={0.1} // Lower metalness for more consistent appearance
          emissive={traitColor}
          emissiveIntensity={0.2} // Lower intensity for less flicker
        />
        
        {/* Consciousness indicator - gentler glow */}
        <group position={[0, 0.8, 0]} scale={[pulseScale, pulseScale, pulseScale]}>
          <sphereGeometry args={[0.1, 8, 8]} /> {/* Reduced geometry complexity */}
          <meshStandardMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={glowIntensity * 0.5} // Reduced intensity
            transparent
            opacity={0.5} // Lower opacity for less visual impact
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
