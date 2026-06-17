// src/main.ts
function showToast(msg) {
  const t = document.createElement("div");
  t.className = "bm-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2e3);
}
var main_default = {
  async onload(api) {
    let bookmarks = [];
    const saved = await api.loadData();
    if (saved?.bookmarks && Array.isArray(saved.bookmarks)) {
      bookmarks = saved.bookmarks;
    }
    function save() {
      api.saveData({ bookmarks });
    }
    function isBookmarked(filePath) {
      return bookmarks.some((b) => b.filePath === filePath);
    }
    function toggleBookmark() {
      const doc = api.getActiveDocument();
      if (!doc)
        return;
      if (isBookmarked(doc.filePath)) {
        bookmarks = bookmarks.filter((b) => b.filePath !== doc.filePath);
        showToast("\u5DF2\u53D6\u6D88\u4E66\u7B7E");
      } else {
        bookmarks.unshift({ fileName: doc.fileName, filePath: doc.filePath, addedAt: Date.now() });
        showToast("\u5DF2\u6DFB\u52A0\u4E66\u7B7E \u2B50");
      }
      save();
    }
    api.registerDocumentAction({
      id: "toggle-bookmark",
      title: "\u6536\u85CF\u4E66\u7B7E",
      icon: "\u2B50",
      fileTypes: ["markdown", "pdf", "epub", "html", "text"],
      onClick: () => toggleBookmark()
    });
    api.registerSidebarPanel({
      id: "bookmarks",
      title: "\u4E66\u7B7E",
      icon: "\u2B50",
      render(container) {
        container.style.overflow = "auto";
        container.style.padding = "0";
        function renderList() {
          container.innerHTML = "";
          if (bookmarks.length === 0) {
            container.innerHTML = '<div class="bm-empty">\u2B50 \u6682\u65E0\u4E66\u7B7E<br><small>\u5728\u6587\u6863\u64CD\u4F5C\u4E2D\u70B9\u51FB \u2B50 \u6536\u85CF</small></div>';
            return;
          }
          const header = document.createElement("div");
          header.className = "bm-header";
          header.textContent = "\u2B50 \u4E66\u7B7E (" + bookmarks.length + ")";
          container.appendChild(header);
          const list = document.createElement("ul");
          list.className = "bm-list";
          bookmarks.forEach((bm, idx) => {
            const li = document.createElement("li");
            li.className = "bm-item";
            li.innerHTML = `
              <span class="bm-item-icon">\u{1F4C4}</span>
              <div class="bm-item-info">
                <div class="bm-item-name">${bm.fileName}</div>
                <div class="bm-item-path">${bm.filePath}</div>
              </div>
              <span class="bm-item-remove" title="\u79FB\u9664\u4E66\u7B7E">\u2715</span>
            `;
            li.querySelector(".bm-item-info").addEventListener("click", async () => {
              try {
                await api.readFile(bm.filePath);
              } catch (e) {
                api.log("Failed to open", e);
              }
            });
            li.querySelector(".bm-item-remove").addEventListener("click", (e) => {
              e.stopPropagation();
              bookmarks.splice(idx, 1);
              save();
              renderList();
            });
            list.appendChild(li);
          });
          container.appendChild(list);
        }
        renderList();
        api.on("document:open", renderList);
        api.on("document:close", renderList);
        return () => {
        };
      }
    });
    api.log("Bookmark plugin loaded");
  },
  async onunload() {
  }
};
export {
  main_default as default
};
