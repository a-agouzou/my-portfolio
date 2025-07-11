(() => {
  // 1. SCRIPT INITIALIZATION AND ENVIRONMENT CHECK
  // Only run if the script is loaded inside an iframe.
  if (window.self === window.top) {
    return;
  }
  console.log("Feedback Script Initialized (Last Known Status Model).");

  // 2. STATE VARIABLES
  let comments = []; // Holds comments for the CURRENT page only.
  let currentMode = "preview"; // 'preview' or 'interactive'.
  let highlightOverlay = null; // The blue hover-highlight element.
  let highlightedCommentId = null; // The ID of the currently selected comment.

  // 3. CORE LOGIC FUNCTIONS

  /**
   * Checks the current visibility of all comment elements on this page
   * and reports a summary back to the parent React application.
   */
  const checkAndReportVisibility = () => {
    // If there are no comments for this page, report that nothing is visible.
    if (!comments || comments.length === 0) {
      window.parent.postMessage({
        type: "COMMENT_VISIBILITY_STATUS",
        payload: { allCommentIdsOnPage: [], visibleCommentIds: [] }
      }, "*");
      return;
    }

    const allCommentIdsOnPage = comments.map(c => c.id);
    const visibleCommentIds = new Set();

    comments.forEach((comment) => {
      try {
        const targetElement = document.evaluate(comment.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        // An element is visible if it exists and has a physical size.
        const isElementVisible = targetElement && (targetElement.offsetWidth > 0 || targetElement.offsetHeight > 0);
        
        if (isElementVisible) {
          visibleCommentIds.add(comment.id);
        }
      } catch (e) { /* Ignore errors during the check */ }
    });

    // Send the report. The parent app will use this to update the database.
    window.parent.postMessage({
      type: "COMMENT_VISIBILITY_STATUS",
      payload: { allCommentIdsOnPage, visibleCommentIds: Array.from(visibleCommentIds) }
    }, "*");
  };

  /**
   * Renders the visual pins on the page for all currently visible comments.
   */
  const renderCommentPins = () => {
    document.querySelectorAll(".feedback-comment-pin").forEach((pin) => pin.remove());

    if (!comments || comments.length === 0) return;

    comments.forEach((comment) => {
      try {
        const targetElement = document.evaluate(comment.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        
        // Don't draw a pin if the element is not currently visible.
        if (!targetElement || (targetElement.offsetWidth === 0 && targetElement.offsetHeight === 0)) {
          return;
        }

        const currentRect = targetElement.getBoundingClientRect();
        const relativeX = (comment.positionData.x - comment.elementRect.left) / comment.elementRect.width;
        const relativeY = (comment.positionData.y - comment.elementRect.top) / comment.elementRect.height;
        const pinX = currentRect.left + window.scrollX + (currentRect.width * relativeX);
        const pinY = currentRect.top + window.scrollY + (currentRect.height * relativeY);

        const pin = document.createElement("div");
        pin.className = "feedback-comment-pin";
        pin.dataset.commentId = comment.id;
        pin.textContent = comment.commentNumber;
        Object.assign(pin.style, {
          position: "absolute", left: `${pinX}px`, top: `${pinY}px`, minWidth: "24px",
          height: "24px", padding: "0 6px", backgroundColor: "#2563EB", color: "white",
          borderRadius: "50%", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px",
          fontWeight: "bold", fontFamily: "sans-serif", zIndex: "99999", cursor: "pointer",
          transform: "translate(-50%, -50%)", transition: "transform 0.2s ease, box-shadow 0.2s ease",
        });

        if (comment.id === highlightedCommentId) {
          pin.style.transform = "translate(-50%, -50%) scale(1.15)";
          pin.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.5)";
          pin.style.zIndex = "100000";
        }

        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          window.parent.postMessage({ type: "COMMENT_SELECTED", payload: { id: e.currentTarget.dataset.commentId } }, "*");
        });

        document.body.appendChild(pin);
      } catch (e) {
        console.error("Error rendering pin for comment:", comment.id, e);
      }
    });
  };

  /**
   * Generates a unique, stable XPath for a given DOM element.
   */
  const getUniqueXPath = (element) => {
    if (element.id) return `id("${element.id}")`;
    if (element.tagName.toLowerCase() === "body") return "body";
    let i = 1, sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === element.tagName) i++;
      sibling = sibling.previousElementSibling;
    }
    return `${getUniqueXPath(element.parentElement)}/${element.tagName.toLowerCase()}[${i}]`;
  };

  /**
   * Creates the blue hover highlight overlay element.
   */
  const createHighlightOverlay = () => {
    if (document.getElementById("feedback-highlight-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "feedback-highlight-overlay";
    Object.assign(overlay.style, {
      position: "absolute", backgroundColor: "rgba(100, 150, 255, 0.4)",
      border: "2px solid rgba(50, 100, 255, 0.8)", borderRadius: "4px",
      zIndex: "99998", display: "none", pointerEvents: "none",
    });
    document.body.appendChild(overlay);
    highlightOverlay = overlay;
  };

  // 4. EVENT HANDLERS
  
  /**
   * Handles clicks in 'interactive' mode to create a new comment.
   */
  const handleClick = (event) => {
    if (currentMode !== "interactive" || event.target.classList.contains('feedback-comment-pin')) return;
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target;
    const rect = target.getBoundingClientRect();

    window.parent.postMessage({
      type: "NEW_COMMENT_CLICK",
      payload: {
        xpath: getUniqueXPath(target),
        pageUrl: window.location.href,
        wasVisibleAtCreation: target.offsetWidth > 0 || target.offsetHeight > 0,
        positionData: { x: event.clientX, y: event.clientY },
        elementRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      },
    }, "*");
  };
  
  /**
   * Handles mouse movement to show the hover highlight.
   */
  const handleMouseOver = (event) => {
    if (currentMode !== "interactive" || !highlightOverlay) return;
    const target = event.target;
    // Don't highlight the body, the overlay itself, or comment pins
    if (target.id === "feedback-highlight-overlay" || target === document.body || target.classList.contains('feedback-comment-pin')) return;
    const rect = target.getBoundingClientRect();
    Object.assign(highlightOverlay.style, {
      display: "block", width: `${rect.width}px`, height: `${rect.height}px`,
      left: `${rect.left + window.scrollX}px`, top: `${rect.top + window.scrollY}px`,
    });
  };

  // 5. MAIN EVENT LISTENERS SETUP

  // Listen for commands from the parent React app
  window.addEventListener("message", (event) => {
    const data = event.data;
    switch (data.type) {
      case "SET_MODE":
        currentMode = data.payload.mode;
        document.body.style.cursor = currentMode === "interactive" ? "crosshair" : "default";
        if (highlightOverlay) highlightOverlay.style.display = "none";
        break;
      case "LOAD_COMMENTS":
        comments = data.payload.comments || [];
        renderCommentPins();
        checkAndReportVisibility();
        break;
      case "HIGHLIGHT_COMMENT":
        highlightedCommentId = data.payload.commentId;
        renderCommentPins();
        break;
    }
  });

  // Re-render pins and re-check visibility on viewport changes
  let viewportChangeTimeout;
  const handleViewportChange = () => {
    clearTimeout(viewportChangeTimeout);
    viewportChangeTimeout = setTimeout(() => {
      renderCommentPins();
      checkAndReportVisibility();
    }, 150);
  };

  // Continuously check for visibility changes from dynamic content (e.g., modals)
  setInterval(() => {
    // Only check if the user isn't in the middle of creating a comment
    if (currentMode !== 'interactive') {
      checkAndReportVisibility();
    }
  }, 2000); // Check every 2 seconds

  // Initial setup when the iframe's content has loaded
  window.addEventListener("DOMContentLoaded", () => {
    createHighlightOverlay();
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", () => { if (highlightOverlay) highlightOverlay.style.display = 'none'; });
    document.addEventListener("click", handleClick, true);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  });
})();