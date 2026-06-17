// src/main.ts
var FILE_ICONS = {
  md: "\u{1F4DD}",
  pdf: "\u{1F4D5}",
  epub: "\u{1F4DA}",
  html: "\u{1F310}",
  txt: "\u{1F4C4}",
  json: "\u{1F4CB}",
  csv: "\u{1F4CA}"
};
function getIcon(fileName) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || "\u{1F4C4}";
}
function formatTime(ts) {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 6e4)
    return "\u521A\u521A";
  if (diff < 36e5)
    return Math.floor(diff / 6e4) + " \u5206\u949F\u524D";
  if (diff < 864e5)
    return Math.floor(diff / 36e5) + " \u5C0F\u65F6\u524D";
  if (diff < 6048e5)
    return Math.floor(diff / 864e5) + " \u5929\u524D";
  return new Date(ts).toLocaleDateString();
}
var main_default = {
  async onload(api) {
    const maxItems = api.getSetting("maxItems") || 50;
    let recentFiles = [];
    const saved = await api.loadData();
    if (saved?.files && Array.isArray(saved.files)) {
      recentFiles = saved.files;
    }
    function saveFiles() {
      api.saveData({ files: recentFiles.slice(0, maxItems) });
    }
    function addRecent(fileName, filePath) {
      recentFiles = recentFiles.filter((f) => f.filePath !== filePath);
      recentFiles.unshift({ fileName, filePath, lastOpened: Date.now() });
      recentFiles = recentFiles.slice(0, maxItems);
      saveFiles();
    }
    api.registerSidebarPanel({
      id: "recent-files",
      title: "\u6700\u8FD1\u6587\u4EF6",
      icon: "\u{1F550}",
      render(container) {
        container.style.overflow = "auto";
        container.style.padding = "0";
        function renderList() {
          container.innerHTML = "";
          if (recentFiles.length === 0) {
            container.innerHTML = '<div class="recent-empty">\u6682\u65E0\u6700\u8FD1\u6253\u5F00\u7684\u6587\u4EF6</div>';
            return;
          }
          const header = document.createElement("div");
          header.className = "recent-header";
          header.innerHTML = "<span>\u{1F550} \u6700\u8FD1\u6587\u4EF6 (" + recentFiles.length + ")</span>";
          const clearBtn = document.createElement("span");
          clearBtn.className = "recent-clear";
          clearBtn.textContent = "\u6E05\u7A7A";
          clearBtn.addEventListener("click", () => {
            recentFiles = [];
            saveFiles();
            renderList();
          });
          header.appendChild(clearBtn);
          container.appendChild(header);
          const list = document.createElement("ul");
          list.className = "recent-list";
          recentFiles.forEach((entry) => {
            const li = document.createElement("li");
            li.className = "recent-item";
            li.innerHTML = `
              <span class="recent-item-icon">${getIcon(entry.fileName)}</span>
              <div class="recent-item-info">
                <div class="recent-item-name">${entry.fileName}</div>
                <div class="recent-item-path">${entry.filePath}</div>
              </div>
              <span class="recent-item-time">${formatTime(entry.lastOpened)}</span>
            `;
            li.addEventListener("click", async () => {
              try {
                await api.readFile(entry.filePath);
              } catch (e) {
                api.log("Failed to open", e);
              }
            });
            list.appendChild(li);
          });
          container.appendChild(list);
        }
        renderList();
        api.on("document:open", () => {
          const doc = api.getActiveDocument();
          if (doc) {
            addRecent(doc.fileName, doc.filePath);
            renderList();
          }
        });
        return () => {
        };
      }
    });
    const initialDoc = api.getActiveDocument();
    if (initialDoc)
      addRecent(initialDoc.fileName, initialDoc.filePath);
    api.log("Recent Files plugin loaded");
  },
  async onunload() {
  }
};
export {
  main_default as default
};
