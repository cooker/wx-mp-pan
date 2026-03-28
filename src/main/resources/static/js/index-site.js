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

    function isSafeHttpUrl(s) {
      if (!s || typeof s !== "string") return false;
      return /^https?:\/\//i.test(s.trim());
    }

    function renderAppRecommendations(items) {
      var wrap = document.getElementById("homeAppRecs");
      var ul = document.getElementById("homeAppRecsList");
      if (!wrap || !ul) return;
      ul.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        wrap.hidden = true;
        return;
      }
      var n = 0;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it) continue;
        var url = it.downloadUrl != null ? String(it.downloadUrl).trim() : "";
        if (!isSafeHttpUrl(url)) continue;
        var icon = it.iconUrl != null ? String(it.iconUrl).trim() : "";
        if (icon && !isSafeHttpUrl(icon)) icon = "";
        var labelRaw = it.name != null ? String(it.name).trim() : "";
        var label = labelRaw || "下载";
        var phChar =
          labelRaw && labelRaw.charAt(0) ? labelRaw.charAt(0) : label.charAt(0) || "A";
        var li = document.createElement("li");
        li.className = "home-app-rec-item";
        var a = document.createElement("a");
        a.className = "home-app-rec-link";
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", label);
        if (icon) {
          var img = document.createElement("img");
          img.className = "home-app-rec-icon";
          img.src = icon;
          img.alt = "";
          img.loading = "lazy";
          img.decoding = "async";
          a.appendChild(img);
        } else {
          var ph = document.createElement("span");
          ph.className = "home-app-rec-placeholder";
          ph.setAttribute("aria-hidden", "true");
          ph.textContent = phChar;
          a.appendChild(ph);
        }
        var cap = document.createElement("span");
        cap.className = "home-app-rec-label";
        cap.textContent = label;
        a.appendChild(cap);
        li.appendChild(a);
        ul.appendChild(li);
        n++;
      }
      wrap.hidden = n === 0;
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
      renderAppRecommendations(cfg.appRecommendations);
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
