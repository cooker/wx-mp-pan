  (function () {
    var trackingState = { enabled: false, events: {} };
    var homeViewTracked = false;
    var DEVICE_ID_KEY = "site_device_id_v1";

    function getOrCreateDeviceId() {
      try {
        var existing = localStorage.getItem(DEVICE_ID_KEY);
        if (existing && String(existing).trim()) {
          return String(existing).trim();
        }
        var id = "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(DEVICE_ID_KEY, id);
        return id;
      } catch (_) {
        return "dev-anon";
      }
    }

    function injectHeadFragment(html) {
      if (!html || !String(html).trim()) return;
      var tpl = document.createElement("template");
      tpl.innerHTML = html.trim();
      var children = tpl.content.childNodes;
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node.nodeType !== 1) continue;
        var el = node;
        if (el.tagName === "SCRIPT") {
          var s = document.createElement("script");
          if (el.src) s.src = el.src;
          if (el.async) s.async = true;
          if (el.defer) s.defer = true;
          if (el.type) s.type = el.type;
          s.textContent = el.textContent;
          document.head.appendChild(s);
        } else {
          document.head.appendChild(el.cloneNode(true));
        }
      }
    }
    function apply(cfg) {
      if (!cfg) return;
      var t = cfg.siteTitle != null ? String(cfg.siteTitle).trim() : "";
      if (t) {
        document.title = t;
        var h1 = document.querySelector("main h1");
        if (h1) h1.textContent = t;
      }
      trackingState.enabled = !!cfg.trackingEnabled;
      trackingState.events = {};
      if (Array.isArray(cfg.trackingEvents)) {
        cfg.trackingEvents.forEach(function (e) {
          if (e) trackingState.events[String(e)] = true;
        });
      }
      window.__siteTracking = trackingState;
      injectHeadFragment(cfg.headerScript || "");
      if (!homeViewTracked) {
        track("home_view");
        homeViewTracked = true;
      }
    }

    function track(event, props) {
      if (!trackingState.enabled || !trackingState.events[event]) {
        return;
      }
      var body = JSON.stringify({
        event: event,
        path: location.pathname,
        deviceId: getOrCreateDeviceId(),
        props: props || {}
      });
      try {
        if (navigator.sendBeacon) {
          var blob = new Blob([body], { type: "application/json" });
          navigator.sendBeacon("/api/track", blob);
          return;
        }
      } catch (_) {}
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true
      }).catch(function () {});
    }
    window.__emitTrack = track;
    function loadCfg() {
      fetch("/api/site/config")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(apply)
        .catch(function () {});
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadCfg);
    } else {
      loadCfg();
    }
  })();
