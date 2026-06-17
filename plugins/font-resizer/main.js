// src/main.ts
var currentSize = 16;
function applyFontSize(size) {
  const selectors = '[class*="viewer"], [class*="content"], [class*="document"], article, .markdown-body, [class*="markdown"], [class*="epub"], [class*="reader"]';
  const containers = document.querySelectorAll(selectors);
  containers.forEach((el) => {
    el.style.fontSize = size + "px";
  });
  document.documentElement.style.setProperty("--hyperread-doc-font-size", size + "px");
}
var main_default = {
  async onload(api) {
    const defaultSize = api.getSetting("defaultSize") || 16;
    const step = api.getSetting("step") || 2;
    const minSize = api.getSetting("minSize") || 10;
    const maxSize = api.getSetting("maxSize") || 32;
    currentSize = defaultSize;
    const statusItem = api.addStatusBarItem({
      id: "font-size",
      text: "\u{1F524} " + currentSize + "px",
      tooltip: "\u5F53\u524D\u5B57\u53F7"
    });
    function setSize(s) {
      currentSize = Math.max(minSize, Math.min(maxSize, s));
      applyFontSize(currentSize);
      statusItem.update("\u{1F524} " + currentSize + "px");
    }
    api.addToolbarButton({
      id: "font-decrease",
      icon: "A\u2212",
      tooltip: "\u7F29\u5C0F\u5B57\u53F7",
      onClick: () => setSize(currentSize - step)
    });
    api.addToolbarButton({
      id: "font-increase",
      icon: "A+",
      tooltip: "\u653E\u5927\u5B57\u53F7",
      onClick: () => setSize(currentSize + step)
    });
    api.addToolbarButton({
      id: "font-reset",
      icon: "\u21BA",
      tooltip: "\u91CD\u7F6E\u5B57\u53F7",
      onClick: () => setSize(defaultSize)
    });
    api.addCommand({
      id: "font-increase",
      name: "\u653E\u5927\u5B57\u53F7",
      shortcut: "CmdOrCtrl+=",
      callback: () => setSize(currentSize + step)
    });
    api.addCommand({
      id: "font-decrease",
      name: "\u7F29\u5C0F\u5B57\u53F7",
      shortcut: "CmdOrCtrl+-",
      callback: () => setSize(currentSize - step)
    });
    api.addCommand({
      id: "font-reset",
      name: "\u91CD\u7F6E\u5B57\u53F7",
      shortcut: "CmdOrCtrl+0",
      callback: () => setSize(defaultSize)
    });
    api.on("document:open", () => setSize(defaultSize));
    applyFontSize(currentSize);
    api.log("Font Resizer plugin loaded");
  },
  async onunload() {
  }
};
export {
  main_default as default
};
