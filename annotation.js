(() => {
  // 1. ENVIRONMENT CHECK
  // Only run if we are inside an iframe managed by your platform
  if (window.self === window.top) {
    return;
  }
  console.log("Feedback Script Initialized.");

  // 2. STATE VARIABLES
  let comments = [];
  let currentMode = "preview";
  let highlightOverlay = null;
  let highlightedCommentId = null;

  // 3. CORE FUNCTIONS

  /**
   * Clears old pins and re-renders new ones based on the current `comments` array.
   * This is the heart of the display logic.
   */
  const renderCommentPins = () => {
    // Clear any pins that are already on the page
    document.querySelectorAll(".feedback-comment-pin").forEach((pin) => pin.remove());

    if (!comments || comments.length === 0) {
      // If there are no comments, we still need to inform the parent
      // that there are no visible comments.
      window.parent.postMessage({
        type: "COMMENT_VISIBILITY_STATUS",
        payload: { allCommentIds: [], visibleCommentIds: [] }
      }, "*");
      return;
    }

    // NEW: Keep track of which comments are successfully rendered
    const successfullyRenderedIds = new Set();

    comments.forEach((comment) => {
      try {
        const targetElement = document.evaluate(
          comment.xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        // UPDATED: Check if the element exists AND is actually visible on the page.
        // An element with no size is considered invisible.
        const isElementVisible = targetElement && (targetElement.offsetWidth > 0 || targetElement.offsetHeight > 0);

        if (!isElementVisible) {
          // The element is "orphaned". We skip drawing a pin for it.
          // The parent UI will be notified later and can show an eye-slash icon.
          return;
        }

        // If we reach here, the element is found and visible.
        successfullyRenderedIds.add(comment.id);

        const currentRect = targetElement.getBoundingClientRect();

        // The "Golden Formula" for precise positioning
        // Note: I'm correcting a small bug from your provided script. The `positionData` (from a click) and `elementRect`
        // should be from the comment object itself, not a mix. Assuming `comment.positionData` and `comment.elementRect` exist.
        const relativeX = (comment.positionData.x - comment.elementRect.left) / comment.elementRect.width;
        const relativeY = (comment.positionData.y - comment.elementRect.top) / comment.elementRect.height;

        const pinX = currentRect.left + window.scrollX + (currentRect.width * relativeX);
        const pinY = currentRect.top + window.scrollY + (currentRect.height * relativeY);

        const pin = document.createElement("div");
        pin.className = "feedback-comment-pin";
        pin.dataset.commentId = comment.id;
        pin.textContent = comment.commentNumber;

        Object.assign(pin.style, {
          position: "absolute",
          left: `${pinX}px`,
          top: `${pinY}px`,
          minWidth: "24px",
          height: "24px",
          padding: "0 6px",
          backgroundColor: "#2563EB", // Tailwind's blue-600
          color: "white",
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          fontFamily: "sans-serif",
          zIndex: "99999",
          cursor: "pointer",
          transform: "translate(-50%, -50%)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        });

        // NEW: Apply highlight styles if this pin is the selected one
        const isSelected = comment.id === highlightedCommentId;
        if (isSelected) {
          pin.style.transform = "translate(-50%, -50%) scale(1.15)";
          pin.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.5)"; // Blue glow
          pin.style.zIndex = "100000"; // Bring to the very front
        }

        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          window.parent.postMessage({
            type: "COMMENT_SELECTED",
            payload: { id: e.currentTarget.dataset.commentId },
          }, "*");
        });

        document.body.appendChild(pin);
      } catch (e) {
        console.error("Error rendering pin for comment:", comment, e);
      }
    });

    // UPDATED: After checking all comments, send a single summary message to the parent.
    window.parent.postMessage({
      type: "COMMENT_VISIBILITY_STATUS",
      payload: {
        allCommentIds: comments.map(c => c.id),
        visibleCommentIds: Array.from(successfullyRenderedIds)
      }
    }, "*");
  };

  /**
   * Creates the hover highlight overlay element.
   */
  const createHighlightOverlay = () => {
    // ... (This function is correct, no changes needed)
    if (document.getElementById("feedback-highlight-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "feedback-highlight-overlay";
    Object.assign(overlay.style, {
      position: "absolute",
      backgroundColor: "rgba(100, 150, 255, 0.4)",
      border: "2px solid rgba(50, 100, 255, 0.8)",
      borderRadius: "4px",
      zIndex: "99998",
      display: "none",
      pointerEvents: "none",
    });
    document.body.appendChild(overlay);
    highlightOverlay = overlay;
  };

  /**
   * Handles mouse movement for the hover highlight.
   */
  const handleMouseOver = (event) => {
    // ... (This function is correct, no changes needed)
    if (currentMode !== "interactive" || !highlightOverlay) return;
    const target = event.target;
    if (target.id === "feedback-highlight-overlay" || target === document.body || target.classList.contains('feedback-comment-pin')) return;
    const rect = target.getBoundingClientRect();
    Object.assign(highlightOverlay.style, {
      display: "block",
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      left: `${rect.left + window.scrollX}px`,
      top: `${rect.top + window.scrollY}px`,
    });
  };

  /**
   * Hides the hover overlay.
   */
  const handleMouseOut = () => {
    // ... (This function is correct, no changes needed)
    if (highlightOverlay) highlightOverlay.style.display = "none";
  };

  /**
   * Generates a unique XPath for an element.
   */
  const getUniqueXPath = (element) => {
    // ... (This function is correct, no changes needed)
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
   * Handles clicks in interactive mode to create a new comment.
   */
  const handleClick = (event) => {
    // ... (This function is correct, no changes needed)
    if (currentMode !== "interactive") return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target;
    const xpath = getUniqueXPath(target);
    const rect = target.getBoundingClientRect();
    window.parent.postMessage({
      type: "NEW_COMMENT_CLICK",
      payload: {
        xpath: xpath,
        positionData: { x: event.clientX, y: event.clientY },
        elementRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        pageUrl: window.location.href,
      },
    }, "*");
  };

  // 4. MAIN EVENT LISTENERS

  // Listen for commands from the parent (your React app)
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
        break;

      // NEW: Handle highlight requests from the parent
      case "HIGHLIGHT_COMMENT":
        highlightedCommentId = data.payload.commentId;
        renderCommentPins(); // Re-render to apply highlight styles
        break;
    }
  });

  // Debounce viewport changes for performance
  let viewportChangeTimeout;
  const handleViewportChange = () => {
    clearTimeout(viewportChangeTimeout);
    viewportChangeTimeout = setTimeout(renderCommentPins, 150);
  };

  // Initial setup when the iframe content is loaded
  window.addEventListener("DOMContentLoaded", () => {
    createHighlightOverlay();
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  });
})();