/**
 * Annotation Helper Script (v1.0 - Scroll Reporting)
 *
 * INSTRUCTIONS:
 * 1. Add this script tag just before the closing </body> tag of your web application.
 * 2. IMPORTANT: You MUST configure the 'PARENT_ORIGIN' variable below to match
 *    the domain where your annotation tool is hosted.
 */
(function() {
  // --- CONFIGURATION ---
  // Set this to the origin of your annotation tool application.
  // FOR DEVELOPMENT: 'http://localhost:3000' (or whatever port you use)
  // FOR PRODUCTION:  'https://your-annotation-tool.com'
  const PARENT_ORIGIN = 'http://localhost:5173'; // <-- CHANGE THIS!


  // --- SCRIPT INITIALIZATION ---
  // Ensure the script only runs once, even if included multiple times.
  if (window.annotationScriptAttached) {
    return;
  }
  window.annotationScriptAttached = true;


  // --- CORE FUNCTION: POST SCROLL POSITION ---
  /**
   * Sends the current window scroll coordinates to the parent window.
   */
  function postScrollPosition() {
    // We only want to send messages if the page is actually inside an iframe.
    // window.self !== window.top is a reliable way to check for this.
    if (window.self !== window.top) {
      const message = {
        type: 'iframe-scroll',
        payload: {
          x: window.scrollX,
          y: window.scrollY,
        },
      };

      // Send the message to the parent window. The 'PARENT_ORIGIN' argument is a
      // crucial security measure to ensure we only send data to our trusted tool.
      window.parent.postMessage(message, PARENT_ORIGIN);
    }
  }


  // --- ATTACH EVENT LISTENERS ---
  // Only attach listeners if the page is confirmed to be in an iframe.
  if (window.self !== window.top) {
    // 1. Listen for 'scroll' events on the window.
    //    The 'passive: true' option is a performance optimization for scroll listeners.
    window.addEventListener('scroll', postScrollPosition, { passive: true });

    // 2. Send the initial position immediately when the script loads and runs.
    //    This handles cases where the page might be loaded already scrolled.
    postScrollPosition();

    console.log("Annotation scroll script attached successfully.");
  }

})();