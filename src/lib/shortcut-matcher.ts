const modifierAliases: Record<string, 'ctrl' | 'cmd' | 'shift' | 'alt'> = {
  control: 'ctrl',
  ctrl: 'ctrl',
  command: 'cmd',
  cmd: 'cmd',
  meta: 'cmd',
  shift: 'shift',
  option: 'alt',
  alt: 'alt',
}

const keyAliases: Record<string, string> = {
  control: 'ctrl',
  ctrl: 'ctrl',
  command: 'cmd',
  cmd: 'cmd',
  meta: 'cmd',
  esc: 'escape',
  return: 'enter',
  spacebar: 'space',
  ' ': 'space',
  arrowleft: 'arrowleft',
  left: 'arrowleft',
  arrowright: 'arrowright',
  right: 'arrowright',
  arrowup: 'arrowup',
  up: 'arrowup',
  arrowdown: 'arrowdown',
  down: 'arrowdown',
  pageup: 'pageup',
  pagedown: 'pagedown',
  plus: '+',
}

interface ParsedShortcutCombo {
  modifiers: Set<'ctrl' | 'cmd' | 'shift' | 'alt'>
  key: string
}

function normalizeKeyName(key: string): string {
  if (key === ' ') return 'space'
  const normalized = key.trim().toLowerCase()
  return keyAliases[normalized] ?? normalized
}

function parseShortcutCombo(shortcutKey: string): ParsedShortcutCombo | null {
  if (!shortcutKey.includes('+')) return null

  const parts = shortcutKey.toLowerCase().split('+')
  if (parts.length < 2) return null

  const mainKeyRaw = parts[parts.length - 1]
  const mainKey = mainKeyRaw === '' ? '+' : normalizeKeyName(mainKeyRaw)
  const modifiers = new Set<'ctrl' | 'cmd' | 'shift' | 'alt'>()

  for (const part of parts.slice(0, -1)) {
    const modifier = modifierAliases[part.trim()]
    if (modifier) modifiers.add(modifier)
  }

  return {
    modifiers,
    key: mainKey,
  }
}

function eventKeyMatches(event: KeyboardEvent, expectedKey: string): boolean {
  const eventKey = normalizeKeyName(event.key)
  return eventKey === expectedKey
}

function eventModifiersMatch(
  event: KeyboardEvent,
  modifiers: Set<'ctrl' | 'cmd' | 'shift' | 'alt'>
): boolean {
  return (
    event.ctrlKey === modifiers.has('ctrl') &&
    event.metaKey === modifiers.has('cmd') &&
    event.shiftKey === modifiers.has('shift') &&
    event.altKey === modifiers.has('alt')
  )
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  const editableElement = target.closest('input, textarea, select, [contenteditable="true"]')
  return Boolean(editableElement)
}

export function getDoublePressShortcutKey(shortcutKey: string): string | null {
  if (shortcutKey.includes('+')) return null

  const keys = shortcutKey
    .trim()
    .split(/\s+/)
    .map(normalizeKeyName)
    .filter(Boolean)

  if (keys.length !== 2 || keys[0] !== keys[1]) return null
  return keys[0]
}

export function keyboardEventMatchesKey(event: KeyboardEvent, key: string): boolean {
  return eventKeyMatches(event, normalizeKeyName(key))
}

export function keyboardEventMatchesShortcut(event: KeyboardEvent, shortcutKey: string): boolean {
  if (getDoublePressShortcutKey(shortcutKey)) return false

  const combo = parseShortcutCombo(shortcutKey)
  if (combo) {
    return eventKeyMatches(event, combo.key) && eventModifiersMatch(event, combo.modifiers)
  }

  const normalizedKey = normalizeKeyName(shortcutKey)
  const hasNoModifiers = !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
  return hasNoModifiers && eventKeyMatches(event, normalizedKey)
}

export function keyboardEventMatchesAnyShortcut(event: KeyboardEvent, shortcutKeys: string[]): boolean {
  return shortcutKeys.some((shortcutKey) => keyboardEventMatchesShortcut(event, shortcutKey))
}

export function isShortcutRecorderActive(): boolean {
  return Boolean(document.querySelector('[data-shortcut-recorder="true"]'))
}
