(function () {
  const PARENT_ORIGIN = "http://localhost:5173";

  if (window.annotationScriptAttached) {
    return;
  }
  window.annotationScriptAttached = true;

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
      console.log("Posting page URL to parent frame:", window.location.href);
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
  }

  // Monitor client-side routing (SPA navigation)
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

    postScrollPosition();
    postPageUrl();
    patchHistoryMethods();

    console.log("Annotation helper script (v3.2) attached successfully.");
  }
})();
