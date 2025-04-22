import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

interface VegetationProps {
  count?: number;
  area?: number;
  minHeight?: number;
  maxHeight?: number;
  centerClearRadius?: number;
}

/**
 * Procedurally generated vegetation (trees, bushes) for the environment
 */
const Vegetation: React.FC<VegetationProps> = ({
  count = 100,
  area = 100,
  minHeight = 1,
  maxHeight = 5,
  centerClearRadius = 10
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Load tree texture
  const woodTexture = useTexture('/textures/wood.jpg');
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  
  const leafTexture = useTexture('/textures/grass.png');
  leafTexture.wrapS = THREE.RepeatWrapping;
  leafTexture.wrapT = THREE.RepeatWrapping;

  // Generate random tree instances with different parameters
  const treeData = useMemo(() => {
    const data = [];
    const halfArea = area / 2;
    
    for (let i = 0; i < count; i++) {
      // Random position within the area
      let x = (Math.random() - 0.5) * area;
      let z = (Math.random() - 0.5) * area;
      
      // Avoid placing trees in the center area (where agents start)
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < centerClearRadius) {
        // Move tree outside of the clear radius
        const angle = Math.atan2(z, x);
        x = Math.cos(angle) * (centerClearRadius + Math.random() * 5);
        z = Math.sin(angle) * (centerClearRadius + Math.random() * 5);
      }
      
      // Tree properties
      const height = minHeight + Math.random() * (maxHeight - minHeight);
      const treeType = Math.random() > 0.7 ? 'pine' : 'normal';
      const trunkRadius = height * 0.05 + Math.random() * 0.1;
      const trunkHeight = height * 0.6;
      const canopyRadius = height * 0.3 + Math.random() * 0.2;
      const canopyHeight = height * 0.4;
      
      data.push({
        position: [x, 0, z],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        scale: 1 + Math.random() * 0.5,
        height,
        treeType,
        trunkRadius,
        trunkHeight,
        canopyRadius,
        canopyHeight
      });
    }
    
    return data;
  }, [count, area, minHeight, maxHeight, centerClearRadius]);

  // Very subtle wind effect animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime() * 0.2; // Slow down time
      const trees = groupRef.current.children;
      
      // Only update every few frames to reduce performance impact
      if (Math.floor(time * 10) % 5 !== 0) return;
      
      trees.forEach((tree, i) => {
        // Apply very gentle swaying motion to the trees
        if (i % 3 === 0) { // Only animate every third tree for performance
          const canopy = tree.children[1]; // Assuming trunk is [0] and canopy is [1]
          if (canopy) {
            const windStrength = 0.003; // Much subtler movement
            const windFrequency = 0.2 + (i % 5) * 0.02; // Slower frequencies
            
            // Very gentle rotation
            canopy.rotation.x = Math.sin(time * windFrequency) * windStrength;
            canopy.rotation.z = Math.cos(time * windFrequency * 0.5) * windStrength;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {treeData.map((tree, index) => (
        <group 
          key={index} 
          position={tree.position as [number, number, number]}
          rotation={tree.rotation as [number, number, number]}
          scale={[tree.scale, tree.scale, tree.scale]}
        >
          {/* Tree trunk */}
          <mesh castShadow position={[0, tree.trunkHeight / 2, 0]}>
            <cylinderGeometry args={[tree.trunkRadius, tree.trunkRadius * 1.2, tree.trunkHeight, 8]} />
            <meshStandardMaterial 
              map={woodTexture} 
              color="#8B4513" 
              roughness={0.9}
            />
          </mesh>
          
          {/* Tree canopy */}
          <group position={[0, tree.trunkHeight + tree.canopyHeight / 2, 0]}>
            {tree.treeType === 'pine' ? (
              // Pine tree (cone shape)
              <mesh castShadow>
                <coneGeometry args={[tree.canopyRadius, tree.canopyHeight, 8]} />
                <meshStandardMaterial 
                  map={leafTexture}
                  color="#2E8B57" 
                  roughness={0.8}
                />
              </mesh>
            ) : (
              // Regular tree (sphere shape)
              <mesh castShadow>
                <sphereGeometry args={[tree.canopyRadius, 8, 8]} />
                <meshStandardMaterial 
                  map={leafTexture}
                  color="#228B22" 
                  roughness={0.8}
                />
              </mesh>
            )}
          </group>
        </group>
      ))}
    </group>
  );
};

export default Vegetation;