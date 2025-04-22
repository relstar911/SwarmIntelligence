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
  skyTexture.wrapT = THREE.ClampToEdgeWrapping;
  skyTexture.repeat.set(4, 1);
  
  // Update sky texture offset based on day/night cycle - with slower animation
  useFrame(() => {
    if (skyRef.current) {
      // Offset texture to simulate day/night - much smoother transitions
      const targetOffset = dayNightCycle;
      skyTexture.offset.x = THREE.MathUtils.lerp(skyTexture.offset.x, targetOffset, 0.005);
      
      // Very slow sky rotation - much less noticeable
      skyRef.current.rotation.y += 0.00005;
    }
  });
  
  // Calculate sky color based on time of day with smoother transitions
  const skyColor = new THREE.Color();
  if (dayNightCycle < 0.25 || dayNightCycle > 0.75) {
    // Night - darker but less extreme
    skyColor.setRGB(0.1, 0.1, 0.25);
  } else if (dayNightCycle < 0.3 || dayNightCycle > 0.7) {
    // Sunrise/sunset - smoother transition
    const t = (dayNightCycle < 0.3) 
      ? (dayNightCycle - 0.25) * 10 // slower transition 
      : (0.75 - dayNightCycle) * 10;
    // Warmer, less intense colors
    skyColor.setRGB(0.6 * t + 0.1, 0.4 * t + 0.1, 0.3 * t + 0.25);
  } else {
    // Day - more gentle blue
    skyColor.setRGB(0.4, 0.6, 0.85);
  }
  
  // Calculate star visibility with smoother fade
  const starOpacity = 
    dayNightCycle < 0.3 
      ? Math.max(0, 0.8 - dayNightCycle * 3)
      : dayNightCycle > 0.7
        ? Math.min(0.8, (dayNightCycle - 0.7) * 3)
        : 0;
  
  // Calculate cloud visibility with smoother transitions
  const cloudOpacity = 
    dayNightCycle > 0.2 && dayNightCycle < 0.8
      ? Math.min(0.6, Math.max(0.1, 0.6 * Math.sin((dayNightCycle - 0.2) / 0.6 * Math.PI)))
      : 0.1;
  
  return (
    <>
      {/* Sky Dome - gentler color transitions */}
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
      
      {/* Stars (visible at night) - fewer stars and gentler appearance */}
      <points visible={true} /* Always visible but with variable opacity */> 
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500} // Reduced star count
            array={(() => {
              const positions = new Float32Array(1500);
              for (let i = 0; i < 1500; i += 3) {
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
          size={1} // Smaller stars
          color="#F0F0FF" // Slightly blue-ish white, less harsh
          sizeAttenuation 
          opacity={starOpacity}
          transparent
          depthWrite={false} // Prevents z-fighting
        />
      </points>
      
      {/* Sun - softer glow */}
      <mesh 
        position={[
          Math.cos((dayNightCycle) * Math.PI * 2) * 400,
          Math.sin((dayNightCycle) * Math.PI * 2) * 400,
          0
        ]}
      >
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#FDB813" />
        
        {/* Sun glow */}
        <mesh>
          <sphereGeometry args={[30, 32, 32]} />
          <meshBasicMaterial 
            color="#FDB813" 
            transparent 
            opacity={0.2} 
            depthWrite={false}
          />
        </mesh>
      </mesh>
      
      {/* Moon - softer appearance */}
      <mesh 
        position={[
          Math.cos((dayNightCycle + 0.5) * Math.PI * 2) * 300,
          Math.sin((dayNightCycle + 0.5) * Math.PI * 2) * 300,
          0
        ]}
      >
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#E0E0E8" /> {/* Slightly blue-ish white */}
        
        {/* Moon glow */}
        <mesh>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial 
            color="#E0E0E8" 
            transparent 
            opacity={0.15} 
            depthWrite={false}
          />
        </mesh>
      </mesh>
      
      {/* Clouds (improved appearance) - fewer, more separated clouds */}
      {Array.from({ length: 10 }).map((_, i) => {
        // Seed random positions for clouds
        const seed = i * 123.456;
        const x = Math.cos(seed) * 200 * Math.random();
        const z = Math.sin(seed) * 200 * Math.random();
        const y = 50 + Math.random() * 20; // Less variation in height
        const scale = 5 + Math.random() * 10;
        
        return (
          <mesh 
            key={i} 
            position={[x, y, z]} 
            scale={[scale, scale * 0.3, scale]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
            visible={true} // Always visible but with variable opacity
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color="#F8F8F8" // Off-white for less harsh appearance
              transparent 
              opacity={cloudOpacity}
              depthWrite={false} // Prevents z-fighting
            />
          </mesh>
        );
      })}
    </>
  );
};

export default Environment;
