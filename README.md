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

## Understanding Project Configuration Files

This section provides a brief overview of key configuration files for those re-familiarizing themselves with React/TypeScript projects.

### `tsconfig.json` - TypeScript Configuration

The `tsconfig.json` file in the root directory specifies the compiler options required to compile the TypeScript project. Here are some of the key options used:

-   **`compilerOptions`**: This object contains all the compiler settings.
    -   **`target: "es5"`**: Specifies the ECMAScript target version for the compiled JavaScript output. "es5" ensures compatibility with older browsers. Modern projects might target "es6" or newer.
    -   **`lib: ["dom", "dom.iterable", "esnext"]`**: Lists the library files to be included in the compilation.
        -   `"dom"`: Includes DOM-related APIs (like `window`, `document`).
        -   `"dom.iterable"`: Includes support for DOM iterables (e.g., for NodeList).
        -   `"esnext"`: Includes the latest ECMAScript features.
    -   **`allowJs: true`**: Allows JavaScript files to be compiled alongside TypeScript files.
    -   **`skipLibCheck: true`**: Skips type checking of all declaration files (`*.d.ts`). This can speed up compilation but might miss some type errors in external libraries.
    -   **`esModuleInterop: true`**: Enables compatibility with modules that use CommonJS `module.exports` by creating synthetic default imports. This makes it easier to import libraries that aren't written as ES modules.
    -   **`allowSyntheticDefaultImports: true`**: Allows default imports from modules with no default export. `esModuleInterop` implies this.
    -   **`strict: true`**: Enables all strict type-checking options (e.g., `noImplicitAny`, `strictNullChecks`). This is highly recommended for robust TypeScript code.
    -   **`forceConsistentCasingInFileNames: true`**: Ensures that filenames are cased consistently, which is important for case-sensitive file systems.
    -   **`noFallthroughCasesInSwitch: true`**: Reports errors for fallthrough cases in switch statements where a `break` or `return` is missing.
    -   **`module: "esnext"`**: Specifies the module system for the generated code. "esnext" uses modern ES module syntax, which tools like Webpack can then process.
    -   **`moduleResolution: "node"`**: Specifies how TypeScript resolves module imports, mimicking Node.js module resolution strategy.
    -   **`resolveJsonModule: true`**: Allows importing `.json` files as modules.
    -   **`isolatedModules: true`**: Ensures that each file can be compiled as a separate module. Required by some bundlers like Babel.
    -   **`noEmit: true`**: Instructs the TypeScript compiler not to output any files (JavaScript code, sourcemaps, etc.). This is common in projects where another tool (like Babel or `react-scripts`'s Webpack setup) handles the actual transpilation from TypeScript to JavaScript. TypeScript is used primarily for type checking.
    -   **`jsx: "react-jsx"`**: Configures JSX support. `"react-jsx"` uses the new JSX transform (React 17+) which doesn't require `import React from 'react'` in every file for JSX.
-   **`include: ["src"]`**: Specifies an array of file paths or patterns that the TypeScript compiler should include in the compilation. Here, it includes all files in the `src` directory.

### `package.json` - Project Manifest

The `package.json` file is the heart of any Node.js project, including React applications. It contains metadata about the project (like name, version) and lists its dependencies and scripts.

-   **`name`**: The name of your project.
-   **`version`**: The current version of your project.
-   **`private: true`**: Indicates that the project is private and should not be published to npm.
-   **`dependencies`**: This object lists all the packages required for your application to run in production.
    -   **`react`**: The core React library for building user interfaces.
    -   **`react-dom`**: Provides DOM-specific methods, enabling React to interact with the browser's DOM.
    -   **`typescript`**: The TypeScript language compiler. While it's used during development, the types it provides are compiled away for production, but the package itself is often listed here.
    -   **`@types/react`**, **`@types/react-dom`**, **`@types/jest`**, **`@types/node`**: These are type declaration packages. They provide TypeScript with type information for JavaScript libraries that don't include their own types. For example, `@types/react` provides types for the React library.
    -   **`react-scripts`**: Part of Create React App, this package contains scripts and configurations for building, running, and testing the application (e.g., Webpack, Babel, ESLint settings).
    -   Other libraries like `@react-three/drei`, `@react-three/fiber`, `three` are for specific features (3D graphics in this case).
-   **`devDependencies`** (if present): Would list packages only needed during development and testing (e.g., linters, testing frameworks if not included by `react-scripts`). This project lists most dev tools under `dependencies` as is common with `create-react-app`.
-   **`scripts`**: Defines a set of command-line scripts that can be run using `npm run <script-name>` or `yarn <script-name>`.
    -   **`start`**: Typically starts the development server.
    -   **`build`**: Typically builds the application for production.
    -   **`test`**: Typically runs the test suite.
    -   **`eject`**: A Create React App specific script to "eject" from the managed configuration, giving full control over build tools.
-   **`eslintConfig`**: Configures ESLint, a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code. Create React App pre-configures this.
-   **`browserslist`**: Specifies the range of browsers the application supports. This information is used by tools like Babel and Autoprefixer to generate compatible JavaScript and CSS.

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
