(() => {
  const pixelId = "reoqz";

  if (!window.twq) {
    const twq = function () {
      twq.exe ? twq.exe.apply(twq, arguments) : twq.queue.push(arguments);
    };
    twq.version = "1.1";
    twq.queue = [];
    window.twq = twq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://static.ads-twitter.com/uwt.js";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  if (!window.__WEBUI_X_PIXEL_REOQZ_CONFIGURED__) {
    window.twq("config", pixelId);
    window.__WEBUI_X_PIXEL_REOQZ_CONFIGURED__ = true;
  }
})();
