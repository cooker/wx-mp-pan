/**
 * ed2k 链接本地解析，供提交表单自动填充。
 * window.parseP2PLink(text) → null | { url, title, content, type }
 */
(function (global) {
  function formatBytes(n) {
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0) {
      return "";
    }
    if (n < 1024) {
      return String(Math.round(n)) + " B";
    }
    var kb = n / 1024;
    if (kb < 1024) {
      return (Math.round(kb * 100) / 100) + " KB";
    }
    var mb = kb / 1024;
    if (mb < 1024) {
      return (Math.round(mb * 100) / 100) + " MB";
    }
    var gb = mb / 1024;
    return (Math.round(gb * 100) / 100) + " GB";
  }

  function decodeEd2kName(raw) {
    if (!raw) {
      return "";
    }
    if (/%[0-9a-fA-F]{2}/.test(raw)) {
      try {
        return decodeURIComponent(raw);
      } catch (_) {}
    }
    return raw;
  }

  function parseEd2k(s) {
    var url = s.trim();
    if (!/^ed2k:\/\//i.test(url)) {
      return null;
    }
    var segs = url.split("|");
    var title = "eMule（ed2k）链接";
    var content = "类型：eMule（ed2k）";
    if (segs.length >= 5 && segs[1] === "file") {
      var nameRaw = segs[2];
      var sizeStr = segs[3];
      var hash = segs[4];
      var name = decodeEd2kName(nameRaw);
      if (name) {
        title = name.length > 500 ? name.slice(0, 500) : name;
      }
      if (/^\d+$/.test(sizeStr) && /^[a-fA-F0-9]{32}$/.test(hash)) {
        var size = parseInt(sizeStr, 10);
        var fb = formatBytes(size);
        content =
          "类型：eMule（ed2k）\n文件大小：" +
          (fb || sizeStr + " B") +
          "\nED2K 哈希：" +
          hash.toUpperCase();
      } else {
        content += "\n（已保存原始链接；大小或哈希未按标准 ed2k 格式识别。）";
      }
    } else {
      content += "\n（已保存原始链接；非标准 ed2k 分段格式。）";
    }
    return { url: url, title: title, content: content, type: "ed2k" };
  }

  function parseP2PLink(text) {
    var s = String(text || "").trim();
    if (!s) {
      return null;
    }
    if (s.slice(0, 16).toLowerCase().startsWith("ed2k://")) {
      return parseEd2k(s);
    }
    return null;
  }

  global.parseP2PLink = parseP2PLink;
})(typeof window !== "undefined" ? window : globalThis);
