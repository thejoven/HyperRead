export default {
  async onload(api) {
    api.registerDocumentAction({
      id: 'open-editor',
      title: 'Edit with DOMD',
      icon: 'edit',
      fileTypes: ['markdown'],
      async onClick({ fileData }) {
        if (!fileData?.filePath) {
          throw new Error('Current document does not have a file path')
        }

        await api.openMarkdownEditor({ filePath: fileData.filePath })
      }
    })

    api.log('DOMD Markdown Editor plugin loaded')
  },

  async onunload() {
    // UI contributions are cleaned up by HyperRead.
  }
}
