(() => {
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

   /**
   * Generates a unique XPath for a given element.
   * This is a critical helper function.
   */
  const getUniqueXPath = (element) => {
    if (element.id) {
      // If the element has an ID, that's the most reliable selector
      return `id("${element.id}")`;
    }
    // Stop at the body tag
    if (element.tagName.toLowerCase() === 'body') {
      return 'body';
    }

    // Calculate the element's index among its siblings of the same tag
    let siblingIndex = 1;
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === element.tagName) {
        siblingIndex++;
      }
      sibling = sibling.previousElementSibling;
    }

    const parentXPath = getUniqueXPath(element.parentElement);
    return `${parentXPath}/${element.tagName.toLowerCase()}[${siblingIndex}]`;
  };


    // NEW: Add a click listener
  const handleClick = (event) => {
    if (currentMode !== "interactive") {
      return;
    }

    // Stop the event from doing anything else (like navigating)
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target;
    const xpath = getUniqueXPath(target);
    const rect = target.getBoundingClientRect();

    console.log(`Feedback Script: Click captured. XPath: ${xpath}`);

    // Send a message to the parent with all the necessary info
    window.parent.postMessage({
      type: "NEW_COMMENT_CLICK",
      payload: {
        xpath: xpath,
        // We send the coordinates relative to the iframe's viewport
        clickPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        // Also send info about the element that was clicked
        elementRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        },
        pageUrl : window.location.href, // The URL of the page
      },
    }, "*");
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
    document.addEventListener("click", handleClick, true);

    // Let the parent know the iframe is ready to receive commands
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  });
})();