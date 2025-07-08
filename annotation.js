/**
 * Annotation Helper Script (v5.0 - IntersectionObserver-based)
 * This script is injected into an iframe to communicate with a parent window.
 * It reports scroll position, URL changes, and detects when UI elements
 * like modals or dialogs become visible.
 */
(function () {
  // --- CONFIGURATION ---
  // IMPORTANT: This MUST match the origin of your parent React application.
  // Mismatches will cause messages to be silently ignored.
  const PARENT_ORIGIN = "http://localhost:5173";

  // Prevents the script from being injected multiple times.
  if (window.annotationScriptAttached) {
    return;
  }
  window.annotationScriptAttached = true;

  // --- CORE FUNCTIONS ---

  function postScrollPosition() {
    window.parent.postMessage({
      type: "iframe-scroll",
      payload: { x: window.scrollX, y: window.scrollY },
    }, PARENT_ORIGIN);
  }

  function postPageUrl() {
    window.parent.postMessage({
      type: "iframe-url-change",
      payload: { url: window.location.href },
    }, PARENT_ORIGIN);
  }

  function handleParentMessage(event) {
    // Security: Only accept messages from the trusted parent origin.
    if (event.origin !== PARENT_ORIGIN) return;
    
    if (event.data?.type === "REQUEST_DOM_SNAPSHOT") {
      try {
        const baseUrl = document.location.origin;
        const baseTag = `<base href="${baseUrl}/" />`;
        let htmlSnapshot = document.documentElement.outerHTML;
        htmlSnapshot = htmlSnapshot.replace(/<head[^>]*>/, `$&${baseTag}`);

        window.parent.postMessage({
          type: "DOM_SNAPSHOT_DATA",
          payload: htmlSnapshot,
        }, PARENT_ORIGIN);
      } catch (e) {
        console.error("Annotation Script: Error getting document HTML.", e);
      }
    }
  }

  /**
   * The core logic for detecting visible popups.
   * This uses a combination of IntersectionObserver for efficiency
   * and MutationObserver for dynamic content.
   */
  function observeVisibilityChanges() {
    // 1. THE VISIBILITY DETECTOR (IntersectionObserver)
    // This observer's job is to fire ONLY when a watched element enters the viewport.
    const visibilityObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // 'isIntersecting' is true if the element is visible on screen.
        // We also check a custom attribute to ensure we only alert once per element.
        if (entry.isIntersecting && !entry.target.hasAttribute('data-annot-seen')) {
          console.log("Annotation Script: Detected a visible UI element:", entry.target);
          
          // Mark the element as "seen" to prevent future alerts for the same element.
          entry.target.setAttribute('data-annot-seen', 'true');

          // Send a message to the parent window about the detected element.
          window.parent.postMessage({
            type: "VISIBLE_UI_ELEMENT_DETECTED",
            payload: {
              element: {
                tag: entry.target.tagName,
                class: entry.target.className,
                id: entry.target.id,
                role: entry.target.getAttribute("role"),
              },
            },
          }, PARENT_ORIGIN);
        }
      }
    }, {
      // Fire the event as soon as even a small part of the element is visible.
      threshold: 0.01, 
    });

    // 2. THE NEW ELEMENT FINDER (MutationObserver)
    // This observer's job is to watch for new elements being added to the DOM.
    // This is crucial for single-page applications that add modals dynamically.
    const domObserver = new MutationObserver(() => {
      // When the DOM changes, we scan for any *new* popups we aren't watching yet.
      findAndObservePopups();
    });

    // A helper function to find potential popups and start observing them.
    const findAndObservePopups = () => {
      const candidates = document.querySelectorAll(
        // This selector list is key. Add to it if websites use other patterns.
        ".modal, .popup, .dropdown, dialog, [role='dialog'], [data-popup]"
      );

      candidates.forEach((el) => {
        // If we haven't already started watching this element, start now.
        if (!el.hasAttribute('data-annot-observed')) {
          el.setAttribute('data-annot-observed', 'true');
          visibilityObserver.observe(el);
        }
      });
    };

    // 3. START THE PROCESS
    // Start watching the entire body for new elements being added or removed.
    domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Run the finder once at the start to catch any popups present on initial load.
    findAndObservePopups();
  }

  // --- SPA NAVIGATION PATCHING ---
  function patchHistoryMethods() {
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      postPageUrl();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      postPageUrl();
    };

    window.addEventListener("popstate", postPageUrl);
  }

  // --- SCRIPT INITIALIZATION ---
  if (window.self !== window.top) { // Ensure we are in an iframe
    // Add all event listeners
    window.addEventListener("scroll", postScrollPosition, { passive: true });
    window.addEventListener("message", handleParentMessage, false);
    window.addEventListener("load", postPageUrl, false);
    
    // Initial state reporting
    postScrollPosition();
    postPageUrl();
    
    // Activate advanced features
    patchHistoryMethods();
    observeVisibilityChanges();

    console.log("Annotation helper script (v5.0) attached successfully.");
  }
})();