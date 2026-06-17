// src/main.ts
function parseHeadings(content) {
  const lines = content.split("\n");
  const entries = [];
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const text = m[2].replace(/[*_`~\[\]]/g, "").trim();
      const id = "heading-" + text.toLowerCase().replace(/[^\w一-鿿]+/g, "-").replace(/^-|-$/g, "");
      entries.push({ level, text, id });
    }
  }
  return entries;
}
var main_default = {
  async onload(api) {
    api.registerSidebarPanel({
      id: "toc",
      title: "\u76EE\u5F55",
      icon: "\u{1F4D1}",
      render(container) {
        container.style.overflow = "auto";
        container.style.padding = "0";
        function renderToc() {
          container.innerHTML = "";
          const doc = api.getActiveDocument();
          if (!doc) {
            container.innerHTML = '<div class="toc-empty">\u6253\u5F00\u6587\u6863\u540E\u663E\u793A\u76EE\u5F55</div>';
            return;
          }
          const entries = parseHeadings(doc.content);
          if (entries.length === 0) {
            container.innerHTML = '<div class="toc-empty">\u672A\u627E\u5230\u6807\u9898</div>';
            return;
          }
          const header = document.createElement("div");
          header.className = "toc-header";
          header.textContent = "\u{1F4D1} " + doc.fileName.replace(/\.[^.]+$/, "");
          container.appendChild(header);
          const list = document.createElement("ul");
          list.className = "toc-list";
          entries.forEach((entry) => {
            const li = document.createElement("li");
            li.className = "toc-item toc-h" + Math.min(entry.level, 4);
            li.textContent = entry.text;
            li.title = entry.text;
            li.addEventListener("click", () => {
              const headings = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
              for (const h of headings) {
                if (h.textContent?.trim() === entry.text) {
                  h.scrollIntoView({ behavior: "smooth", block: "start" });
                  break;
                }
              }
              list.querySelectorAll(".toc-item").forEach((el) => el.classList.remove("active"));
              li.classList.add("active");
            });
            list.appendChild(li);
          });
          container.appendChild(list);
        }
        renderToc();
        api.on("document:open", () => renderToc());
        api.on("document:close", () => {
          container.innerHTML = '<div class="toc-empty">\u6253\u5F00\u6587\u6863\u540E\u663E\u793A\u76EE\u5F55</div>';
        });
        return () => {
        };
      }
    });
    api.log("TOC plugin loaded");
  },
  async onunload() {
  }
};
export {
  main_default as default
};
