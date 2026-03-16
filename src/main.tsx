import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import ElectronApp from './electron-app'
import { ThemeProvider } from './components/ThemeProvider'
import { LanguageProvider } from './lib/i18n'
import { ShortcutProvider } from './contexts/ShortcutContext'
import { PluginProvider } from './contexts/PluginContext'
import type { FileData } from './types/file'
import './app/globals.css'

function AppRoot() {
  const activeDocRef = useRef<FileData | null>(null)
  const getActiveDocument = () => activeDocRef.current

  return (
    <PluginProvider getActiveDocument={getActiveDocument}>
      <ElectronApp activeDocRef={activeDocRef} />
    </PluginProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <ShortcutProvider>
          <AppRoot />
        </ShortcutProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
)