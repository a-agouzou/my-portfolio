// src/components/AnnotationConnector.js

import React, { useEffect } from 'react';

const AnnotationConnector = () => {
  useEffect(() => {
    // --- Start of script ---
    // This is a self-contained script. It won't interfere with your app's state.
    
    // The origin of our annotation app.
    const parentOrigin = "http://localhost:5173/" // This will be your real domain

    let scrollTimeout;

    const sendScrollPosition = () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }

      scrollTimeout = requestAnimationFrame(() => {
        if (window.parent && window.parent !== window) {
           const scrollData = {
            type: 'iframe-scroll',
            payload: {
              x: window.scrollX,
              y: window.scrollY,
            },
          };
          window.parent.postMessage(scrollData, parentOrigin);
        }
      });
    };
    
    // Check if the window is inside an iframe before adding listeners
    if (window.self !== window.top) {
      window.addEventListener('scroll', sendScrollPosition, { passive: true });
      window.addEventListener('load', sendScrollPosition);
      window.addEventListener('resize', sendScrollPosition, { passive: true });

      // Cleanup function to remove listeners when the component unmounts
      return () => {
        window.removeEventListener('scroll', sendScrollPosition);
        window.removeEventListener('load', sendScrollPosition);
        window.removeEventListener('resize', sendScrollPosition);
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component renders nothing to the DOM
};

export default AnnotationConnector;