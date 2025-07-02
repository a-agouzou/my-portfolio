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
 * Annotation Helper Script (v2.1 - Correct Snapshot Method)
 *
 * This script provides scroll reporting and on-demand DOM snapshots.
 * It requires the rrweb library to be loaded first.
 */
// (function() {
//   const PARENT_ORIGIN = 'http://localhost:5173';

//   if (window.annotationScriptAttached) {
//     return;
//   }
//   window.annotationScriptAttached = true;

//   function postScrollPosition() {
//     if (window.self !== window.top) {
//       const message = { type: 'iframe-scroll', payload: { x: window.scrollX, y: window.scrollY } };
//       window.parent.postMessage(message, PARENT_ORIGIN);
//     }
//   }

//   function handleParentMessage(event) {
//     if (event.origin !== PARENT_ORIGIN) {
//       return;
//     }

//     const { type } = event.data;

//     if (type === 'REQUEST_DOM_SNAPSHOT') {
//       if (typeof rrweb === 'undefined' || typeof rrweb.record !== 'function') {
//         console.error("Annotation Script: 'rrweb.record' is not available. Cannot take snapshot.");
//         return;
//       }

//       try {

//         let snapshotData = null;

//         const stopRecording = rrweb.record({
//           emit: (event, isCheckout) => {
//             if (event.type === 2) {
//               snapshotData = event.data;
//             }
//           },
//           checkoutEveryNms: 1000 * 60 * 60,
//         });
//         setTimeout(() => {
//           if (stopRecording) {
//             stopRecording();
//           }

//           if (snapshotData) {
//             const responseMessage = {
//               type: 'DOM_SNAPSHOT_DATA',
//               payload: snapshotData,
//             };
//             window.parent.postMessage(responseMessage, PARENT_ORIGIN);
//           } else {
//             console.error("Annotation Script: Failed to capture snapshot from rrweb emit.");
//           }
//         }, 100);
//       } catch (e) {
//         console.error("Annotation Script: Error during rrweb recording for snapshot.", e);
//       }
//     }
//   }

//   if (window.self !== window.top) {
//     window.addEventListener('scroll', postScrollPosition, { passive: true });
//     window.addEventListener('message', handleParentMessage, false);
//     postScrollPosition();
//     console.log("Annotation helper script (v2.1) attached successfully.");
//   }
// })();

(function () {
  const PARENT_ORIGIN = "http://localhost:5173";

  if (window.annotationScriptAttached) {
    return;
  }
  window.annotationScriptAttached = true;

  function postScrollPosition() {
    if (window.self !== window.top) {
      const message = {
        type: "iframe-scroll",
        payload: { x: window.scrollX, y: window.scrollY },
      };
      window.parent.postMessage(message, PARENT_ORIGIN);
    }
  }

  
  function handleParentMessage(event) {
    if (event.origin !== PARENT_ORIGIN) return;
    const { type } = event.data;

    if (type === "REQUEST_DOM_SNAPSHOT") {
      try {
        const baseUrl = document.location.origin;

        const baseTag = `<base href="${baseUrl}/" />`;

        let htmlSnapshot = document.documentElement.outerHTML;

        htmlSnapshot = htmlSnapshot.replace(/<head[^>]*>/, `$&${baseTag}`);

        const responseMessage = {
          type: "DOM_SNAPSHOT_DATA",
          payload: htmlSnapshot,
        };
        window.parent.postMessage(responseMessage, PARENT_ORIGIN);
      } catch (e) {
        console.error("Annotation Script: Error getting document HTML.", e);
      }
    }
  }

  if (window.self !== window.top) {
    window.addEventListener("scroll", postScrollPosition, { passive: true });
    window.addEventListener("message", handleParentMessage, false);
    postScrollPosition();
    console.log("Annotation helper script (v3.1) attached successfully.");
  }
})();
