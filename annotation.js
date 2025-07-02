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

  if (window.self !== window.top) {
    window.addEventListener("scroll", postScrollPosition, { passive: true });
    window.addEventListener("message", handleParentMessage, false);
    postScrollPosition();
    console.log("Annotation helper script (v3.1) attached successfully.");
  }
})();
