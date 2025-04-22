import React, { useRef, useMemo } from 'react';
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
 * Animated water surface with gentle, eye-friendly wave effect
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
  
  // Pre-calculate initial positions for smoother animation
  const initialPositions = useMemo(() => {
    const planeGeo = new THREE.PlaneGeometry(size, size, 16, 16); // Reduced resolution
    return planeGeo.attributes.position.array.slice();
  }, [size]);
  
  // Animate waves - much slower and gentler motion
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() * 0.2; // Slowed down time factor
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      
      if (geometry.attributes.position && geometry.attributes.position.array) {
        const positions = geometry.attributes.position.array;
        
        // Create very gentle wave effect
        for (let i = 0; i < positions.length; i += 3) {
          const x = initialPositions[i];
          const z = initialPositions[i + 2];
          
          // Much gentler wave amplitude
          positions[i + 1] = Math.sin(x * 0.1 + time) * 0.03 + 
                             Math.sin(z * 0.08 + time * 0.3) * 0.05;
        }
        
        geometry.attributes.position.needsUpdate = true;
        // Only compute normals occasionally to reduce CPU load
        if (Math.floor(time * 10) % 3 === 0) {
          geometry.computeVertexNormals();
        }
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
      <planeGeometry args={[size, size, 16, 16]} /> {/* Reduced resolution */}
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.3} // Increased for less intense reflections
        metalness={0.1} // Reduced for less intense reflections
        envMapIntensity={0.5} // Reduced intensity
        clearcoat={0.5} // Reduced for less intensity
        clearcoatRoughness={0.2} // More roughness for softer look
        map={waterTexture}
      />
    </mesh>
  );
};

export default Water;