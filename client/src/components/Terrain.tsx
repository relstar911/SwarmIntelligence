import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface TerrainProps {
  size?: number;
  height?: number;
  resolution?: number;
  roughness?: number;
  position?: [number, number, number];
}

/**
 * A procedurally generated natural terrain with hills and valleys
 */
const Terrain: React.FC<TerrainProps> = ({
  size = 100,
  height = 8,
  resolution = 128,
  roughness = 0.8,
  position = [0, -0.5, 0]
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load terrain textures
  const grassTexture = useTexture('/textures/grass.png');
  const sandTexture = useTexture('/textures/sand.jpg');
  
  // Configure textures
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
  
  grassTexture.repeat.set(size / 10, size / 10);
  sandTexture.repeat.set(size / 5, size / 5);

  // Generate terrain geometry with height map
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    const vertices = geo.attributes.position.array;
    
    // Generate height map
    const simplex = new SimplexNoise(Math.random());
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      
      // Multi-layered noise for more natural terrain
      const frequency1 = 0.02;
      const frequency2 = 0.1;
      
      let y = simplex.noise(x * frequency1, z * frequency1) * height;
      y += simplex.noise(x * frequency2, z * frequency2) * height * 0.3;
      
      // Flatten the center area slightly for the initial agents to have smoother ground
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const centerFlatteningFactor = Math.max(0, 1 - Math.exp(-distanceFromCenter * 0.01));
      
      vertices[i + 1] = y * centerFlatteningFactor;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [size, height, resolution, roughness]);

  // Blend textures based on height and slope
  const fragmentShader = `
    uniform sampler2D grassTexture;
    uniform sampler2D sandTexture;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vHeight;
    
    void main() {
      // Blend between sand and grass based on height and slope
      float slope = 1.0 - vNormal.y; // 0 is flat, 1 is vertical
      float heightFactor = smoothstep(0.0, 0.3, vHeight / 8.0);
      float slopeFactor = smoothstep(0.0, 0.6, slope);
      
      vec4 grassColor = texture2D(grassTexture, vUv);
      vec4 sandColor = texture2D(sandTexture, vUv);
      
      float sandMix = max(1.0 - heightFactor, slopeFactor);
      
      // Darken areas based on slope for additional detail
      float shadowFactor = mix(1.0, 0.8, slope * 0.5);
      
      gl_FragColor = mix(grassColor, sandColor, sandMix) * shadowFactor;
    }
  `;

  const vertexShader = `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vHeight;
    
    void main() {
      vUv = uv;
      vNormal = normal;
      vHeight = position.y;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Create shader uniforms
  const uniforms = useMemo(() => ({
    grassTexture: { value: grassTexture },
    sandTexture: { value: sandTexture },
    time: { value: 0 }
  }), [grassTexture, sandTexture]);

  // Animate wind effect (subtle movement)
  useFrame(({ clock }) => {
    if (meshRef.current && uniforms.time) {
      uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Simplex Noise implementation for terrain generation
 */
class SimplexNoise {
  private grad3: number[][];
  private p: number[];
  private perm: number[];
  private simplex: number[][];

  constructor(seed = Math.random()) {
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(seed * 256);
    }
    
    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
    
    this.simplex = [
      [0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0],
      [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0],
      [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
      [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0],
      [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0],
      [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
      [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0],
      [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]
    ];
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