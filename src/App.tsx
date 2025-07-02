// Import React itself, and specific "Hooks" like useState, useRef, and useCallback.
// Hooks are functions that let you "hook into" React state and lifecycle features from function components.
import React, { useState, useRef, useCallback } from 'react';
// TypeScript specific: React types like `FC` (FunctionComponent) exist, but are often not needed
// for simple function components like `App` as TypeScript can infer the return type (JSX.Element).
// For props, you would define an interface: `interface AppProps { myProp: string; }`
// and then type the component: `const App: React.FC<AppProps> = ({ myProp }) => { ... }`
// However, this component doesn't take props.
// Import component-specific CSS.
import './App.css';
// Import another custom component.
import MultiVisualizer from './MultiVisualizer';

// Constants defining the sequencer grid dimensions.
const ROWS = 6;
const COLS = 16;

// Array of sound sample URLs. `process.env.PUBLIC_URL` is used to access files
// in the `public` folder.
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

// This is a "Function Component". In modern React, components are primarily written as JavaScript functions.
// This function returns JSX (JavaScript XML), which describes what the UI should look like.
function App() {
  // --- State Management with useState ---
  // `useState` is a Hook that lets you add React state to function components.
  // It returns a pair: the current state value and a function that lets you update it.
  //
  // TypeScript: Explicitly typing state with generics.
  // `useState<boolean[][]>`: Here, `<boolean[][]>` is a TypeScript generic type argument.
  // It explicitly tells `useState` that the `grid` state variable will be a 2D array of booleans.
  // TypeScript can often infer this from the initial value, but explicit typing is clearer and safer.
  // `boolean[][]` is a type representing an array of arrays of booleans.
  const [grid, setGrid] = useState<boolean[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  );
  // TypeScript: Type inference.
  // For `tempo`, `distortion`, `isPlaying`, `currentStep`, `isMouseDown`, and `pitch`,
  // TypeScript infers their types from their initial values (e.g., `120` is `number`, `false` is `boolean`).
  const [tempo, setTempo] = useState(120); // BPM; TypeScript infers `tempo: number`
  const [distortion, setDistortion] = useState(0); // TypeScript infers `distortion: number`
  const [isPlaying, setIsPlaying] = useState(false); // TypeScript infers `isPlaying: boolean`
  const [currentStep, setCurrentStep] = useState(-1); // TypeScript infers `currentStep: number`
  const [isMouseDown, setIsMouseDown] = useState(false); // TypeScript infers `isMouseDown: boolean`
  const [pitch, setPitch] = useState(0); // in semitones; TypeScript infers `pitch: number`

  // TypeScript: Tuple type.
  // `useState<[boolean, boolean, boolean, boolean]>` defines `arcadePressed` as a tuple:
  // an array with a fixed number of elements (4) where each element has a specific type (boolean).
  const [arcadePressed, setArcadePressed] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false]);


  // --- Refs with useRef ---
  // `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument.
  // Refs are useful for accessing underlying DOM elements or for holding mutable values that don't trigger re-renders.
  //
  // TypeScript: Typing refs.
  // `useRef<NodeJS.Timeout | null>(null)`: The generic `<NodeJS.Timeout | null>` specifies that
  // `intervalRef.current` can either hold a `NodeJS.Timeout` object (from `setInterval`) or `null`.
  // This is a TypeScript "union type".
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // `AudioContext | null`: The ref can hold an `AudioContext` object or be `null`.
  const audioCtxRef = useRef<AudioContext | null>(null);
  // `(AudioBuffer | null)[]`: This type means an array, where each element of the array
  // can be an `AudioBuffer` or `null`.
  const buffersRef = useRef<(AudioBuffer | null)[]>(Array(ROWS).fill(null));
  const arcadeBuffersRef = useRef<(AudioBuffer | null)[]>(Array(4).fill(null));
  // `AnalyserNode | null`: The ref can hold an `AnalyserNode` or be `null`.
  const analyserRef = useRef<AnalyserNode | null>(null);


  // --- Lifecycle Management with useEffect ---
  // `useEffect` Hook lets you perform side effects in function components.
  // It's similar to `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` in class components.

  // Effect for loading audio samples when the component mounts.
  React.useEffect(() => {
    // TypeScript: Type Casting / Type Assertion with `as any`.
    // `(window as any).webkitAudioContext`: This is a type assertion.
    // `window.webkitAudioContext` is a prefixed version of `AudioContext` for older Safari browsers.
    // Standard TypeScript DOM types might not include `webkitAudioContext`.
    // `as any` tells TypeScript to treat `window` as having any properties, bypassing type checking for this specific access.
    // This is often used as a last resort when type definitions are missing or incorrect.
    // A more type-safe approach could be to extend the Window interface:
    // interface MyWindow extends Window { webkitAudioContext?: typeof AudioContext; }
    // const customWindow = window as MyWindow;
    // const ctx = new (customWindow.AudioContext || customWindow.webkitAudioContext)();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx; // Store the context in a ref.

    // Create and configure an AnalyserNode for audio visualization.
    // TypeScript: `ctx` is inferred as `AudioContext` here.
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128; // Determines the size of the FFT (Fast Fourier Transform) used for frequency analysis.
    analyserRef.current = analyser; // Store the analyser in a ref.

    // Load each sample URL.
    SAMPLE_URLS.forEach((url, i) => {
      fetch(url) // Fetch the audio file.
        .then(res => res.arrayBuffer()) // Get the response as an ArrayBuffer.
        .then(data => ctx.decodeAudioData(data)) // Decode the audio data into an AudioBuffer.
        .then(buffer => {
          buffersRef.current[i] = buffer; // Store the decoded buffer in the buffersRef array.
        });
    });
    // Load arcade sounds similarly.
    ARCADE_SOUNDS.forEach((url, i) => {
      fetch(url)
        .then(res => res.arrayBuffer())
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => {
          arcadeBuffersRef.current[i] = buffer;
        });
    });

    // Cleanup function: This function is returned by `useEffect` and runs when the component unmounts.
    // It's important for cleaning up resources like event listeners, timers, or closing connections.
    return () => {
      ctx.close(); // Close the AudioContext to free up resources.
    };
  }, []); // The empty dependency array `[]` means this effect runs only once after the initial render (like componentDidMount).


  // Effect for handling sequencer playback logic.
  React.useEffect(() => {
    if (isPlaying) {
      const intervalTime = (60 / tempo) * 1000 / 4; // Calculate interval for 16th notes based on tempo.
      intervalRef.current = setInterval(() => {
        // `setCurrentStep` updates the `currentStep` state.
        // The function form `prev => (prev + 1) % COLS` is used to ensure the update is based on the latest state.
        setCurrentStep(prev => (prev + 1) % COLS);
      }, intervalTime);
    } else {
      setCurrentStep(-1); // Reset step when stopped.
      if (intervalRef.current) clearInterval(intervalRef.current); // Clear the interval if it exists.
    }
    // Cleanup function for this effect.
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current); // Clear interval on unmount or before re-running due to dependency changes.
    };
  }, [isPlaying, tempo]); // Dependencies: This effect re-runs if `isPlaying` or `tempo` changes.


  // Effect for playing sounds based on the current step of the sequencer.
  React.useEffect(() => {
    if (currentStep === -1) return; // Do nothing if sequencer is not active.
    // Iterate over each row in the grid.
    grid.forEach((row, rowIdx) => {
      // If the node at the current step in this row is active (true)...
      if (row[currentStep]) {
        playSample(rowIdx); // ...play the corresponding sample.
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // The comment above disables a linting rule. It's generally good to include all dependencies.
    // Here, `grid` and `playSample` are dependencies. `playSample` is memoized with `useCallback`
    // to prevent unnecessary re-runs if its own dependencies (`pitch`, `distortion`) haven't changed.
  }, [currentStep, grid /*, playSample (implicitly a dependency, see useCallback below) */]);


  // Function to play a sample for a given row.
  // TypeScript: Function parameter type annotation.
  // `rowIdx: number` explicitly declares that `rowIdx` must be a number.
  const playSample = (rowIdx: number) => {
    // TypeScript: Type narrowing.
    // `ctx` is `AudioContext | null`. Inside this `if` block, if `!ctx` is true, the function returns.
    // So, after this block, TypeScript knows `ctx` cannot be `null` and narrows its type to `AudioContext`.
    // Same logic applies to `buffer`.
    const ctx = audioCtxRef.current; // Get AudioContext from ref.
    const buffer = buffersRef.current[rowIdx]; // Get AudioBuffer from ref.
    if (!ctx || !buffer) return; // Guard clause if context or buffer is not ready.

    const source = ctx.createBufferSource(); // Create an AudioBufferSourceNode.
    source.buffer = buffer; // Assign the buffer to the source.
    // Apply pitch shift. Math.pow(2, pitch / 12) changes playback rate to shift pitch in semitones.
    source.playbackRate.value = Math.pow(2, pitch / 12);

    // Create and configure a WaveShaperNode for distortion effect.
    const distortionNode = ctx.createWaveShaper();
    distortionNode.curve = makeDistortionCurve(distortion); // `makeDistortionCurve` generates the distortion shape.
    distortionNode.oversample = '4x'; // Oversampling can reduce aliasing.

    // Connect the audio graph: source -> distortion -> analyser -> destination (speakers).
    source.connect(distortionNode);
    // TypeScript: Non-null assertion operator `!`.
    // `analyserRef.current!` asserts that `analyserRef.current` is not null or undefined at this point.
    // This is a way to tell the TypeScript compiler "I know this value is not null here".
    // It should be used with caution, as if the value *is* null at runtime, it will cause an error.
    // It's typically used when TypeScript's analysis isn't smart enough to determine that a value is non-null.
    // Here, `analyserRef.current` is initialized in the first `useEffect`, so it should be non-null
    // by the time `playSample` is called (assuming samples are loaded and playback starts).
    distortionNode.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);
    source.start(); // Play the sound.
  };

  // `useCallback` Hook is used here to memoize the `playArcadeSound` function.
  // This means the function instance will only be recreated if its dependencies (`pitch`, `distortion`) change.
  // This is useful for performance optimization, especially when passing callbacks to child components
  // or when the function is a dependency of other Hooks like `useEffect`.
  // TypeScript: Parameter type annotation `idx: number`.
  const playArcadeSound = useCallback((idx: number) => {
    const ctx = audioCtxRef.current;
    const buffer = arcadeBuffersRef.current[idx];
    // TypeScript: Type narrowing similar to playSample.
    if (!ctx || !buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.pow(2, pitch / 12);
    const distortionNode = ctx.createWaveShaper();
    distortionNode.curve = makeDistortionCurve(distortion);
    distortionNode.oversample = '4x';
    source.connect(distortionNode);
    // TypeScript: Non-null assertion `!` used again.
    distortionNode.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);
    source.start();
  }, [pitch, distortion, audioCtxRef, arcadeBuffersRef, analyserRef /* These refs are stable, but good to list if their .current is read */]);
  // Note: While refs themselves (audioCtxRef, etc.) are stable, their `.current` values can change.
  // If `useCallback` depended on the *values* inside `.current` that are set asynchronously,
  // it might not re-memoize correctly. Here, it's mostly about the `AudioContext` methods and properties.


  // Helper function to generate a distortion curve for the WaveShaperNode.
  // TypeScript: Function parameter type annotation `amount: number`.
  // TypeScript: Return type `Float32Array` is inferred for `makeDistortionCurve`.
  // It could also be explicitly typed: `function makeDistortionCurve(amount: number): Float32Array { ... }`
  function makeDistortionCurve(amount: number) {
    const k = amount * 10; // Scale the distortion amount.
    const n_samples = 44100; // Number of samples in the curve.
    // TypeScript: `Float32Array` is a specific type of TypedArray, useful for performance-sensitive numerical data like audio.
    const curve = new Float32Array(n_samples); // Typed array for audio processing.
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Function to toggle the state of a node in the sequencer grid.
  // TypeScript: Function parameter type annotations `row: number, col: number`.
  const toggleNode = (row: number, col: number) => {
    // `setGrid` is the state updater function from `useState`.
    // It takes a new value or a function that receives the previous state and returns the new state.
    // Using the function form is preferred when the new state depends on the previous state.
    // TypeScript: `g` (previous grid) is inferred as `boolean[][]` based on `setGrid`'s type.
    // `r` (row) is inferred as `boolean[]`, `cell` (cell) as `boolean`.
    // `i` (rowIndex) and `j` (colIndex) are inferred as `number`.
    setGrid(g => // `g` is the previous grid state.
      g.map((r, i) => // Map over rows.
        i === row ? r.map((cell, j) => (j === col ? !cell : cell)) : r // If it's the target row, map over its cells and toggle the target cell.
      )
    );
  };

  // Effect for adding a global mouseup listener.
  // This is used to ensure `isMouseDown` is reset if the mouse button is released outside the grid.
  React.useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp); // Add event listener.
    // Cleanup function: remove the event listener when the component unmounts.
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount.


  // Effect for handling keyboard shortcuts for arcade buttons.
  React.useEffect(() => {
    // TypeScript: Event type annotation.
    // `e: KeyboardEvent` types the event object `e` for `keydown` and `keyup` events.
    // This provides type safety and autocompletion for event properties like `e.key` or `e.repeat`.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore repeated keydown events if key is held.
      // Check which key was pressed and play the corresponding arcade sound.
      // Also update `arcadePressed` state for visual feedback.
      // TypeScript: `p` in `setArcadePressed(p => ...)` is inferred as `[boolean, boolean, boolean, boolean]`.
      if (e.key === 'a' || e.key === 'A') { playArcadeSound(0); setArcadePressed(p => [true, p[1], p[2], p[3]]); }
      if (e.key === 's' || e.key === 'S') { playArcadeSound(1); setArcadePressed(p => [p[0], true, p[2], p[3]]); }
      if (e.key === 'd' || e.key === 'D') { playArcadeSound(2); setArcadePressed(p => [p[0], p[1], true, p[3]]); }
      if (e.key === 'f' || e.key === 'F') { playArcadeSound(3); setArcadePressed(p => [p[0], p[1], p[2], true]); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset visual feedback state when key is released.
      if (e.key === 'a' || e.key === 'A') setArcadePressed(p => [false, p[1], p[2], p[3]]);
      if (e.key === 's' || e.key === 'S') setArcadePressed(p => [p[0], false, p[2], p[3]]);
      if (e.key === 'd' || e.key === 'D') setArcadePressed(p => [p[0], p[1], false, p[3]]);
      if (e.key === 'f' || e.key === 'F') setArcadePressed(p => [p[0], p[1], p[2], false]);
    };
    // Add event listeners to the window object.
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // Cleanup: remove event listeners on unmount.
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playArcadeSound]); // Dependency: `playArcadeSound` (memoized with useCallback).


  // Helper function for arcade button clicks to provide visual feedback.
  // TypeScript: Parameter type `i: number`.
  const handleArcadeBtnClick = (i: number) => {
    playArcadeSound(i);
    // Set the pressed state to true.
    // TypeScript: Type Assertion `as [boolean, boolean, boolean, boolean]`.
    // The `map` method on an array (even a tuple) by default returns a new array of the element type (`boolean[]`).
    // Since `arcadePressed` state is strictly a tuple `[boolean, boolean, boolean, boolean]`,
    // we use `as [boolean, boolean, boolean, boolean]` to assert that the result of `map`
    // conforms to this specific tuple type. This reassures TypeScript that we know the array length
    // and element order are preserved.
    setArcadePressed(p => p.map((v, idx) => idx === i ? true : v) as [boolean, boolean, boolean, boolean]);
    // After a short delay, reset the pressed state to false.
    setTimeout(() => setArcadePressed(p => p.map((v, idx) => idx === i ? false : v) as [boolean, boolean, boolean, boolean]), 120);
  };


  // --- JSX: Describing the UI ---
  // The `return` statement of a function component contains JSX.
  // JSX looks like HTML but is actually compiled to JavaScript calls (React.createElement).
  return (
    // Standard HTML div element with a CSS class.
    <div className="sequencer-app">
      {/* This is a custom React component.
          `analyser` is a "prop" (property) passed to the MultiVisualizer component.
          Props are how data is passed from parent to child components.
          Here, the current value of the `analyserRef` is passed.
          TypeScript: If `MultiVisualizer` had defined props (e.g., `interface MultiVisualizerProps { analyser: AnalyserNode | null; }`),
          TypeScript would check that the `analyser` prop passed here matches that definition.
          The `MultiVisualizer.tsx` file would define these prop types.
           */}
      <MultiVisualizer analyser={analyserRef.current} />

      {/* Sliders for controlling audio parameters */}
      <div className="sliders">
        <div className="slider-group">
          {/* Displaying state variable `tempo` directly in JSX */}
          <label>Tempo: {tempo} BPM</label>
          {/* Standard HTML input element.
              `value` is bound to the `tempo` state variable (controlled component).
              `onChange` is an event handler. When the slider value changes, it updates the `tempo` state.
              `Number(e.target.value)` converts the input string value to a number.
              TypeScript: `e` in `onChange={e => ...}` is implicitly typed as `React.ChangeEvent<HTMLInputElement>`.
              This gives type safety for `e.target.value`.
            */}
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
          {/* Conditional rendering within JSX: display "+" for positive pitch values. */}
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

      {/* Play/Stop button */}
      {/* `onClick` is an event handler. It calls `setIsPlaying` to toggle the `isPlaying` state.
          The function `p => !p` ensures the new state is the opposite of the previous state. */}
      <button
        className="play-btn"
        onClick={() => setIsPlaying(p => !p)}
        style={{ marginBottom: 24 }} // Inline styles can be applied using an object.
      >
        {/* Conditional rendering: The button text changes based on the `isPlaying` state. */}
        {isPlaying ? 'Stop' : 'Play'}
      </button>

      {/* Sequencer Grid */}
      {/* `onMouseLeave` is an event handler to reset `isMouseDown` if the mouse leaves the grid area. */}
      <div className="sequencer-grid"
        onMouseLeave={() => setIsMouseDown(false)}
      >
        {/* Rendering lists with `map`:
            `grid.map(...)` iterates over the `grid` state array (array of rows).
            For each `row` and its `rowIdx`, it renders a div representing that row. */}
        {grid.map((row, rowIdx) => (
          // `key` prop: When rendering lists of elements, React needs a unique `key` for each element
          // to efficiently update and reorder them. `rowIdx` is used here as a key.
          // Keys should be stable, unique among siblings, and ideally derived from your data.
          <div className="sequencer-row" key={rowIdx}>
            {/* Nested `map` to render cells within each row. */}
            {row.map((active, colIdx) => (
              <div
                key={colIdx} // `colIdx` serves as the key for cells within a row.
                // Dynamically setting CSS classes based on state:
                // `active` class if the node is active.
                // `current` class if it's the currently playing step.
                className={`sequencer-node${active ? ' active' : ''}${currentStep === colIdx ? ' current' : ''}`}
                // Event Handlers for mouse interaction:
                // `onMouseDown`: Sets `isMouseDown` to true and toggles the node.
                // `onMouseEnter`: If mouse button is down (`isMouseDown`), toggles the node (for drag-to-activate).
                // `onMouseUp`: Sets `isMouseDown` to false.
                onMouseDown={() => { setIsMouseDown(true); toggleNode(rowIdx, colIdx); }}
                onMouseEnter={() => { if (isMouseDown) toggleNode(rowIdx, colIdx); }}
                onMouseUp={() => setIsMouseDown(false)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Arcade Buttons Section */}
      <div className="arcade-buttons-row">
        {/* Rendering a list of buttons from an array of numbers [0, 1, 2, 3]. */}
        {[0, 1, 2, 3].map(i => (
          <button
            key={i} // Index `i` used as key.
            // Dynamic class for active state feedback.
            className={`arcade-btn arcade-btn-blue${arcadePressed[i] ? ' arcade-btn-active' : ''}`}
            onClick={() => handleArcadeBtnClick(i)} // Click handler for arcade buttons.
          >
            {/* Displaying button labels A, S, D, F based on index. */}
            {['A', 'S', 'D', 'F'][i]}
          </button>
        ))}
      </div>
    </div>
  );
}

// `export default App;` makes the App component available for import in other files (like `src/index.tsx`).
export default App;
