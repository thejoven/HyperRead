// 导出所有 i18n 相关的接口和组件
export type {
  Language,
  Translations,
  LanguageContextType
} from './types'

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY
} from './types'

export {
  LanguageProvider,
  useTranslation,
  useT
} from './context'

export type { SupportedLocale } from './locales'