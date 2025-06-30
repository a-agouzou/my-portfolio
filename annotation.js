// /**
//  * Annotation Helper Script (v1.0 - Scroll Reporting)
//  *
//  * INSTRUCTIONS:
//  * 1. Add this script tag just before the closing </body> tag of your web application.
//  * 2. IMPORTANT: You MUST configure the 'PARENT_ORIGIN' variable below to match
//  *    the domain where your annotation tool is hosted.
//  */
// (function() {
//   // --- CONFIGURATION ---
//   // Set this to the origin of your annotation tool application.
//   // FOR DEVELOPMENT: 'http://localhost:3000' (or whatever port you use)
//   // FOR PRODUCTION:  'https://your-annotation-tool.com'
//   const PARENT_ORIGIN = 'http://localhost:5173'; // <-- CHANGE THIS!


//   // --- SCRIPT INITIALIZATION ---
//   // Ensure the script only runs once, even if included multiple times.
//   if (window.annotationScriptAttached) {
//     return;
//   }
//   window.annotationScriptAttached = true;


//   // --- CORE FUNCTION: POST SCROLL POSITION ---
//   /**
//    * Sends the current window scroll coordinates to the parent window.
//    */
//   function postScrollPosition() {
//     // We only want to send messages if the page is actually inside an iframe.
//     // window.self !== window.top is a reliable way to check for this.
//     if (window.self !== window.top) {
//       const message = {
//         type: 'iframe-scroll',
//         payload: {
//           x: window.scrollX,
//           y: window.scrollY,
//         },
//       };

//       // Send the message to the parent window. The 'PARENT_ORIGIN' argument is a
//       // crucial security measure to ensure we only send data to our trusted tool.
//       window.parent.postMessage(message, PARENT_ORIGIN);
//     }
//   }


//   // --- ATTACH EVENT LISTENERS ---
//   // Only attach listeners if the page is confirmed to be in an iframe.
//   if (window.self !== window.top) {
//     // 1. Listen for 'scroll' events on the window.
//     //    The 'passive: true' option is a performance optimization for scroll listeners.
//     window.addEventListener('scroll', postScrollPosition, { passive: true });

//     // 2. Send the initial position immediately when the script loads and runs.
//     //    This handles cases where the page might be loaded already scrolled.
//     postScrollPosition();

//     console.log("Annotation scroll script attached successfully.");
//   }

// })();


/**
 * Annotation Helper Script (v2.0 - Scroll & DOM Snapshot Reporting)
 *
 * INSTRUCTIONS:
 * 1. Load the 'rrweb' library BEFORE this script in your web application's <head>.
 *    <script src="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js"></script>
 * 2. Add this script tag just before the closing </body> tag.
 * 3. IMPORTANT: Configure the 'PARENT_ORIGIN' variable below.
 */
(function() {
  // --- CONFIGURATION ---
  const PARENT_ORIGIN = 'http://localhost:5173'; // <-- CHANGE THIS!

  // --- SCRIPT INITIALIZATION ---
  if (window.annotationScriptAttached) {
    return;
  }
  window.annotationScriptAttached = true;

  // --- SCROLL REPORTING FUNCTION ---
  function postScrollPosition() {
    if (window.self !== window.top) {
      const message = {
        type: 'iframe-scroll',
        payload: {
          x: window.scrollX,
          y: window.scrollY,
        },
      };
      window.parent.postMessage(message, PARENT_ORIGIN);
    }
  }

  // --- ATTACH EVENT LISTENERS ---
  if (window.self !== window.top) {
    // Scroll listener (your existing code)
    window.addEventListener('scroll', postScrollPosition, { passive: true });
    postScrollPosition();

    // ========================================================================
    // --- NEW: LISTENER FOR PARENT REQUESTS (e.g., DOM SNAPSHOT) ---
    // ========================================================================
    window.addEventListener('message', (event) => {
      // SECURITY: Always verify the origin of the message
      if (event.origin !== PARENT_ORIGIN) {
        return;
      }

      const { type } = event.data;

      // Handle the specific request for a DOM snapshot
      if (type === 'REQUEST_DOM_SNAPSHOT') {
        // Check if rrweb is available on the window object
        if (typeof rrweb === 'undefined') {
          console.error("Annotation Script: 'rrweb' is not loaded. Cannot take snapshot.");
          return;
        }

        try {
          // Take the snapshot using rrweb
          const snapshotData = rrweb.snapshot({ document: document, emitStun: true });

          // Send the captured data back to the parent
          const responseMessage = {
            type: 'DOM_SNAPSHOT_DATA',
            payload: snapshotData,
          };
          
          window.parent.postMessage(responseMessage, PARENT_ORIGIN);

        } catch (e) {
          console.error("Annotation Script: Error taking rrweb snapshot.", e);
        }
      }
    });
    // ========================================================================

    console.log("Annotation helper script (v2.0) attached successfully.");
  }
})();