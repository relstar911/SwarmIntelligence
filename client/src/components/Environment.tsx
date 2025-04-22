import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnvironmentProps {
  dayNightCycle: number;
}

const Environment: React.FC<EnvironmentProps> = ({ dayNightCycle }) => {
  const skyRef = useRef<THREE.Mesh>(null);
  
  // Load sky texture
  const skyTexture = useTexture('/textures/sky.png');
  skyTexture.wrapS = THREE.RepeatWrapping;
  skyTexture.wrapT = THREE.ClampToWrapping;
  skyTexture.repeat.set(4, 1);
  
  // Update sky texture offset based on day/night cycle
  useFrame(() => {
    if (skyRef.current) {
      // Offset texture to simulate day/night
      skyTexture.offset.x = dayNightCycle;
      
      // Rotate sky dome slowly
      skyRef.current.rotation.y += 0.0001;
    }
  });
  
  // Calculate sky color based on time of day
  const skyColor = new THREE.Color();
  if (dayNightCycle < 0.25 || dayNightCycle > 0.75) {
    // Night
    skyColor.setRGB(0.05, 0.05, 0.2);
  } else if (dayNightCycle < 0.3 || dayNightCycle > 0.7) {
    // Sunrise/sunset
    const t = (dayNightCycle < 0.3) 
      ? (dayNightCycle - 0.25) * 20 
      : (0.75 - dayNightCycle) * 20;
    skyColor.setRGB(0.8 * t + 0.05, 0.5 * t + 0.05, 0.2 * t + 0.2);
  } else {
    // Day
    skyColor.setRGB(0.5, 0.7, 1.0);
  }
  
  return (
    <>
      {/* Sky Dome */}
      <mesh ref={skyRef} position={[0, 0, 0]}>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial 
          map={skyTexture} 
          color={skyColor} 
          side={THREE.BackSide} 
          transparent
          opacity={1}
        />
      </mesh>
      
      {/* Stars (visible at night) */}
      <points visible={dayNightCycle < 0.2 || dayNightCycle > 0.8}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={(() => {
              const positions = new Float32Array(3000);
              for (let i = 0; i < 3000; i += 3) {
                // Distribute stars in a dome above the scene
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI * 0.5;
                const radius = 400 + Math.random() * 100;
                
                positions[i] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = radius * Math.cos(phi);
                positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
              }
              return positions;
            })()}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={1.5} 
          color="#FFFFFF" 
          sizeAttenuation 
          opacity={(dayNightCycle < 0.2) 
            ? 1 - dayNightCycle * 5 
            : (dayNightCycle > 0.8) 
              ? (dayNightCycle - 0.8) * 5 
              : 0
          }
          transparent
        />
      </points>
      
      {/* Sun */}
      <mesh 
        position={[
          Math.cos((dayNightCycle) * Math.PI * 2) * 400,
          Math.sin((dayNightCycle) * Math.PI * 2) * 400,
          0
        ]}
      >
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      
      {/* Moon */}
      <mesh 
        position={[
          Math.cos((dayNightCycle + 0.5) * Math.PI * 2) * 300,
          Math.sin((dayNightCycle + 0.5) * Math.PI * 2) * 300,
          0
        ]}
      >
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#DDDDDD" />
      </mesh>
      
      {/* Clouds (simple representation) */}
      {Array.from({ length: 20 }).map((_, i) => {
        // Seed random positions for clouds
        const seed = i * 123.456;
        const x = Math.cos(seed) * 200 * Math.random();
        const z = Math.sin(seed) * 200 * Math.random();
        const y = 50 + Math.random() * 30;
        const scale = 5 + Math.random() * 15;
        
        return (
          <mesh 
            key={i} 
            position={[x, y, z]} 
            scale={[scale, scale * 0.3, scale]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
            visible={dayNightCycle > 0.2 && dayNightCycle < 0.8}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        );
      })}
    </>
  );
};

export default Environment;
