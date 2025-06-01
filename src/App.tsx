import React, { useState, useRef } from 'react';
import './App.css';
import AudioVisualizer from './AudioVisualizer';

const ROWS = 6;
const COLS = 16;
const ROW_LABELS = [
  'Kick 1',
  'Kick 2',
  'Snare',
  'Hi-Hat',
  'Fart',
  'Clap',
];

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

  const playArcadeSound = (idx: number) => {
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
  };

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

  return (
    <div className="sequencer-app">
      <AudioVisualizer analyser={analyserRef.current} />
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
      <div
        className="sequencer-grid"
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
      {/* Arcade Buttons Row */}
      <div className="arcade-buttons-row">
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            className="arcade-btn arcade-btn-blue"
            onClick={() => playArcadeSound(i)}
          >
            {/* No text or dot inside the button */}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
