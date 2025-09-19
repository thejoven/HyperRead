// 语言接口定义
export interface Language {
  code: string
  name: string
  nativeName: string
}

// 翻译文本结构定义
export interface Translations {
  common: {
    confirm: string
    cancel: string
    save: string
    close: string
    reset: string
    loading: string
    success: string
    error: string
    warning: string
    info: string
  }
  ui: {
    buttons: {
      openFile: string
      openFolder: string
      settings: string
      about: string
      expandSidebar: string
      collapseSidebar: string
      toggleTheme: string
      refreshFiles: string
    }
    messages: {
      selectFile: string
      selectFromList: string
      selectFromListCollapsed: string
      dragDropSupport: string
      dragDropHint: string
      releaseToOpen: string
      readSmarter: string
      fileLoadFailed: string
      directoryLoadFailed: string
      noMarkdownFiles: string
      noMatchingFiles: string
      processing: string
      cannotRefreshDragMode: string
    }
    placeholders: {
      searchFiles: string
    }
  }
  file: {
    operations: {
      loading: string
      loaded: string
      failed: string
    }
    types: {
      markdown: string
      directory: string
      file: string
    }
  }
  settings: {
    title: string
    categories: {
      reading: string
      language: string
    }
    reading: {
      fontSize: string
      fontSizeDesc: string
      resetDefault: string
      increase: string
      decrease: string
    }
    language: {
      title: string
      description: string
      current: string
    }
  }
  about: {
    title: string
    description: string
    version: string
    author: string
    license: string
    website: string
    feedback: string
  }
  mermaid: {
    fullscreen: string
    closeFullscreen: string
    enableDrag: string
    disableDrag: string
    zoomIn: string
    zoomOut: string
    resetZoom: string
    resetPosition: string
    drag: string
    zoom: string
  }
}

// 语言上下文接口
export interface LanguageContextType {
  currentLanguage: string
  languages: Language[]
  translations: Translations
  t: (key: string, params?: Record<string, string | number>) => string
  changeLanguage: (locale: string) => void
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  }
]

// 默认语言
export const DEFAULT_LANGUAGE = 'en'

// localStorage 键名
export const LANGUAGE_STORAGE_KEY = 'docs-language'