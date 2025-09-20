import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './Context/ThemeContext';
import { NotificationProvider } from './Context/NotificationContext'; // 👈 import it

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <ThemeProvider>
        <NotificationProvider>   {/* 👈 wrap App with NotificationProvider */}
          <App />
        </NotificationProvider>
      </ThemeProvider>
    </React.StrictMode>
  </BrowserRouter>
);

reportWebVitals();  
