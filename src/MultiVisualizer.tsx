import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SHAPE_SIZE = 120;
const SHAPE_STYLE: React.CSSProperties = {
  width: SHAPE_SIZE,
  height: SHAPE_SIZE,
  borderRadius: '50%',
  overflow: 'hidden',
  background: '#181a22',
  margin: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  touchAction: 'manipulation',
  boxShadow: '0 4px 24px #000a, 0 0 0 4px #23242a',
  border: '2.5px solid #444b55',
};

function randomNeonColor() {
  const hues = [200, 220, 240, 60, 70, 300]; // blue, cyan, yellow, purple
  const hue = hues[Math.floor(Math.random() * hues.length)] + Math.random() * 20 - 10;
  return `hsl(${hue}, 100%, 60%)`;
}

function randomSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

function SphereViz({ analyser, params }: { analyser: AnalyserNode | null, params: any }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const data = useRef(new Uint8Array(64));
  useFrame(() => {
    if (!mesh.current || !analyser) return;
    analyser.getByteFrequencyData(data.current);
    const avg = data.current.reduce((a, b) => a + b, 0) / data.current.length;
    mesh.current.scale.setScalar(params.baseScale + avg / 255 * params.scaleAmp);
    mesh.current.rotation.x += params.rotX;
    mesh.current.rotation.y += params.rotY;
    if (mat.current) mat.current.color.set(params.color || '#39ff14');
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[params.radius, 32, 32]} />
      <meshStandardMaterial ref={mat} color={params.color || '#39ff14'} emissive={params.color || '#39ff14'} emissiveIntensity={1.2} />
      <lineSegments>
        <wireframeGeometry attach="geometry" args={[new THREE.SphereGeometry(params.radius, 32, 32)]} />
        <lineBasicMaterial color="#222" linewidth={1} />
      </lineSegments>
    </mesh>
  );
}

function TorusViz({ analyser, params }: { analyser: AnalyserNode | null, params: any }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const data = useRef(new Uint8Array(64));
  useFrame(() => {
    if (!mesh.current || !analyser) return;
    analyser.getByteTimeDomainData(data.current);
    const avg = data.current.reduce((a, b) => a + b, 0) / data.current.length;
    mesh.current.rotation.x += params.rotX;
    mesh.current.rotation.y += params.rotY;
    mesh.current.scale.y = params.baseScale + (avg / 255) * params.scaleAmp;
    if (mat.current) mat.current.color.set(params.color || '#39ff14');
  });
  return (
    <mesh ref={mesh}>
      <torusGeometry args={[params.radius, params.tube, 24, 48]} />
      <meshStandardMaterial ref={mat} color={params.color || '#39ff14'} emissive={params.color || '#39ff14'} emissiveIntensity={1.2} />
      <lineSegments>
        <wireframeGeometry attach="geometry" args={[new THREE.TorusGeometry(params.radius, params.tube, 24, 48)]} />
        <lineBasicMaterial color="#222" linewidth={1} />
      </lineSegments>
    </mesh>
  );
}

function BoxViz({ analyser, params }: { analyser: AnalyserNode | null, params: any }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const data = useRef(new Uint8Array(64));
  useFrame(() => {
    if (!mesh.current || !analyser) return;
    analyser.getByteFrequencyData(data.current);
    const max = Math.max(...Array.from(data.current));
    mesh.current.rotation.x += params.rotX;
    mesh.current.rotation.z += params.rotZ;
    mesh.current.scale.set(1 + max / 255 * params.scaleAmp, 1 - max / 510 * params.scaleAmp, 1 + max / 255 * params.scaleAmp);
    if (mat.current) mat.current.color.set(params.color || '#39ff14');
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[params.size, params.size, params.size]} />
      <meshStandardMaterial ref={mat} color={params.color || '#39ff14'} emissive={params.color || '#39ff14'} emissiveIntensity={1.2} />
      <lineSegments>
        <wireframeGeometry attach="geometry" args={[new THREE.BoxGeometry(params.size, params.size, params.size)]} />
        <lineBasicMaterial color="#222" linewidth={1} />
      </lineSegments>
    </mesh>
  );
}

function IcosahedronViz({ analyser, params }: { analyser: AnalyserNode | null, params: any }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const data = useRef(new Uint8Array(64));
  useFrame(() => {
    if (!mesh.current || !analyser) return;
    analyser.getByteFrequencyData(data.current);
    const min = Math.min(...Array.from(data.current));
    mesh.current.rotation.y += params.rotY;
    mesh.current.rotation.z += params.rotZ;
    mesh.current.scale.setScalar(params.baseScale + min / 255 * params.scaleAmp);
    if (mat.current) mat.current.color.set(params.color || '#39ff14');
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[params.radius, params.detail]} />
      <meshStandardMaterial ref={mat} color={params.color || '#39ff14'} emissive={params.color || '#39ff14'} emissiveIntensity={1.2} />
      <lineSegments>
        <wireframeGeometry attach="geometry" args={[new THREE.IcosahedronGeometry(params.radius, params.detail)]} />
        <lineBasicMaterial color="#222" linewidth={1} />
      </lineSegments>
    </mesh>
  );
}

