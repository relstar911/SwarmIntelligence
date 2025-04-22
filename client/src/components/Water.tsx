import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

interface WaterProps {
  position?: [number, number, number];
  size?: number;
  depth?: number;
  color?: string;
  opacity?: number;
}

/**
 * Animated water surface with realistic wave effect
 */
const Water: React.FC<WaterProps> = ({
  position = [0, 0, 0],
  size = 40,
  depth = 0.2,
  color = '#29B6F6',
  opacity = 0.8
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load water texture
  const waterTexture = useTexture('/textures/sky.png');
  waterTexture.wrapS = THREE.RepeatWrapping;
  waterTexture.wrapT = THREE.RepeatWrapping;
  waterTexture.repeat.set(4, 4);
  
  // Animate waves
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      
      if (geometry.attributes.position && geometry.attributes.position.array) {
        const positions = geometry.attributes.position.array;
        
        // Create wave effect
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const z = positions[i + 2];
          
          // Create waves with multiple frequencies for realism
          positions[i + 1] = Math.sin(x * 0.5 + time) * 0.1 + 
                             Math.sin(z * 0.3 + time * 0.8) * 0.15;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[size, size, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.1}
        metalness={0.2}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        map={waterTexture}
      />
    </mesh>
  );
};

export default Water;