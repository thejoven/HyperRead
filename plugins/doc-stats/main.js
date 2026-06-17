// src/main.ts
function analyze(text) {
  const lines = text.split("\n").length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const sentences = text.split(/[。！？.!?]+/).filter((s) => s.trim().length > 0).length;
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const nonCn = text.replace(/[一-鿿　-〿＀-￯]/g, " ");
  const englishWords = nonCn.trim().split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length;
  const totalChars = text.replace(/\s/g, "").length;
  return { paragraphs, sentences, chineseChars, englishWords, totalChars, lines };
}
var detailPanel = null;
var main_default = {
  async onload(api) {
    const statusItem = api.addStatusBarItem({
      id: "doc-stats",
      text: "\u{1F4CA} \u2014",
      tooltip: "\u6587\u6863\u7EDF\u8BA1\uFF08\u70B9\u51FB\u67E5\u770B\u8BE6\u60C5\uFF09",
      onClick: () => showDetail(api)
    });
    function showDetail(api2) {
      const doc = api2.getActiveDocument();
      if (!doc)
        return;
      const s = analyze(doc.content);
      if (detailPanel) {
        detailPanel.remove();
        detailPanel = null;
        return;
      }
      detailPanel = document.createElement("div");
      detailPanel.className = "doc-stats-detail";
      detailPanel.style.cssText = "position:fixed;bottom:40px;right:16px;background:var(--background,#1e1e1e);border:1px solid var(--border,#333);border-radius:8px;padding:16px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:13px;min-width:220px;";
      detailPanel.innerHTML = `
        <div style="font-weight:600;margin-bottom:8px;">\u{1F4CA} \u6587\u6863\u7EDF\u8BA1</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;">
          <span style="opacity:0.6">\u6BB5\u843D</span><span>${s.paragraphs}</span>
          <span style="opacity:0.6">\u53E5\u5B50</span><span>${s.sentences}</span>
          <span style="opacity:0.6">\u884C\u6570</span><span>${s.lines}</span>
          <span style="opacity:0.6">\u4E2D\u6587\u5B57</span><span>${s.chineseChars.toLocaleString()}</span>
          <span style="opacity:0.6">\u82F1\u6587\u8BCD</span><span>${s.englishWords.toLocaleString()}</span>
          <span style="opacity:0.6">\u603B\u5B57\u7B26</span><span>${s.totalChars.toLocaleString()}</span>
        </div>
      `;
      document.body.appendChild(detailPanel);
      const close = (e) => {
        if (detailPanel && !detailPanel.contains(e.target)) {
          detailPanel.remove();
          detailPanel = null;
          document.removeEventListener("click", close);
        }
      };
      setTimeout(() => document.addEventListener("click", close), 50);
    }
    function updateStats() {
      const doc = api.getActiveDocument();
      if (doc) {
        const s = analyze(doc.content);
        statusItem.update(`\u{1F4CA} ${s.chineseChars + s.englishWords} \u5B57 \xB7 ${s.paragraphs} \u6BB5`);
      } else {
        statusItem.update("\u{1F4CA} \u2014");
      }
    }
    api.on("document:open", updateStats);
    api.on("document:close", () => {
      statusItem.update("\u{1F4CA} \u2014");
      if (detailPanel) {
        detailPanel.remove();
        detailPanel = null;
      }
    });
    api.on("app:ready", updateStats);
    updateStats();
    api.log("Doc Stats plugin loaded");
  },
  async onunload() {
    if (detailPanel) {
      detailPanel.remove();
      detailPanel = null;
    }
  }
};
export {
  main_default as default
};
