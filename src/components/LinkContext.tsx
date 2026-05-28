'use client'

import { createContext, use } from 'react'

const LinkContext = createContext<boolean>(false)

export const LinkProvider = LinkContext.Provider
export const useLinkContext = () => use(LinkContext)