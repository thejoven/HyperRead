import React from 'react'
import ReactDOM from 'react-dom/client'
import ElectronApp from './electron-app'
import { ThemeProvider } from './components/ThemeProvider'
import { LanguageProvider } from './lib/i18n'
import { ShortcutProvider } from './contexts/ShortcutContext'
import './app/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ShortcutProvider>
          <ElectronApp />
        </ShortcutProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
)