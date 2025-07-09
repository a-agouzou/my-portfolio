// feedback-script.js

(() => {
  // Only run if we are inside an iframe
  if (window.self === window.top) {
    return; // Halt if not embedded
  }

  let currentMode = "preview"; // 'preview' or 'interactive'
  let comments = [];
  let highlightedCommentId = null;

  // ===== Helper Functions =====

  const getUniqueXPath = (element) => {
    // (Your robust XPath generation function goes here)
    if (element.id) return `id("${element.id}")`;
    if (element === document.body) return element.tagName.toLowerCase();
    let siblingIndex = 1;
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === element.tagName) siblingIndex++;
      sibling = sibling.previousElementSibling;
    }
    return `${getUniqueXPath(element.parentElement)}/${element.tagName.toLowerCase()}[${siblingIndex}]`;
  };

  const renderCommentPins = () => {
    // Clear existing pins
    document.querySelectorAll(".feedback-comment-pin").forEach(pin => pin.remove());

    comments.forEach(comment => {
      try {
        const element = document.evaluate(comment.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) {
          const rect = element.getBoundingClientRect();
          const pin = document.createElement("div");
          pin.className = "feedback-comment-pin";
          pin.dataset.commentId = comment.id;

          const isSelected = comment.id === highlightedCommentId;

          // Apply styles
          Object.assign(pin.style, {
            position: "absolute",
            left: `${rect.left + window.scrollX}px`,
            top: `${rect.top + window.scrollY}px`,
            width: isSelected ? "24px" : "20px",
            height: isSelected ? "24px" : "20px",
            backgroundColor: "red",
            borderRadius: "50%",
            border: isSelected ? "3px solid #00FFFF" : "2px solid white",
            zIndex: "99999",
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: "translate(-50%, -50%)", // Center the pin
          });

          // Add click listener to notify the parent
          pin.addEventListener("click", (e) => {
            e.stopPropagation();
            window.parent.postMessage({ type: "COMMENT_SELECTED", payload: { id: comment.id } }, "*");
          });

          document.body.appendChild(pin);
        }
      } catch (e) { /* ignore errors */ }
    });
  };

  // ===== Event Listeners =====

  // Listen for commands from the parent (your React app)
  window.addEventListener("message", (event) => {
    const data = event.data;
    switch (data.type) {
      case "LOAD_DATA":
        comments = data.payload.comments || [];
        renderCommentPins();
        break;
      case "SET_MODE":
        currentMode = data.payload.mode;
        document.body.style.cursor = currentMode === "interactive" ? "crosshair" : "default";
        break;
      case "HIGHLIGHT_COMMENT":
        highlightedCommentId = data.payload.commentId;
        renderCommentPins(); // Re-render to show the highlight
        break;
    }
  });

  // Listen for clicks when in interactive mode to create new comments
  document.addEventListener("click", (e) => {
    if (currentMode !== "interactive") return;
    e.preventDefault();
    e.stopPropagation();

    const xpath = getUniqueXPath(e.target);
    // In a real app, you'd show a UI to enter text. Here we just notify the parent.
    // The parent (React app) would then handle the state change and send the updated comment list back.
    window.parent.postMessage({ type: "NEW_COMMENT_POINTER", payload: { xpath, x: e.clientX, y: e.clientY } }, "*");

  }, true);
  
  // Debounce re-rendering pins on scroll or resize
  let resizeTimeout;
  const onViewportChange = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(renderCommentPins, 100);
  };
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange);

  // Let the parent know the iframe is ready to receive data
  window.addEventListener('DOMContentLoaded', () => {
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
  });
})();