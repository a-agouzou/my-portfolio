// src/components/AnnotationConnector.js

import React, { useEffect } from 'react';

const AnnotationConnector = () => {
  useEffect(() => {
    // Check if the window is inside an iframe before doing anything.
    // This prevents the script from running on the user's actual site.
    if (window.self === window.top) {
      return;
    }

    // --- Configuration ---
    const parentOrigin = "http://localhost:5173"; // Your real domain in production

    // --- Scroll Reporting Logic ---
    let scrollTimeout;
    const sendScrollPosition = () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = requestAnimationFrame(() => {
        if (window.parent && window.parent !== window) {
           const scrollData = {
            type: 'iframe-scroll',
            payload: { x: window.scrollX, y: window.scrollY },
          };
          window.parent.postMessage(scrollData, parentOrigin);
        }
      });
    };

    // --- Dimension Reporting Logic ---
    const sendDimensions = () => {
      // Use the body's scrollHeight/scrollWidth for the most accurate content size
      const dimensions = {
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
      };
      if (window.parent && window.parent !== window) {
        const resizeData = { type: 'iframe-resize', payload: dimensions };
        window.parent.postMessage(resizeData, parentOrigin);
      }
    };
    
    // --- Attach Event Listeners ---
    window.addEventListener('scroll', sendScrollPosition, { passive: true });

    // Send initial data when the page is fully loaded
    window.addEventListener('load', () => {
      sendScrollPosition();
      sendDimensions();
    });

    // Use a ResizeObserver to detect content changes (e.g., accordions opening)
    const resizeObserver = new ResizeObserver(sendDimensions);
    resizeObserver.observe(document.body);

    // --- Cleanup Logic ---
    return () => {
      window.removeEventListener('scroll', sendScrollPosition);
      // 'load' event doesn't need removal as it fires once
      resizeObserver.disconnect();
      if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component renders nothing to the DOM
};

export default AnnotationConnector;