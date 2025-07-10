(() => {
  // Only run if we are inside an iframe managed by your platform
  if (window.self === window.top) {
    return;
  }

  console.log("Feedback Script Initialized.");

  let currentMode = "preview"; // 'preview' or 'interactive'
  let highlightOverlay = null;

  /**
   * Creates the highlight overlay element and adds it to the body.
   * This is done once to avoid creating/destroying it repeatedly.
   */
  const createHighlightOverlay = () => {
    if (document.getElementById("feedback-highlight-overlay")) {
      return;
    }
    const overlay = document.createElement("div");
    overlay.id = "feedback-highlight-overlay";
    Object.assign(overlay.style, {
      position: "absolute",
      backgroundColor: "rgba(100, 150, 255, 0.4)", // A nice blue highlight
      border: "2px solid rgba(50, 100, 255, 0.8)",
      borderRadius: "4px",
      zIndex: "99998", // High z-index but below comment pins
      display: "none", // Hidden by default
      pointerEvents: "none", // So it doesn't interfere with clicks
      transition: "all 0.05s ease-out", // Smooth transitions
    });
    document.body.appendChild(overlay);
    highlightOverlay = overlay;
  };

  /**
   * The main event handler for mouse movement inside the iframe.
   */
  const handleMouseOver = (event) => {
    // We only care about this in interactive mode
    if (currentMode !== "interactive") {
      return;
    }

    const target = event.target;
    
    // Ignore the overlay itself or the body
    if (target.id === 'feedback-highlight-overlay' || target === document.body) {
      return;
    }

    // Get the position and size of the hovered element
    const rect = target.getBoundingClientRect();

    // Update the overlay's position and size
    Object.assign(highlightOverlay.style, {
      display: "block",
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      left: `${rect.left + window.scrollX}px`,
      top: `${rect.top + window.scrollY}px`,
    });
  };

  /**
   * Hides the overlay when the mouse leaves the window.
   */
  const handleMouseOut = () => {
    if (highlightOverlay) {
      highlightOverlay.style.display = 'none';
    }
  };

  // Listen for commands from the parent (your React app)
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (data.type === "SET_MODE") {
      currentMode = data.payload.mode;
      console.log(`Feedback Script: Mode set to -> ${currentMode}`);
      
      // Update cursor and show/hide the overlay based on mode
      document.body.style.cursor = currentMode === "interactive" ? "crosshair" : "default";
      if(highlightOverlay) {
        highlightOverlay.style.display = 'none';
      }
    }
  });

  // When the page content is fully loaded...
  window.addEventListener('DOMContentLoaded', () => {
    createHighlightOverlay();
    
    // Attach the mouseover listener to the document
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    // Let the parent know the iframe is ready to receive commands
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  });
})();