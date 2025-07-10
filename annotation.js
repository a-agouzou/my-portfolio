(() => {
  if (window.self === window.top) {
    return;
  }

  console.log("Feedback Script Initialized. with renderCommentPins function");

  let comments = [];
  let currentMode = "preview"; // 'preview' or 'interactive'
  let highlightOverlay = null;

    /**
   * Clears old pins and re-renders new ones based on the current `comments` array.
   * This is the core rendering function.
   */
  const renderCommentPins = () => {
    // Clear any pins that are already on the page
    document.querySelectorAll(".feedback-comment-pin").forEach(pin => pin.remove());

    if (!comments || comments.length === 0) {
      return; // Nothing to render
    }
    
    comments.forEach(comment => {
      try {
        // 1. Find the element using the stored XPath
        const targetElement = document.evaluate(comment.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        
        if (!targetElement) {
          console.warn("Could not find element for comment, skipping pin:", comment);
          // In your main app, you can show this as an "orphaned" comment
          return;
        }

        // 2. Get the element's CURRENT position and size
        const currentRect = targetElement.getBoundingClientRect();

        // 3. The "Golden Formula" to calculate the precise pin position
        const relativeX = (comment.positionData.x - comment.elementRect.left) / comment.elementRect.width;
        const relativeY = (comment.positionData.y - comment.elementRect.top) / comment.elementRect.height;
        
        const pinX = currentRect.left + window.scrollX + (currentRect.width * relativeX);
        const pinY = currentRect.top + window.scrollY + (currentRect.height * relativeY);
        
        // 4. Create and style the pin element
       const pin = document.createElement("div");
        pin.className = "feedback-comment-pin";
        pin.dataset.commentId = comment.id;

        // The number to display inside the pin
        pin.textContent = comment.commentNumber;

        Object.assign(pin.style, {
          position: "absolute",
          left: `${pinX}px`,
          top: `${pinY}px`,
          
          // Use min-width to ensure the circle doesn't get too small
          minWidth: "24px",
          height: "24px",
          padding: "0 6px", // Add horizontal padding for numbers > 9
          
          // --- Visual Styling ---
          backgroundColor: "#2563EB", // This is Tailwind's blue-600
          color: "white",
          borderRadius: "50%", // Fully rounded
          border: "2px solid white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          
          // --- Centering the Number ---
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          
          // --- Font Styling ---
          fontSize: "12px",
          fontWeight: "bold",
          fontFamily: "sans-serif",
          
          // --- Other Properties ---
          zIndex: "99999",
          cursor: "pointer",
          transform: "translate(-50%, -50%)",
          
          // Add a smooth transition for selection later
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        });

        // 5. Add a click listener to notify the parent when a pin is selected
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          window.parent.postMessage({ type: "COMMENT_SELECTED", payload: { id: comment.id } }, "*");
        });

        document.body.appendChild(pin);
      } catch (e) {
        console.error("Error rendering pin for comment:", comment, e);
      }
    });
  };

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
      // transition: "all 0.05s ease-out", // Smooth transitions
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
        positionData: {
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
    switch (data.type) {
      case "SET_MODE":
        currentMode = data.payload.mode;
        document.body.style.cursor = currentMode === "interactive" ? "crosshair" : "default";
        if(highlightOverlay) { highlightOverlay.style.display = 'none'; }
        break;
      
      // NEW: Handle receiving the list of comments
      case "LOAD_COMMENTS":
        comments = data.payload.comments || [];
        console.log(`Feedback Script: Loaded ${comments.length} comments.`);
        renderCommentPins();
        break;
    }
  });
  // Re-render pins on resize/scroll to keep them accurate
  let viewportChangeTimeout;
  const handleViewportChange = () => {
    clearTimeout(viewportChangeTimeout);
    viewportChangeTimeout = setTimeout(renderCommentPins, 150); // Debounced for performance
  };

  // When the page content is fully loaded...
  window.addEventListener('DOMContentLoaded', () => {
    createHighlightOverlay();
    
    // Attach the mouseover listener to the document
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("resize", handleViewportChange);
    // window.addEventListener("scroll", handleViewportChange);

    // Let the parent know the iframe is ready to receive commands
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  });
})();