# React Step Sequencer & Audio Visualizer

This project is a web-based step sequencer and audio visualizer built with React, TypeScript, and the Web Audio API. It allows users to create patterns of sounds, control playback, apply effects, and see dynamic 3D visualizations that react to the audio.

## Features

- **Grid-Based Sequencer**:
    - A 6-row, 16-step grid for composing musical patterns.
    - Click to toggle steps on/off.
    - Visual indicator for the current playback step.
- **Sound Playback**:
    - Plays a variety of pre-loaded audio samples (e.g., Kick, Clap, 808s, Hits).
- **Audio Controls**:
    - **Tempo**: Adjust playback speed (BPM).
    - **Distortion**: Apply a wave-shaping distortion effect.
    - **Pitch**: Change the pitch of all samples.
- **Arcade-Style Buttons**:
    - Four dedicated buttons for instantly playing specific sound effects.
    - Keyboard shortcuts: 'A', 'S', 'D', 'F'.
- **Dynamic 3D Audio Visualization**:
    - Powered by React Three Fiber and Three.js.
    - Features `MultiVisualizer`:
        - Displays five distinct 3D shapes (Sphere, Torus, Box, Icosahedron, Wavy Plane).
        - Each shape independently visualizes the audio output in real-time.
        - Shapes have interactive "neon" aesthetics and animations.
        - Click on a shape to randomize its visual parameters and color.
        - Each visualizer has its own mini "space" background with stars and nebulae.
- **Responsive Design**:
    - Basic layout adapts to different screen sizes.

## Technology Stack

- **React**: For building the user interface.
- **TypeScript**: For type safety and improved developer experience.
- **Web Audio API**: For all audio processing, playback, and analysis.
- **React Three Fiber & Three.js**: For creating interactive 3D audio visualizations.
- **CSS**: For styling the application.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
