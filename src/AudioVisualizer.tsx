import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const GRID_SIZE = 32;
const PLANE_SIZE = 8;

// Helper to generate a neon color
function randomNeonColor() {
  const hues = [120, 200, 300, 60, 30, 280]; // green, blue, magenta, yellow, orange, purple
  const hue = hues[Math.floor(Math.random() * hues.length)] + Math.random() * 20 - 10;
  return `hsl(${hue}, 100%, 60%)`;
}

// Starfield component with colored and larger stars
function Stars({ count = 200, bigCount = 8 }) {
  const points = useMemo(() => {
    const arr: { pos: [number, number, number], color: string, size: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r = 14 + Math.random() * 6;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        color: randomNeonColor(),
        size: 0.07 + Math.random() * 0.08
      });
    }
    // Add a few big, bright stars
    for (let i = 0; i < bigCount; i++) {
      const r = 13 + Math.random() * 7;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        color: randomNeonColor(),
        size: 0.22 + Math.random() * 0.18
      });
    }
    return arr;
  }, [count, bigCount]);
  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshStandardMaterial color={p.color || '#39ff14'} emissive={p.color || '#39ff14'} emissiveIntensity={2.5} />
        </mesh>
      ))}
    </group>
  );
}

// Nebulae: colored, transparent, blurred planes
function Nebulae({ count = 3 }) {
  const nebulae = useMemo(() => {
    const arr: { pos: [number, number, number], color: string, rot: [number, number, number], size: number, opacity: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 7;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        color: randomNeonColor(),
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        size: 4 + Math.random() * 3,
        opacity: 0.18 + Math.random() * 0.13
      });
    }
    return arr;
  }, [count]);
  return (
    <group>
      {nebulae.map((n, i) => (
        <mesh key={i} position={n.pos} rotation={n.rot}>
          <planeGeometry args={[n.size, n.size]} />
          <meshBasicMaterial color={n.color || '#39ff14'} transparent opacity={n.opacity} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function MeshVisualizer({ analyser }: { analyser: AnalyserNode | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const freqData = useRef<Uint8Array>(new Uint8Array(128));
  const timeData = useRef<Uint8Array>(new Uint8Array(128));
  const lastZ = useRef<Float32Array | null>(null);
  const rotation = useRef({ x: -Math.PI / 2, y: 0 });

  useFrame(() => {
    if (!meshRef.current || !analyser) return;
    analyser.getByteFrequencyData(freqData.current);
    analyser.getByteTimeDomainData(timeData.current);
    const geom = meshRef.current.geometry as THREE.PlaneGeometry;
    const pos = geom.attributes.position;
    if (!lastZ.current) lastZ.current = new Float32Array(pos.count);

    // Calculate average frequency for color
    const avgFreq = freqData.current.reduce((a, b) => a + b, 0) / freqData.current.length;
    // Neon color: hue cycles with avgFreq, saturation and lightness are high for neon
    const hue = (avgFreq / 255) * 360;
    const neonColor = new THREE.Color(`hsl(${hue}, 100%, 60%)`);

    if (materialRef.current) {
      materialRef.current.color = neonColor;
    }

    for (let i = 0; i < pos.count; i++) {
      const ix = i % GRID_SIZE;
      const iy = Math.floor(i / GRID_SIZE);
      const freqIdx = Math.floor((ix / GRID_SIZE) * freqData.current.length);
      const timeIdx = Math.floor((iy / GRID_SIZE) * timeData.current.length);
      const freqVal = (freqData.current[freqIdx] / 255);
      const timeVal = (timeData.current[timeIdx] / 255);
      const targetZ = (freqVal * 2.5 - 1.2) * Math.sin((ix + iy) * 0.18) + (timeVal - 0.5) * 1.5;
      lastZ.current[i] = lastZ.current[i] * 0.7 + targetZ * 0.3;
      pos.setZ(i, lastZ.current[i]);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();

    // Slowly rotate the mesh along X and Y axes
    rotation.current.x += 0.002;
    rotation.current.y += 0.003;
    meshRef.current.rotation.x = rotation.current.x;
    meshRef.current.rotation.y = rotation.current.y;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, GRID_SIZE - 1, GRID_SIZE - 1]} />
      <meshBasicMaterial
        ref={materialRef}
        wireframe
        color={'#39ff14'}
        toneMapped={false}
      />
    </mesh>
  );
}

const AudioVisualizer = ({ analyser }: { analyser: AnalyserNode | null }) => (
  <div style={{
    width: 400,
    height: 400,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '10px solid #222',
    boxShadow: '0 0 32px #000a',
    background: '#070720',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <Canvas camera={{ position: [0, 7, 7], fov: 50 }} style={{ background: 'transparent' }}>
      {/* Space background color */}
      <color attach="background" args={['#070720']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />
      <Nebulae count={4} />
      <Stars count={200} bigCount={8} />
      <MeshVisualizer analyser={analyser} />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  </div>
);

export default AudioVisualizer; 