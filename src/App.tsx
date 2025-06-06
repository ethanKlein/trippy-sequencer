import React, { useState, useRef } from 'react';
import './App.css';
import MultiVisualizer from './MultiVisualizer';

const ROWS = 6;
const COLS = 16;

// Placeholder free sound sample URLs (replace with your own later)
const SAMPLE_URLS = [
  process.env.PUBLIC_URL + "/sounds/Kick.wav",
  process.env.PUBLIC_URL + "/sounds/Clap.wav",
  process.env.PUBLIC_URL + "/sounds/808-1.wav",
  process.env.PUBLIC_URL + "/sounds/808-2.wav",
  process.env.PUBLIC_URL + "/sounds/Hit.wav",
  process.env.PUBLIC_URL + "/sounds/SOUND.wav",
];

const ARCADE_SOUNDS = [
  process.env.PUBLIC_URL + '/sounds/arcade1.wav',
  process.env.PUBLIC_URL + '/sounds/arcade2.wav',
  process.env.PUBLIC_URL + '/sounds/arcade3.wav',
  process.env.PUBLIC_URL + '/sounds/arcade4.wav',
];

function App() {
  const [grid, setGrid] = useState<boolean[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  );
  const [tempo, setTempo] = useState(120); // BPM
  const [distortion, setDistortion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<(AudioBuffer | null)[]>(Array(ROWS).fill(null));
  const arcadeBuffersRef = useRef<(AudioBuffer | null)[]>(Array(4).fill(null));
  const [isMouseDown, setIsMouseDown] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [pitch, setPitch] = useState(0); // in semitones
  const [arcadePressed, setArcadePressed] = useState([false, false, false, false]);

  // Load samples on mount
  React.useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    // Create analyser node
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyserRef.current = analyser;
    SAMPLE_URLS.forEach((url, i) => {
      fetch(url)
        .then(res => res.arrayBuffer())
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => {
          buffersRef.current[i] = buffer;
        });
    });
    // Load arcade sounds
    ARCADE_SOUNDS.forEach((url, i) => {
      fetch(url)
        .then(res => res.arrayBuffer())
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => {
          arcadeBuffersRef.current[i] = buffer;
        });
    });
    return () => {
      ctx.close();
    };
  }, []);

  // Sequencer playback logic
  React.useEffect(() => {
    if (isPlaying) {
      const interval = (60 / tempo) * 1000 / 4; // 16th notes
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % COLS);
      }, interval);
    } else {
      setCurrentStep(-1);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, tempo]);

  // Play sounds for the current step
  React.useEffect(() => {
    if (currentStep === -1) return;
    grid.forEach((row, rowIdx) => {
      if (row[currentStep]) {
        playSample(rowIdx);
      }
    });
    // eslint-disable-next-line
  }, [currentStep]);

  const playSample = (rowIdx: number) => {
    const ctx = audioCtxRef.current;
    const buffer = buffersRef.current[rowIdx];
    if (!ctx || !buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.pow(2, pitch / 12); // pitch shift
    // Distortion node
    const distortionNode = ctx.createWaveShaper();
    distortionNode.curve = makeDistortionCurve(distortion);
    distortionNode.oversample = '4x';
    source.connect(distortionNode);
    distortionNode.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);
    source.start();
  };

  const playArcadeSound = React.useCallback((idx: number) => {
    const ctx = audioCtxRef.current;
    const buffer = arcadeBuffersRef.current[idx];
    if (!ctx || !buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.pow(2, pitch / 12); // pitch shift
    // Use same effects chain as playSample
    const distortionNode = ctx.createWaveShaper();
    distortionNode.curve = makeDistortionCurve(distortion);
    distortionNode.oversample = '4x';
    source.connect(distortionNode);
    distortionNode.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);
    source.start();
  }, [pitch, distortion]);

  // Simple distortion curve
  function makeDistortionCurve(amount: number) {
    const k = amount * 10;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  const toggleNode = (row: number, col: number) => {
    setGrid(g =>
      g.map((r, i) =>
        i === row ? r.map((cell, j) => (j === col ? !cell : cell)) : r
      )
    );
  };

  // Add global mouseup listener to clear isMouseDown
  React.useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Keyboard shortcuts for arcade buttons
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'a' || e.key === 'A') { playArcadeSound(0); setArcadePressed(p => [true, p[1], p[2], p[3]]); }
      if (e.key === 's' || e.key === 'S') { playArcadeSound(1); setArcadePressed(p => [p[0], true, p[2], p[3]]); }
      if (e.key === 'd' || e.key === 'D') { playArcadeSound(2); setArcadePressed(p => [p[0], p[1], true, p[3]]); }
      if (e.key === 'f' || e.key === 'F') { playArcadeSound(3); setArcadePressed(p => [p[0], p[1], p[2], true]); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') setArcadePressed(p => [false, p[1], p[2], p[3]]);
      if (e.key === 's' || e.key === 'S') setArcadePressed(p => [p[0], false, p[2], p[3]]);
      if (e.key === 'd' || e.key === 'D') setArcadePressed(p => [p[0], p[1], false, p[3]]);
      if (e.key === 'f' || e.key === 'F') setArcadePressed(p => [p[0], p[1], p[2], false]);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playArcadeSound]);

  // Helper for click: briefly show pressed state
  const handleArcadeBtnClick = (i: number) => {
    playArcadeSound(i);
    setArcadePressed(p => p.map((v, idx) => idx === i ? true : v) as [boolean, boolean, boolean, boolean]);
    setTimeout(() => setArcadePressed(p => p.map((v, idx) => idx === i ? false : v) as [boolean, boolean, boolean, boolean]), 120);
  };

  return (
    <div className="sequencer-app">
      <MultiVisualizer analyser={analyserRef.current} />
      <div className="sliders">
        <div className="slider-group">
          <label>Tempo: {tempo} BPM</label>
          <input
            type="range"
            min={60}
            max={200}
            value={tempo}
            onChange={e => setTempo(Number(e.target.value))}
          />
        </div>
        <div className="slider-group">
          <label>Distortion</label>
          <input
            type="range"
            min={0}
            max={100}
            value={distortion}
            onChange={e => setDistortion(Number(e.target.value))}
          />
        </div>
        <div className="slider-group">
          <label>Pitch: {pitch > 0 ? `+${pitch}` : pitch} st</label>
          <input
            type="range"
            min={-12}
            max={12}
            value={pitch}
            onChange={e => setPitch(Number(e.target.value))}
          />
        </div>
      </div>
      <button
        className="play-btn"
        onClick={() => setIsPlaying(p => !p)}
        style={{ marginBottom: 24 }}
      >
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <div className="sequencer-grid"
        onMouseLeave={() => setIsMouseDown(false)}
      >
        {grid.map((row, rowIdx) => (
          <div className="sequencer-row" key={rowIdx}>
            {row.map((active, colIdx) => (
              <div
                key={colIdx}
                className={`sequencer-node${active ? ' active' : ''}${currentStep === colIdx ? ' current' : ''}`}
                onMouseDown={() => { setIsMouseDown(true); toggleNode(rowIdx, colIdx); }}
                onMouseEnter={() => { if (isMouseDown) toggleNode(rowIdx, colIdx); }}
                onMouseUp={() => setIsMouseDown(false)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="arcade-buttons-row">
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            className={`arcade-btn arcade-btn-blue${arcadePressed[i] ? ' arcade-btn-active' : ''}`}
            onClick={() => handleArcadeBtnClick(i)}
          >
            {['A', 'S', 'D', 'F'][i]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
