import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Extrem minimale Welt mit nur einem Boden und zwei Würfeln
 */
const MinimalWorld: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 10], fov: 50 }}
      style={{ height: '100vh' }}
    >
      {/* Einfache Beleuchtung */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      {/* Kamera-Steuerung */}
      <OrbitControls />
      
      {/* Einfacher Boden */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#225533" />
      </mesh>
      
      {/* Adam: Roter Würfel */}
      <mesh position={[-2, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Eve: Blauer Würfel */}
      <mesh position={[2, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>
    </Canvas>
  );
};

export default MinimalWorld;