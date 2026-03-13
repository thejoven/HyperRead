// Word Count Plugin for HyperRead
// 在状态栏显示字数、字符数、行数统计

export default {
  async onload(api) {
    let statusHandle = null;

    // 统计中英文混排字数
    function countWords(text) {
      const chinese = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
      const english = (text.match(/\b[a-zA-Z']+\b/g) || []).length;
      return chinese + english;
    }

    function countChars(text) {
      return text.replace(/\s/g, '').length;
    }

    function countLines(text) {
      return text ? text.split('\n').length : 0;
    }

    function updateStatus() {
      if (!statusHandle) return;
      const doc = api.getActiveDocument();
      if (doc && doc.content) {
        const words = countWords(doc.content);
        const chars = countChars(doc.content);
        const lines = countLines(doc.content);
        statusHandle.update(
          `${words.toLocaleString()} 词  ${chars.toLocaleString()} 字符  ${lines.toLocaleString()} 行`
        );
      } else {
        statusHandle.update('字数统计: —');
      }
    }

    // 注册状态栏项
    statusHandle = api.addStatusBarItem({
      id: 'word-count-bar',
      text: '字数统计: —',
      tooltip: '字数 · 字符数 · 行数'
    });

    // 监听文档事件
    api.on('document:open', updateStatus);
    api.on('document:close', () => statusHandle && statusHandle.update('字数统计: —'));
    api.on('app:ready', updateStatus);

    // 注册命令
    api.addCommand({
      id: 'show-stats',
      name: '字数统计: 显示详情',
      callback() {
        const doc = api.getActiveDocument();
        if (!doc) {
          alert('当前没有打开的文档');
          return;
        }
        const words = countWords(doc.content);
        const chars = countChars(doc.content);
        const lines = countLines(doc.content);
        const withSpaces = doc.content.length;
        alert(
          `📄 ${doc.fileName}\n\n` +
          `词数（中英混计）: ${words.toLocaleString()}\n` +
          `字符数（不含空白）: ${chars.toLocaleString()}\n` +
          `字符数（含空白）: ${withSpaces.toLocaleString()}\n` +
          `行数: ${lines.toLocaleString()}`
        );
      }
    });

    // 立即更新一次
    updateStatus();
    api.log('字数统计插件已加载');
  },

  async onunload() {
    // 状态栏项和命令由框架自动清理
  }
};
