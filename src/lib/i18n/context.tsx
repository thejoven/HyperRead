'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  LanguageContextType,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  Translations
} from './types'
import { locales, SupportedLocale } from './locales'

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 工具函数：获取嵌套对象的值
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path
  }, obj)
}

// 工具函数：字符串插值
function interpolate(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LANGUAGE)
  const [translations, setTranslations] = useState<Translations>(locales[DEFAULT_LANGUAGE as SupportedLocale])

  // 初始化语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage && locales[savedLanguage as SupportedLocale]) {
      setCurrentLanguage(savedLanguage)
      setTranslations(locales[savedLanguage as SupportedLocale])
    }
  }, [])

  // 翻译函数
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations, key)
    return params ? interpolate(translation, params) : translation
  }

  // 切换语言函数
  const changeLanguage = (locale: string) => {
    if (locales[locale as SupportedLocale]) {
      setCurrentLanguage(locale)
      setTranslations(locales[locale as SupportedLocale])
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
    } else {
      console.warn(`Language '${locale}' is not supported`)
    }
  }

  const contextValue: LanguageContextType = {
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    translations,
    t,
    changeLanguage
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

// 自定义 Hook
export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}

// 简化的翻译 Hook，只返回 t 函数
export function useT() {
  const { t } = useTranslation()
  return t
}