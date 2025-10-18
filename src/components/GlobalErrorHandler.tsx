'use client';

import { useEffect } from 'react';

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Store original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to filter out AbortError
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (message.includes('AbortError') || message.includes('play() request was interrupted')) {
        // Suppress AbortError messages
        return;
      }
      // Log other errors normally
      originalConsoleError.apply(console, args);
    };

    // Handle unhandled promise rejections (including AbortError)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'AbortError' || 
          event.reason?.message?.includes('play() request was interrupted')) {
        // Completely suppress AbortError
        event.preventDefault();
        return;
      }
      
      // Log other unhandled rejections for debugging
      originalConsoleError('❌ Unhandled promise rejection:', event.reason);
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === 'AbortError' || 
          event.error?.message?.includes('play() request was interrupted')) {
        // Completely suppress AbortError
        event.preventDefault();
        return;
      }
      
      // Log other uncaught errors for debugging
      originalConsoleError('❌ Uncaught error:', event.error);
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    // Cleanup
    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
      
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null; // This component doesn't render anything
}
