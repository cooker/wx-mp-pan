    const form = document.getElementById("searchForm");
    const keywordInput = document.getElementById("keyword");
    const sortBySelect = document.getElementById("sortBy");
    const submitBtn = document.getElementById("submitBtn");
    const meta = document.getElementById("meta");
    const error = document.getElementById("error");
    const list = document.getElementById("list");
    const homeStatsEl = document.getElementById("homeStats");
    const statTotalEl = document.getElementById("statTotal");
    const hotKeywordsEl = document.getElementById("hotKeywords");
    const emitTrack = typeof window.__emitTrack === "function" ? window.__emitTrack : function () {};

    function escapeHtml(text) {
      return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
    }

    function renderItems(items) {
      if (!items.length) {
        list.innerHTML = "<div class=\"result-empty\" role=\"status\">没有匹配结果。</div>";
        return;
      }

      const thead = `
        <thead>
          <tr>
            <th scope="col">标题</th>
            <th scope="col">分类</th>
            <th scope="col">标签</th>
            <th scope="col" class="cell-num">热度</th>
            <th scope="col">摘要</th>
            <th scope="col" class="cell-action">操作</th>
          </tr>
        </thead>`;

      const rows = items.map(item => {
        const title = escapeHtml(item.title || "");
        const catRaw = item.categoryName != null && String(item.categoryName).trim() !== ""
          ? escapeHtml(String(item.categoryName).trim())
          : "—";
        const tagsRaw = item.tags != null && String(item.tags).trim() !== ""
          ? escapeHtml(String(item.tags).trim())
          : "—";
        const heat =
          item.heatScore != null && !Number.isNaN(Number(item.heatScore))
            ? Number(item.heatScore)
            : 0;
        const highlight = (item.highlight || "").trim();
        const summary = highlight ? highlight : "无摘要";
        const urlRaw = item.url != null ? String(item.url).trim() : "";
        const rid = item.id != null ? String(item.id) : "";
        const copyBtn = urlRaw
          ? `<button type="button" class="btn-copy-link" data-url="${encodeURIComponent(urlRaw)}" data-resource-id="${escapeHtml(rid)}">🧲</button>`
          : `<button type="button" class="btn-copy-link" disabled title="无链接">无链接</button>`;
        return `
          <tr>
            <td class="cell-title" data-label="标题">${title}</td>
            <td class="cell-cat" data-label="分类">${catRaw}</td>
            <td class="cell-tags" data-label="标签">${tagsRaw}</td>
            <td class="cell-num" data-label="热度">${heat}</td>
            <td class="cell-snippet" data-label="摘要">${summary}</td>
            <td class="cell-action" data-label="操作">${copyBtn}</td>
          </tr>`;
      }).join("");

      list.innerHTML = `
        <div class="result-table-wrap">
          <table class="result-table" role="table" aria-label="搜索结果">
            ${thead}
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    async function copyToClipboard(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (_) {}
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch (_) {
        return false;
      }
    }

    list.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn-copy-link");
      if (!btn || btn.disabled) return;
      const enc = btn.getAttribute("data-url");
      if (!enc) return;
      e.preventDefault();
      const text = decodeURIComponent(enc);
      emitTrack("copy_link_click");
      copyToClipboard(text).then(function (ok) {
        const label = ok ? "已复制" : "复制失败";
        const prev = btn.textContent;
        btn.textContent = label;
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = prev;
          btn.disabled = false;
        }, 1600);
        if (ok) {
          const rid = btn.getAttribute("data-resource-id");
          if (rid) {
            fetch("/api/resources/" + encodeURIComponent(rid) + "/heat", { method: "POST" })
              .then(function (res) {
                if (!res.ok) return;
                const row = btn.closest("tr");
                const heatCell = row && row.querySelector(".cell-num");
                if (heatCell) {
                  const n = parseInt(heatCell.textContent, 10);
                  if (!Number.isNaN(n)) {
                    heatCell.textContent = String(n + 1);
                  }
                }
              })
              .catch(function () {});
          }
        }
      });
    });

    function renderHomeStats(data) {
      if (!data || typeof data.totalResources !== "number") {
        homeStatsEl.hidden = true;
        return;
      }
      statTotalEl.textContent = String(data.totalResources);
      const hot = data.hotKeywords || [];
      if (hot.length === 0) {
        hotKeywordsEl.innerHTML =
          "<span class=\"hot-empty\">暂无搜索记录，多搜几次后将出现热门词</span>";
      } else {
        hotKeywordsEl.innerHTML = hot
          .map(function (k) {
            const raw = k.keyword != null ? String(k.keyword) : "";
            const c = k.count != null ? Number(k.count) : 0;
            return (
              "<button type=\"button\" class=\"hot-kw-btn\" data-kw=\"" +
              encodeURIComponent(raw) +
              "\">" +
              escapeHtml(raw) +
              "<span class=\"kw-count\">" +
              c +
              "</span></button>"
            );
          })
          .join("");
        hotKeywordsEl.querySelectorAll(".hot-kw-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var kw = decodeURIComponent(btn.getAttribute("data-kw") || "");
            if (kw) {
              keywordInput.value = kw;
              emitTrack("hot_keyword_click", { keyword: kw });
              form.requestSubmit();
            }
          });
        });
      }
      homeStatsEl.hidden = false;
    }

    async function loadHomeStats() {
      try {
        const res = await fetch("/api/home/stats");
        if (!res.ok) return;
        const data = await res.json();
        renderHomeStats(data);
      } catch (_) {
        /* 忽略统计加载失败，不影响检索 */
      }
    }

    loadHomeStats();

    async function doSearch(keyword, sortBy) {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, page: 0, size: 10, sortBy })
      });
      if (!res.ok) {
        throw new Error("检索请求失败，请稍后重试。");
      }
      return res.json();
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const keyword = keywordInput.value.trim();
      if (!keyword) return;
      const sortBy = sortBySelect.value;
      emitTrack("search_submit", { keywordLength: keyword.length, sortBy: sortBy });

      error.textContent = "";
      meta.textContent = "正在检索...";
      list.innerHTML = "";
      submitBtn.disabled = true;

      try {
        const data = await doSearch(keyword, sortBy);
        meta.textContent = `共找到 ${data.total ?? 0} 条结果`;
        renderItems(data.items ?? []);
      } catch (e) {
        meta.textContent = "";
        error.textContent = e.message || "检索失败";
      } finally {
        submitBtn.disabled = false;
      }
    });

    sortBySelect.addEventListener("change", () => {
      const keyword = keywordInput.value.trim();
      if (!keyword) return;
      form.requestSubmit();
    });

    const modalSubmit = document.getElementById("modalSubmitResource");
    const modalBlock = document.getElementById("modalBlockWord");
    const btnOpenSubmit = document.getElementById("btnOpenSubmitResource");
    const btnOpenBlock = document.getElementById("btnOpenBlockWord");
    const btnCloseSubmit = document.getElementById("btnCloseSubmitResource");
    const btnCloseBlock = document.getElementById("btnCloseBlockWord");
    const formSubmitResource = document.getElementById("formSubmitResource");
    const formBlockWord = document.getElementById("formBlockWord");

    function openModal(el) {
      el.classList.add("is-open");
    }
    function closeModal(el) {
      el.classList.remove("is-open");
    }

    btnOpenSubmit.addEventListener("click", () => {
      document.getElementById("submitResourceMsg").hidden = true;
      document.getElementById("submitResourceErr").hidden = true;
      openModal(modalSubmit);
    });
    btnOpenBlock.addEventListener("click", () => {
      document.getElementById("blockWordMsg").hidden = true;
      document.getElementById("blockWordErr").hidden = true;
      openModal(modalBlock);
    });
    btnCloseSubmit.addEventListener("click", () => closeModal(modalSubmit));
    btnCloseBlock.addEventListener("click", () => closeModal(modalBlock));

    const resTitleEl = document.getElementById("resTitle");
    const resUrlEl = document.getElementById("resUrl");
    function applyP2PAutofillFromUrl() {
      if (!resUrlEl || !resTitleEl) return;
      const url = resUrlEl.value.trim();
      const parseFn = typeof window.parseP2PLink === "function" ? window.parseP2PLink : null;
      if (!parseFn) return;
      const parsed = parseFn(url);
      if (!parsed) return;
      if (!resTitleEl.value.trim()) {
        resTitleEl.value = parsed.title.slice(0, 500);
      }
    }
    if (resUrlEl) {
      resUrlEl.addEventListener("input", applyP2PAutofillFromUrl);
      resUrlEl.addEventListener("paste", () => {
        setTimeout(applyP2PAutofillFromUrl, 0);
      });
    }

    modalSubmit.addEventListener("click", (e) => {
      if (e.target === modalSubmit) closeModal(modalSubmit);
    });
    modalBlock.addEventListener("click", (e) => {
      if (e.target === modalBlock) closeModal(modalBlock);
    });

    formSubmitResource.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById("submitResourceMsg");
      const errEl = document.getElementById("submitResourceErr");
      msgEl.hidden = true;
      errEl.hidden = true;

      const url = document.getElementById("resUrl").value.trim();
      let title = document.getElementById("resTitle").value.trim();
      const parsed =
        typeof window.parseP2PLink === "function" ? window.parseP2PLink(url) : null;
      if (parsed && !title) {
        title = String(parsed.title || "").slice(0, 500);
        document.getElementById("resTitle").value = title;
      }

      const body = { title, url };
      if (parsed && parsed.content) {
        body.content = parsed.content;
      }
      if (parsed && parsed.type) {
        body.type = parsed.type;
      }

      try {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "提交失败");
        }
        msgEl.textContent = "提交成功，感谢分享。";
        msgEl.hidden = false;
        emitTrack("submit_resource");
        formSubmitResource.reset();
        setTimeout(() => closeModal(modalSubmit), 1500);
      } catch (err) {
        errEl.textContent = err.message || "提交失败";
        errEl.hidden = false;
      }
    });

    formBlockWord.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById("blockWordMsg");
      const errEl = document.getElementById("blockWordErr");
      msgEl.hidden = true;
      errEl.hidden = true;

      const keyword = document.getElementById("blockKeyword").value.trim();
      try {
        const res = await fetch("/api/blocked-keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword })
        });
        if (res.status === 409) {
          msgEl.textContent = "该屏蔽词已存在。";
          msgEl.hidden = false;
          return;
        }
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "添加失败");
        }
        msgEl.textContent = "已提交审核，通过后将在检索中生效。";
        msgEl.hidden = false;
        emitTrack("submit_blocked_keyword");
        formBlockWord.reset();
        setTimeout(() => closeModal(modalBlock), 1500);
      } catch (err) {
        errEl.textContent = err.message || "添加失败";
        errEl.hidden = false;
      }
    });
