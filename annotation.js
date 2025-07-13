(() => {
  // 1. ENVIRONMENT CHECK & STATE INITIALIZATION
  if (window.self === window.top) {
    return; // Halt if not embedded in an iframe
  }
  console.log("Feedback Script Initialized. V2.0");

  // --- State Variables ---
  let comments = [];
  let currentMode = "preview";
  let highlightOverlay = null;
  let highlightedCommentId = null;
  let observer; // Will hold the single MutationObserver instance

  // 2. CORE FUNCTIONS

  /**
   * Renders comment pins on the page and reports visibility changes to the parent.
   */
  const renderCommentPins = () => {
    // --- Infinite Loop Prevention: Part 1 ---
    // Disconnect the observer before we modify the DOM to prevent it from re-triggering.
    if (observer) {
      observer.disconnect();
    }

    // --- Cleanup ---
    // Remove all previously rendered pins before drawing the new ones.
    document
      .querySelectorAll(".feedback-comment-pin")
      .forEach((pin) => pin.remove());

    // --- Logic ---
    const commentsOfCurrentPage = comments.filter(
      (comment) => comment.page === window.location.href
    );

    if (commentsOfCurrentPage.length > 0) {
      const hiddenIds = []; // Batch IDs of comments that became hidden
      const visibleIds = []; // Batch IDs of comments that became visible

      commentsOfCurrentPage.forEach((comment) => {
        try {
          const targetElement = document.evaluate(
            comment.xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;

          const isCurrentlyVisible =
            targetElement &&
            (targetElement.offsetWidth > 0 || targetElement.offsetHeight > 0);

          // --- Visibility Change Detection ---

          // Condition 1: A previously visible comment is now hidden.
          if (!isCurrentlyVisible && !comment.isHidden) {
            hiddenIds.push(comment.id);
          }

          // Condition 2: A previously hidden comment is now visible. (CRITICAL FIX)
          if (isCurrentlyVisible && comment.isHidden) {
            visibleIds.push(comment.id);
          }

          // Don't render a pin for a non-visible element.
          if (!targetElement || !isCurrentlyVisible) {
            return;
          }

          // --- Pin Rendering (only for visible elements) ---
          const currentRect = targetElement.getBoundingClientRect();

          const relativeX = (comment.positionData.x - comment.elementRect.left) / comment.elementRect.width;
          const relativeY = (comment.positionData.y - comment.elementRect.top) / comment.elementRect.height;
          const pinX = currentRect.left + window.scrollX + currentRect.width * relativeX;
          const pinY = currentRect.top + window.scrollY + currentRect.height * relativeY;

          const pin = document.createElement("div");
          pin.className = "feedback-comment-pin";
          pin.dataset.commentId = comment.id;
          pin.textContent = comment.commentNumber;
          Object.assign(pin.style, {
            position: "absolute", left: `${pinX}px`, top: `${pinY}px`,
            minWidth: "24px", height: "24px", padding: "0 6px",
            backgroundColor: "#2563EB", color: "white", borderRadius: "50%",
            border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "bold", fontFamily: "sans-serif",
            zIndex: "99999", cursor: "pointer", transform: "translate(-50%, -50%)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          });

          if (comment.id === highlightedCommentId) {
            pin.style.transform = "translate(-50%, -50%) scale(1.15)";
            pin.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.5)";
            pin.style.zIndex = "100000";
          }

          pin.addEventListener("click", (e) => {
            e.stopPropagation(); e.preventDefault();
            window.parent.postMessage({ type: "COMMENT_SELECTED", payload: { id: e.currentTarget.dataset.commentId } }, "*");
          });

          document.body.appendChild(pin);
        } catch (e) {
          console.error("Error rendering pin:", e);
        }
      });
      
      // --- Batched Reporting ---
      // Send the collected IDs to the parent app in single messages.
      if (hiddenIds.length > 0) {
        window.parent.postMessage({ type: "COMMENTS_BECAME_HIDDEN", payload: { ids: hiddenIds } }, "*");
      }
      if (visibleIds.length > 0) {
        window.parent.postMessage({ type: "COMMENTS_BECAME_VISIBLE", payload: { ids: visibleIds } }, "*");
      }
    }

    // --- Infinite Loop Prevention: Part 2 ---
    // Reconnect the observer now that we are done modifying the DOM.
    if (observer) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
  };

  /**
   * Creates the hover highlight overlay element.
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

  /**
   * Generates a unique, stable XPath for a given element.
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

  // 3. EVENT HANDLERS

  /**
   * Handles clicks in 'interactive' mode to create a new comment.
   */
  const handleClick = (event) => {
    if (currentMode !== "interactive") return;
    event.preventDefault(); event.stopPropagation();
    const target = event.target;
    if (target.classList.contains("feedback-comment-pin")) return;
    const rect = target.getBoundingClientRect();
    window.parent.postMessage({
      type: "NEW_COMMENT_CLICK",
      payload: {
        xpath: getUniqueXPath(target),
        pageUrl: window.location.href,
        isVisible: target.offsetWidth > 0 || target.offsetHeight > 0,
        positionData: { x: event.clientX, y: event.clientY },
        elementRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      },
    }, "*");
  };

  /**
   * Handles mouse movement for the hover highlight.
   */
  const handleMouseOver = (event) => {
    if (currentMode !== "interactive" || !highlightOverlay) return;
    const target = event.target;
    if (target.id === "feedback-highlight-overlay" || target === document.body || target.classList.contains("feedback-comment-pin")) return;
    const rect = target.getBoundingClientRect();
    Object.assign(highlightOverlay.style, {
      display: "block", width: `${rect.width}px`, height: `${rect.height}px`,
      left: `${rect.left + window.scrollX}px`, top: `${rect.top + window.scrollY}px`,
    });
  };

  // 4. MAIN MESSAGE AND DOM LISTENERS

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
        highlightedCommentId = data.payload.highlightedCommentId || null; // Accept highlighted ID
        renderCommentPins();
        break;
      case "HIGHLIGHT_COMMENT": // New listener to just highlight a pin
        highlightedCommentId = data.payload.id;
        renderCommentPins(); // Re-render to apply highlight style
        break;
    }
  });

  // Re-render pins on viewport changes (scroll/resize)
  let viewportChangeTimeout;
  const handleViewportChange = () => {
    clearTimeout(viewportChangeTimeout);
    viewportChangeTimeout = setTimeout(renderCommentPins, 50); // Debounced for performance
  };

  // Initial setup when the iframe content is loaded and ready
  window.addEventListener("DOMContentLoaded", () => {
    createHighlightOverlay();

    // --- Observer Initialization Fix ---
    // Initialize the shared observer instance ONCE.
    observer = new MutationObserver(handleViewportChange);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // --- Attach all other event listeners ---
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", () => { if (highlightOverlay) highlightOverlay.style.display = "none"; });
    document.addEventListener("click", handleClick, true);

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);

    // --- SPA Navigation Handling ---
    const originalPushState = history.pushState;
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleViewportChange();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      handleViewportChange();
    };

    window.addEventListener("popstate", handleViewportChange);

    // --- Signal Readiness ---
    // Tell the parent app that the iframe is ready to receive commands.
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  });
})();