import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/globals.css'
import App from './App'
import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
)
