
import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * A component that reports the window's scroll position to a parent window.
 * This should be used when the React app is embedded in an iframe for annotation.
 * It renders nothing to the DOM.
 * @param {object} props
 * @param {string} props.parentOrigin - The origin of the parent window to send messages to.
 */
function AnnotationScrollReporter({ parentOrigin }) {
  useEffect(() => {
    // Guard clause: If not embedded in an iframe, do nothing.
    if (window.parent === window) {
      return;
    }

    // Ensure a valid origin is provided before attaching listeners.
    if (!parentOrigin) {
      console.warn('AnnotationScrollReporter: `parentOrigin` prop is missing. No scroll data will be sent.');
      return;
    }

    const postScrollPosition = () => {
      // Check for parent again in case the frame is detached dynamically.
      if (window.parent && window.parent !== window) {
        const message = {
          type: 'iframe-scroll',
          payload: {
            x: window.scrollX,
            y: window.scrollY,
          },
        };
        // Send the message to the parent window, specifying its origin for security.
        window.parent.postMessage(message, parentOrigin);
      }
    };

    // --- Attach Listeners ---

    // Send the initial scroll position once the component has mounted.
    postScrollPosition();

    // Add the scroll event listener.
    window.addEventListener('scroll', postScrollPosition, { passive: true });

    // --- Cleanup Function ---
    // This function will be called when the component unmounts.
    return () => {
      window.removeEventListener('scroll', postScrollPosition);
    };

    // The dependency array ensures this effect runs only when parentOrigin changes.
  }, [parentOrigin]);

  // This component does not render any UI.
  return null;
}

AnnotationScrollReporter.propTypes = {
  parentOrigin: PropTypes.string.isRequired,
};

export default AnnotationScrollReporter;