import React from 'react'
import ReactDOM from 'react-dom/client'
import ElectronApp from './electron-app'
import { ThemeProvider } from './components/ThemeProvider'
import './app/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ElectronApp />
    </ThemeProvider>
  </React.StrictMode>
)