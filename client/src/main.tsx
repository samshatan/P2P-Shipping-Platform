import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/globals.css'
import App from './App'
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BookingProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BookingProvider>
    </AuthProvider>
  </StrictMode>
)
