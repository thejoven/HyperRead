// src/main.ts
function estimateReadingTime(text, cnSpeed, enSpeed) {
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const nonChineseText = text.replace(/[一-鿿　-〿＀-￯]/g, " ");
  const enWordCount = nonChineseText.trim().split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length;
  const cnMinutes = chineseChars / cnSpeed;
  const enMinutes = enWordCount / enSpeed;
  const totalMinutes = cnMinutes + enMinutes;
  if (totalMinutes < 1)
    return "\u4E0D\u5230 1 \u5206\u949F";
  if (totalMinutes < 60)
    return Math.ceil(totalMinutes) + " \u5206\u949F";
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.ceil(totalMinutes % 60);
  return hours + " \u5C0F\u65F6 " + mins + " \u5206\u949F";
}
var main_default = {
  async onload(api) {
    const statusItem = api.addStatusBarItem({
      id: "reading-time",
      text: "\u23F1 \u2014",
      tooltip: "\u9884\u8BA1\u9605\u8BFB\u65F6\u95F4"
    });
    function updateTime() {
      const doc = api.getActiveDocument();
      if (doc) {
        const cnSpeed = api.getSetting("chineseCharsPerMin") || 400;
        const enSpeed = api.getSetting("englishWordsPerMin") || 200;
        const time = estimateReadingTime(doc.content, cnSpeed, enSpeed);
        statusItem.update("\u23F1 " + time);
      } else {
        statusItem.update("\u23F1 \u2014");
      }
    }
    api.on("document:open", updateTime);
    api.on("document:close", () => statusItem.update("\u23F1 \u2014"));
    api.on("app:ready", updateTime);
    updateTime();
    api.log("Reading Time plugin loaded");
  },
  async onunload() {
  }
};
export {
  main_default as default
};
