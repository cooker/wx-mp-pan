    (function () {
      var q = new URLSearchParams(location.search);
      if (q.get("logout") !== null) {
        document.getElementById("msgOk").hidden = false;
      }
      if (q.get("error") !== null) {
        document.getElementById("msgErr").hidden = false;
      }
    })();
