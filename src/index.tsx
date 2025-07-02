// React is the core library for building user interfaces.
// It allows you to create reusable UI components.
import React from 'react';

// ReactDOM is the library that provides DOM-specific methods,
// effectively acting as the bridge between React and the browser's Document Object Model (DOM).
// 'react-dom/client' is the entry point for the newer client rendering APIs.
import ReactDOM from 'react-dom/client';

// Imports global CSS styles for the application.
import './index.css';

// Imports the main application component. This is typically the root component
// that contains all other parts of the application.
import App from './App';

// Imports a function to measure performance metrics.
import reportWebVitals from './reportWebVitals';

// --- Entry Point of the React Application ---

// ReactDOM.createRoot is the new way (since React 18) to create a root for rendering the React application.
// It enables concurrent features in React.
// 'document.getElementById('root')' is a standard browser API call to find an HTML element
// with the ID 'root'. This element is defined in `public/index.html` and serves as the container
// where the entire React application will be rendered.
// 'as HTMLElement' is a TypeScript type assertion. It tells the TypeScript compiler to treat
// the result of `document.getElementById('root')` as an HTMLElement, even though
// `getElementById` could potentially return `null` (if the element isn't found).
// This is safe here because we know `index.html` contains a div with id 'root'.
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// root.render() is used to render a React element (or component) into the root DOM node.
// In this case, it's rendering the <App /> component.
root.render(
  // <React.StrictMode> is a wrapper component that React provides to help identify
  // potential problems in an application. It activates additional checks and warnings
  // for its descendants. It only runs in development mode and does not affect the
  // production build. It can help catch common mistakes, like usage of deprecated APIs
  // or unexpected side effects.
  <React.StrictMode>
    {/* <App /> is the main component of this application.
        JSX syntax (like <App />) is used here, which looks like HTML but is actually
        JavaScript that gets compiled into React.createElement() calls. */}
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