function WavyPlaneViz({ analyser, params }: { analyser: AnalyserNode | null, params: any }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const data = useRef(new Uint8Array(64));
  useFrame(() => {
    if (!mesh.current || !analyser) return;
    analyser.getByteFrequencyData(data.current);
    const geom = mesh.current.geometry as THREE.PlaneGeometry;
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ix = i % params.res;
      const iy = Math.floor(i / params.res);
      const freqIdx = Math.floor((ix / params.res) * data.current.length);
      const z = (data.current[freqIdx] / 255) * params.amp * Math.sin((ix + iy) * params.freq);
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    mesh.current.rotation.x += params.rotX;
    mesh.current.rotation.y += params.rotY;
    if (mat.current) mat.current.color.set(params.color || '#39ff14');
  });
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <planeGeometry args={[params.size, params.size, params.res - 1, params.res - 1]} />
      <meshStandardMaterial ref={mat} color={params.color || '#39ff14'} emissive={params.color || '#39ff14'} emissiveIntensity={1.2} wireframe />
      <lineSegments>
        <wireframeGeometry attach="geometry" args={[new THREE.PlaneGeometry(params.size, params.size, params.res - 1, params.res - 1)]} />
        <lineBasicMaterial color="#222" linewidth={1} />
      </lineSegments>
    </mesh>
  );
}

// Starfield and Nebulae for space background
function Stars({ count = 60, bigCount = 2 }) {
  const points = useMemo(() => {
    const arr: { pos: [number, number, number], color: string, size: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 2;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        color: randomNeonColor(),
        size: 0.04 + Math.random() * 0.05
      });
    }
    // Add a few big, bright stars
    for (let i = 0; i < bigCount; i++) {
      const r = 3.5 + Math.random() * 2.5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        color: randomNeonColor(),
        size: 0.13 + Math.random() * 0.09
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

function Nebulae({ count = 2 }) {
  const nebulae = useMemo(() => {
    const arr: { pos: [number, number, number], color: string, rot: [number, number, number], size: number, opacity: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 2.5;
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
        size: 1.5 + Math.random() * 1.2,
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

function randomSphereParams() {
  return {
    color: randomNeonColor(),
    baseScale: 0.6 + Math.random() * 1.2,
    scaleAmp: 0.5 + Math.random() * 1.2,
    rotX: 0.01 * randomSign() * (0.5 + Math.random()),
    rotY: 0.013 * randomSign() * (0.5 + Math.random()),
    radius: 0.5 + Math.random() * 1.1,
  };
}
function randomTorusParams() {
  return {
    color: randomNeonColor(),
    baseScale: 0.5 + Math.random() * 1.2,
    scaleAmp: 0.7 + Math.random() * 1.2,
    rotX: 0.018 * randomSign() * (0.5 + Math.random()),
    rotY: 0.01 * randomSign() * (0.5 + Math.random()),
    radius: 0.3 + Math.random() * 0.7,
    tube: 0.12 + Math.random() * 0.35,
  };
}
function randomBoxParams() {
  return {
    color: randomNeonColor(),
    scaleAmp: 0.5 + Math.random() * 1.2,
    rotX: 0.012 * randomSign() * (0.5 + Math.random()),
    rotZ: 0.014 * randomSign() * (0.5 + Math.random()),
    size: 0.7 + Math.random() * 1.2,
  };
}
function randomIcosahedronParams() {
  return {
    color: randomNeonColor(),
    baseScale: 0.6 + Math.random() * 1.2,
    scaleAmp: 0.7 + Math.random() * 1.2,
    rotY: 0.015 * randomSign() * (0.5 + Math.random()),
    rotZ: 0.01 * randomSign() * (0.5 + Math.random()),
    radius: 0.5 + Math.random() * 1.1,
    detail: Math.floor(Math.random() * 3),
  };
}
function randomWavyPlaneParams() {
  return {
    color: randomNeonColor(),
    amp: 0.5 + Math.random() * 1.5,
    freq: 0.15 + Math.random() * 0.5,
    rotX: 0.012 * randomSign() * (0.5 + Math.random()),
    rotY: 0.01 * randomSign() * (0.5 + Math.random()),
    size: 1.1 + Math.random() * 1.2,
    res: 12 + Math.floor(Math.random() * 8),
  };
}

const SHAPES = [SphereViz, TorusViz, BoxViz, IcosahedronViz, WavyPlaneViz];
const PARAM_GENERATORS = [randomSphereParams, randomTorusParams, randomBoxParams, randomIcosahedronParams, randomWavyPlaneParams];

const MultiVisualizer = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const [paramsArr, setParamsArr] = useState([
    randomSphereParams(),
    randomTorusParams(),
    randomBoxParams(),
    randomIcosahedronParams(),
    randomWavyPlaneParams(),
  ]);

  const handleShapeClick = (i: number) => {
    setParamsArr(paramsArr => {
      const newParams = [...paramsArr];
      newParams[i] = PARAM_GENERATORS[i]();
      return newParams;
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 0 24px 0' }}>
      {SHAPES.map((Shape, i) => (
        <div key={i} style={SHAPE_STYLE} onClick={() => handleShapeClick(i)}>
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ background: 'transparent' }}>
            <color attach="background" args={["#070720"]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 2, 2]} intensity={0.7} />
            <Nebulae count={2} />
            <Stars count={60} bigCount={2} />
            <Shape analyser={analyser} params={paramsArr[i]} />
          </Canvas>
        </div>
      ))}
    </div>
  );
};

export default MultiVisualizer; 