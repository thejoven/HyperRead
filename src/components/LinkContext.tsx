'use client'

import { createContext, useContext } from 'react'

const LinkContext = createContext<boolean>(false)

export const LinkProvider = LinkContext.Provider
export const useLinkContext = () => useContext(LinkContext)