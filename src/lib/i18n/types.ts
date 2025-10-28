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
      ai: string
      shortcuts: string
    }
    reading: {
      fontSize: string
      fontSizeDesc: string
      resetDefault: string
      increase: string
      decrease: string
      contentWidth: string
      contentWidthDesc: string
      widthNarrow: string
      widthMedium: string
      widthWide: string
      widthFull: string
      widthFullDesc: string
      primaryColor: string
      primaryColorDesc: string
      colorCyan: string
      colorBlue: string
      colorPurple: string
      colorGreen: string
      colorOrange: string
      colorPink: string
    }
    language: {
      title: string
      description: string
      current: string
    }
    ai: {
      title: string
      description: string
      provider: string
      apiKey: string
      apiKeyPlaceholder: string
      apiUrl: string
      apiUrlPlaceholder: string
      model: string
      modelPlaceholder: string
      testConnection: string
      saveConfig: string
      providerOptions: {
        openai: string
        anthropic: string
        custom: string
      }
      status: {
        notConfigured: string
        configured: string
        testing: string
        success: string
        failed: string
      }
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
  aiSidebar: {
    title: string
    placeholders: {
      input: string
      inputDisabled: string
      longDocProcessing: string
    }
    buttons: {
      configure: string
      clearChat: string
      send: string
    }
    tooltips: {
      configureAi: string
      clearChat: string
      close: string
    }
    status: {
      configured: string
      longDocSupport: string
      processing: string
      thinking: string
      enterToSend: string
      shiftEnterForNewLine: string
    }
    messages: {
      startConversation: string
      analysisReady: string
      analysisReadyWithHistory: string
      generalAssistant: string
      errorPrefix: string
      errorNetwork: string
      longDocDetected: string
      longDocChunks: string
      longDocProgress: string
      longDocFailed: string
      needConfiguration: string
    }
    suggestions: {
      title: string
      whatIsThis: string
      summarize: string
      analyzeStructure: string
      extractKeyInfo: string
      explainConcept: string
      summarizeLongDoc: string
      analyzeLongDocStructure: string
      extractLongDocKeyInfo: string
      whatDoesLongDocSay: string
    }
  }
  search: {
    placeholder: string
    close: string
    noResults: string
    resultCount: string
    modes: {
      document: string
      global: string
    }
    placeholders: {
      document: string
      global: string
    }
    actions: {
      close: string
      next: string
      previous: string
      select: string
      indexDirectory: string
    }
    status: {
      indexing: string
      error: string
      searching: string
      noResultsFound: string
      resultsCount: string
      enterSearchTerm: string
    }
    messages: {
      noResults: string
      needIndex: string
      noMatchesFound: string
      tryDifferentTerms: string
      startSearching: string
    }
    shortcuts: {
      next: string
      previous: string
      close: string
      select: string
      switchMode: string
      nextHint: string
      previousHint: string
    }
    options: {
      title: string
      caseSensitive: string
      wholeWord: string
      regex: string
    }
  }
  tableOfContents: {
    placeholder: string
    clearSearch: string
    collapse: string
    openToc: string
    expandToc: string
    noMatchingItems: string
    tryOtherKeywords: string
    noToc: string
    jumpTo: string
    itemsCount: string
  }
  shortcuts: {
    title: string
    description: string
    search: string
    searchPlaceholder: string
    category: string
    action: string
    keys: string
    status: string
    enabled: string
    disabled: string
    edit: string
    reset: string
    resetAll: string
    export: string
    import: string
    recording: string
    pressKeys: string
    cancel: string
    confirm: string
    conflict: string
    conflictTitle: string
    conflictMessage: string
    override: string
    keepBoth: string
    conflictResolution: string
    currentShortcut: string
    conflictingShortcut: string
    suggestions: string
    noConflict: string
    categories: {
      general: string
      navigation: string
      editor: string
      search: string
      view: string
    }
    actions: {
      openFile: string
      openFolder: string
      settings: string
      closeWindow: string
      quitApp: string
      nextFile: string
      prevFile: string
      goBack: string
      goForward: string
      searchDocument: string
      searchGlobal: string
      nextResult: string
      prevResult: string
      toggleSidebar: string
      toggleAi: string
      toggleTheme: string
      zoomIn: string
      zoomOut: string
      resetZoom: string
      increaseFont: string
      decreaseFont: string
    }
    messages: {
      resetAllConfirm: string
      resetSuccess: string
      exportSuccess: string
      importSuccess: string
      importFailed: string
      conflictDetected: string
    }
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