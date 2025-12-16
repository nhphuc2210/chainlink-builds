import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SWRProvider } from './contexts/SWRProvider.jsx';
import { RateLimitProvider } from './contexts/RateLimitContext.jsx';

// Environment-aware console management
if (typeof window !== 'undefined') {
  const isDev = import.meta.env.MODE === 'development';
  const isProd = import.meta.env.MODE === 'production';
  
  // Create no-op function for disabled methods
  const noop = () => {};
  
  // Store original console methods (useful for debugging if needed)
  const originalConsole = { ...window.console };
  
  if (isDev) {
    // Development: Keep error & warn, disable others
    window.console = {
      ...window.console,
      log: noop,
      debug: noop,
      info: noop,
      trace: noop,
      table: noop,
      // Keep error & warn for debugging
      // error: originalConsole.error,
      // warn: originalConsole.warn,
    };
  } else if (isProd) {
    // Production: Disable ALL console methods
    window.console = {
      ...window.console,
      log: noop,
      debug: noop,
      info: noop,
      warn: noop,
      error: noop,
      trace: noop,
      table: noop,
      group: noop,
      groupCollapsed: noop,
      groupEnd: noop,
      assert: noop,
      count: noop,
      countReset: noop,
      dir: noop,
      dirxml: noop,
      time: noop,
      timeEnd: noop,
      timeLog: noop,
      clear: noop,
    };
  }
  
  // Expose method to restore console (for emergency debugging)
  // Usage in browser console: window.__restoreConsole()
  window.__restoreConsole = () => {
    window.console = originalConsole;
    console.log('✅ Console restored!');
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SWRProvider>
    <RateLimitProvider>
      <App />
    </RateLimitProvider>
    </SWRProvider>
  </StrictMode>
);


