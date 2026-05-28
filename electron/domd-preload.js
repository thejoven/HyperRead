const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('domdElectron', {
  getInitialDocument: () => ipcRenderer.invoke('domd:get-initial-document'),
  getDocumentBaseDir: () => ipcRenderer.invoke('domd:get-document-base-dir'),
  readImage: (imagePath) => ipcRenderer.invoke('domd:read-image', imagePath),
  saveDocument: (content) => ipcRenderer.invoke('domd:save-document', content),
  setDirty: (dirty) => ipcRenderer.send('domd:set-dirty', Boolean(dirty))
})
