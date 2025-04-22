import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

interface TerrainProps {
  size?: number;
  height?: number;
  resolution?: number;
  position?: [number, number, number];
}

/**
 * Eine vereinfachte Version des Terrains ohne Animation für bessere Stabilität
 */
const Terrain: React.FC<TerrainProps> = ({
  size = 100,
  height = 5,
  resolution = 64, // Reduzierte Auflösung für bessere Performance
  position = [0, -0.5, 0]
}) => {
  // Textur laden (kein Wechsel/Animation)
  const grassTexture = useTexture('/textures/grass.png');
  
  // Textur konfigurieren
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(size / 10, size / 10);

  // Geometrie nur einmal generieren
  const geometry = useMemo(() => {
    console.log("Generating static terrain geometry");
    const geo = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    const vertices = geo.attributes.position.array as Float32Array;
    
    // Height map mit festem Seed für Reproduzierbarkeit
    const simplex = new SimplexNoise(12345); // Fixed seed
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      
      // Einfachere Höhenberechnung
      let y = simplex.noise(x * 0.02, z * 0.02) * height;
      
      // Zentrum flacher machen für die Agenten
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const centerFlatteningFactor = Math.max(0, 1 - Math.exp(-distanceFromCenter * 0.01));
      
      vertices[i + 1] = y * centerFlatteningFactor;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [size, height, resolution]);

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        map={grassTexture}
        roughness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Vereinfachte Simplex Noise Implementierung
 */
class SimplexNoise {
  private grad3: number[][];
  private p: number[];
  private perm: number[];

  constructor(seed: number) {
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    
    // Deterministische Initialisierung mit festem Seed
    this.p = Array(256).fill(0).map((_, i) => i);
    
    // Fisher-Yates Shuffle mit deterministic seed
    let seedRandom = this.seededRandom(seed);
    for (let i = this.p.length - 1; i > 0; i--) {
      const j = Math.floor(seedRandom() * (i + 1));
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }
    
    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  // Simple seeded random function
  private seededRandom(seed: number) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  public noise(xin: number, yin: number): number {
    let n0, n1, n2; // Noise contributions from the three corners
    
    // Skew the input space to determine which simplex cell we're in
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const s = (xin + yin) * F2; // Hairy factor for 2D
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const t = (i + j) * G2;
    const X0 = i - t; // Unskew the cell origin back to (x,y) space
    const Y0 = j - t;
    const x0 = xin - X0; // The x,y distances from the cell origin
    const y0 = yin - Y0;
    
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      i1 = 1;
      j1 = 0; // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    } else {
      i1 = 0;
      j1 = 1; // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    }
    
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
    const y2 = y0 - 1.0 + 2.0 * G2;
    
    // Work out the hashed gradient indices of the three simplex corners
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.perm[ii + this.perm[jj]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
    
    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
    }
    
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }
    
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  }
}

export default Terrain;