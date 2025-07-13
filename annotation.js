(() => {
  // 1. ENVIRONMENT CHECK & STATE INITIALIZATION
  if (window.self === window.top) {
    return; // Halt if not embedded
  }
  console.log("Feedback Script Initialized. V1.0");

  let comments = [];
  let hiddenComments = [];
  let currentMode = "preview";
  let highlightOverlay = null;
  let highlightedCommentId = null;

  // 2. CORE FUNCTIONS

  /**
   * Renders comment pins on the page, applying styles for selection
   * and reporting visibility status back to the parent application.
   */
  const renderCommentPins = () => {
    document
      .querySelectorAll(".feedback-comment-pin")
      .forEach((pin) => pin.remove());

    const commentsOfCurrentPage = comments.filter(
      (comment) => comment.page === window.location.href
    );
    if (commentsOfCurrentPage.length > 0) {
      commentsOfCurrentPage.forEach((comment) => {
        try {
          const targetElement = document.evaluate(
            comment.xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          const isVisible =
            targetElement &&
            (targetElement.offsetWidth > 0 || targetElement.offsetHeight > 0);

          if (
            !isVisible &&
            !comment.isHidden &&
            comment.page === window.location.href
          ) {
            console.log(`Comment ${comment.commentNumber} is not visible`);
            // isVisible
            console.log(
              `Comment ${comment.commentNumber} isVisible?`,
              isVisible
            );
            // comment.isHidden
            console.log(
              `Comment ${comment.commentNumber} isHidden?`,
              comment.isHidden
            );
            // window.location.href
            console.log(`Comment ${comment.commentNumber} page:`, comment.page);
            hiddenComments.push(comment.id);
          }
          if (!targetElement || !isVisible) return;

          const currentRect = targetElement.getBoundingClientRect();

          // Calculate precise pin position using the "Golden Formula"
          const relativeX =
            (comment.positionData.x - comment.elementRect.left) /
            comment.elementRect.width;
          const relativeY =
            (comment.positionData.y - comment.elementRect.top) /
            comment.elementRect.height;
          const pinX =
            currentRect.left + window.scrollX + currentRect.width * relativeX;
          const pinY =
            currentRect.top + window.scrollY + currentRect.height * relativeY;

          // Create and style the pin
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
            backgroundColor: "#2563EB",
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

          // Apply highlight style if selected
          if (comment.id === highlightedCommentId) {
            pin.style.transform = "translate(-50%, -50%) scale(1.15)";
            pin.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.5)";
            pin.style.zIndex = "100000";
          }

          pin.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.parent.postMessage(
              {
                type: "COMMENT_SELECTED",
                payload: { id: e.currentTarget.dataset.commentId },
              },
              "*"
            );
          });

          document.body.appendChild(pin);
        } catch (e) {
          console.error("Error rendering pin:", e);
        }
      });
    }
    console.log(`Hidden comments of this page:`, hiddenComments);
    window.parent.postMessage(
      {
        type: "COMMENT_VISIBILITY_HIDDEN",
        payload: {
          hiddenComments: hiddenComments,
        },
      },
      "*"
    );
  };

  /**
   * Creates the hover highlight overlay element.
   */
  const createHighlightOverlay = () => {
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
   * Generates a unique, stable XPath for a given element.
   */
  const getUniqueXPath = (element) => {
    if (element.id) return `id("${element.id}")`;
    if (element.tagName.toLowerCase() === "body") return "body";
    let i = 1,
      sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === element.tagName) i++;
      sibling = sibling.previousElementSibling;
    }
    return `${getUniqueXPath(
      element.parentElement
    )}/${element.tagName.toLowerCase()}[${i}]`;
  };

  // 3. EVENT HANDLERS

  /**
   * Handles clicks in 'interactive' mode to create a new comment.
   */
  const handleClick = (event) => {
    if (currentMode !== "interactive") return;
    event.preventDefault();
    event.stopPropagation();

    const target = event.target;
    // Do not trigger a new comment if a pin was clicked
    if (target.classList.contains("feedback-comment-pin")) return;

    const rect = target.getBoundingClientRect();

    window.parent.postMessage(
      {
        type: "NEW_COMMENT_CLICK",
        payload: {
          xpath: getUniqueXPath(target),
          pageUrl: window.location.href,
          // *** ADDED: Report the element's visibility at the moment of creation ***
          isVisible: target.offsetWidth > 0 || target.offsetHeight > 0,
          positionData: { x: event.clientX, y: event.clientY },
          elementRect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          },
        },
      },
      "*"
    );
  };

  /**
   * Handles mouse movement for the hover highlight.
   */
  const handleMouseOver = (event) => {
    if (currentMode !== "interactive" || !highlightOverlay) return;
    const target = event.target;
    if (
      target.id === "feedback-highlight-overlay" ||
      target === document.body ||
      target.classList.contains("feedback-comment-pin")
    )
      return;
    const rect = target.getBoundingClientRect();
    Object.assign(highlightOverlay.style, {
      display: "block",
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      left: `${rect.left + window.scrollX}px`,
      top: `${rect.top + window.scrollY}px`,
    });
  };

  // 4. MAIN MESSAGE AND DOM LISTENERS

  // Listen for commands from the parent (your React app)
  window.addEventListener("message", (event) => {
    const data = event.data;
    switch (data.type) {
      case "SET_MODE":
        currentMode = data.payload.mode;
        document.body.style.cursor =
          currentMode === "interactive" ? "crosshair" : "default";
        if (highlightOverlay) highlightOverlay.style.display = "none";
        break;
      case "LOAD_COMMENTS":
        comments = data.payload.comments || [];
        renderCommentPins();
        break;
    }
  });

  // Re-render pins on resize/scroll to keep them accurate
  let viewportChangeTimeout;
  const handleViewportChange = () => {
    clearTimeout(viewportChangeTimeout);
    viewportChangeTimeout = setTimeout(renderCommentPins, 50);
  };

  // Initial setup when the iframe content is loaded
  window.addEventListener("DOMContentLoaded", () => {
    createHighlightOverlay();
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", () => {
      if (highlightOverlay) highlightOverlay.style.display = "none";
    });
    document.addEventListener("click", handleClick, true);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);
    // Detect DOM changes (for dynamic content)
    const observer = new MutationObserver(handleViewportChange);
    observer.observe(document.body, { childList: true, subtree: true });

    // Detect history changes (for SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleViewportChange();
    };

    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      handleViewportChange();
    };

    window.addEventListener("popstate", handleViewportChange);
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
    // add an event listener for any updates in the dom and call renderCommentPins
    // document.addEventListener("DOMSubtreeModified", renderCommentPins);
  });
})();
