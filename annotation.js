(function () {
  const PARENT_ORIGIN = "http://localhost:5173";

  if (window.annotationScriptAttached) {
    return;
  }
  window.annotationScriptAttached = true;
  let isCommentModeEnabled = false;
  function postScrollPosition() {
    if (window.self !== window.top) {
      const message = {
        type: "iframe-scroll",
        payload: { x: window.scrollX, y: window.scrollY },
      };
      window.parent.postMessage(message, PARENT_ORIGIN);
    }
  }

  function postPageUrl() {
    if (window.self !== window.top) {
      const message = {
        type: "iframe-url-change",
        payload: { url: window.location.href },
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
    if (type === "TOGGLE_COMMENT_MODE") {
      isCommentModeEnabled = payload.enabled;
      // The cursor change now directly reflects the parent's mode.
      document.body.style.cursor = isCommentModeEnabled
        ? "crosshair"
        : "default";
    }
  }

  function handleAnnotationClick(event) {
    if (!isCommentModeEnabled) return;

    // A click happened in the correct mode!
    event.preventDefault();
    event.stopPropagation();

    const clickedElement = event.target;
    let isElementHidden = false;
    let currentElement = clickedElement;

    // Heuristic check for "hidden" status
    while (currentElement && currentElement !== document.body) {
      const role = currentElement.getAttribute("role");
      if (role === "dialog" || role === "menu") {
        isElementHidden = true;
        break;
      }
      currentElement = currentElement.parentElement;
    }

    // We *don't* disable comment mode here. The parent will do that by
    // switching to 'interactive' mode, which will send a new message.

    // Send the context back to the parent. We no longer need coords because
    // the parent will handle drawing.
    window.parent.postMessage(
      {
        type: "ANNOTATION_CONTEXT_CAPTURED",
        payload: {
          isHidden: isElementHidden,
          pageUrl: window.location.href,
        },
      },
      PARENT_ORIGIN
    );
  }

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

  if (window.self !== window.top) {
    window.addEventListener("scroll", postScrollPosition, { passive: true });
    window.addEventListener("message", handleParentMessage, false);
    window.addEventListener("load", postPageUrl, false);
    document.addEventListener("click", handleAnnotationClick, {
      capture: true,
    });

    postScrollPosition();
    postPageUrl();
    patchHistoryMethods();

  }
})();

// (function () {
//   const PARENT_ORIGIN = "http://localhost:5173";

//   if (window.annotationScriptAttached) return;
//   window.annotationScriptAttached = true;

//   let isCommentModeEnabled = false; // Default to false

//   // ... postScrollPosition, postPageUrl functions ...

//   function handleParentMessage(event) {
//     if (event.origin !== PARENT_ORIGIN) return;
//     const { type, payload } = event.data;

//     if (type === "TOGGLE_COMMENT_MODE") {
//       isCommentModeEnabled = payload.enabled;
//       // The cursor change now directly reflects the parent's mode.
//       document.body.style.cursor = isCommentModeEnabled
//         ? "crosshair"
//         : "default";
//     }
//     // ... other handlers like REQUEST_DOM_SNAPSHOT ...
//   }

//   function handleAnnotationClick(event) {
//     if (!isCommentModeEnabled) return;

//     // A click happened in the correct mode!
//     event.preventDefault();
//     event.stopPropagation();

//     const clickedElement = event.target;
//     let isElementHidden = false;
//     let currentElement = clickedElement;

//     // Heuristic check for "hidden" status
//     while (currentElement && currentElement !== document.body) {
//       const role = currentElement.getAttribute("role");
//       if (role === "dialog" || role === "menu") {
//         isElementHidden = true;
//         break;
//       }
//       currentElement = currentElement.parentElement;
//     }

//     // We *don't* disable comment mode here. The parent will do that by
//     // switching to 'interactive' mode, which will send a new message.

//     // Send the context back to the parent. We no longer need coords because
//     // the parent will handle drawing.
//     window.parent.postMessage(
//       {
//         type: "ANNOTATION_CONTEXT_CAPTURED",
//         payload: {
//           isHidden: isElementHidden,
//           pageUrl: window.location.href,
//         },
//       },
//       PARENT_ORIGIN
//     );
//   }

//   // ... patchHistoryMethods ...

//   if (window.self !== window.top) {
//     // ... other event listeners ...
//     document.addEventListener("click", handleAnnotationClick, {
//       capture: true,
//     });
//     // ...
//   }
// })();
