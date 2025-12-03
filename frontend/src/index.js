import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './Context/ThemeContext';
import { NotificationProvider } from './Context/NotificationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <React.StrictMode>
      <ThemeProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ThemeProvider>
    </React.StrictMode>
  </BrowserRouter>
);

// ---------------------------
// 📌 Register Service Worker
// ---------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('Service Worker registered:', reg))
      .catch((err) => console.log('Service Worker registration failed:', err));
  });
}

reportWebVitals();
