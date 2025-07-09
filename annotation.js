
(function () {

  const PARENT_ORIGIN = "http://localhost:5173";

  if (window.annotationScriptAttached) {
    return;
  }
  window.annotationScriptAttached = true;


  function postScrollPosition() {
    window.parent.postMessage({
      type: "iframe-scroll",
      payload: { x: window.scrollX, y: window.scrollY },
    }, PARENT_ORIGIN);
  }

  function postPageUrl() {
    window.parent.postMessage({
      type: "iframe-url-change",
      payload: { url: window.location.href },
    }, PARENT_ORIGIN);
  }

  function handleParentMessage(event) {
    if (event.origin !== PARENT_ORIGIN) return;
    
    if (event.data?.type === "REQUEST_DOM_SNAPSHOT") {
      try {
        const baseUrl = document.location.origin;
        const baseTag = `<base href="${baseUrl}/" />`;
        let htmlSnapshot = document.documentElement.outerHTML;
        htmlSnapshot = htmlSnapshot.replace(/<head[^>]*>/, `$&${baseTag}`);

        window.parent.postMessage({
          type: "DOM_SNAPSHOT_DATA",
          payload: htmlSnapshot,
        }, PARENT_ORIGIN);
      } catch (e) {
        console.error("Annotation Script: Error getting document HTML.", e);
      }
    }
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
    
    postScrollPosition();
    postPageUrl();
    
    patchHistoryMethods();

    console.log("Annotation helper script (v5.0) attached successfully.");
  }
})();