import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Make sure this path to App.js is correct
import './index.css'; // Assuming you have a global CSS file

// Get the root element from public/index.html
const rootElement = document.getElementById('root'); 

// Create the React root and render the App component
if (rootElement) {
    // This is the correct, modern way to render your application
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Failed to find the root element in index.html.");
}