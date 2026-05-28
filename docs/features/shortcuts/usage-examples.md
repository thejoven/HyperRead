# Keyboard Shortcuts Infrastructure - Usage Examples

## Basic Usage Examples

### 1. Validate a Key Combination

```typescript
import { validateKeyCombination } from '@/lib/shortcuts'

// Validate a simple key
const result1 = validateKeyCombination({
  type: 'simple',
  key: 'Escape'
})
console.log(result1.valid) // true

// Validate a combo key
const result2 = validateKeyCombination({
  type: 'combo',
  modifiers: ['Ctrl'],
  key: 'S'
})
console.log(result2.valid) // true

// Invalid: letter without modifier
const result3 = validateKeyCombination({
  type: 'simple',
  key: 'A'
})
console.log(result3.valid) // false
console.log(result3.error) // "Key 'A' must be used with modifier keys..."

// System shortcut (blocked)
const result4 = validateKeyCombination({
  type: 'combo',
  modifiers: ['Ctrl', 'Alt'],
  key: 'Delete'
})
console.log(result4.valid) // false on Windows
```

### 2. Display Key Combinations

```typescript
import { keysToDisplayString, getKeyDisplay } from '@/lib/shortcuts'

// Format for display
const display1 = keysToDisplayString(['Meta'], 'S')
// On Mac: "⌘S"
// On Windows: "Win+S"

const display2 = keysToDisplayString(['Ctrl', 'Shift'], 'F')
// On Mac: "⌃⇧F"
// On Windows: "Ctrl+Shift+F"

// Single keys
console.log(getKeyDisplay('ArrowUp'))    // "↑"
console.log(getKeyDisplay('Enter'))      // "↵" on Mac, "Enter" on Windows
console.log(getKeyDisplay('Backspace'))  // "⌫" on Mac, "Backspace" on Windows
```

### 3. Platform Detection

```typescript
import { getPlatform, isMac, getPrimaryModifier } from '@/lib/shortcuts'

console.log(getPlatform())        // "darwin" | "win32" | "linux"
console.log(isMac())              // true on macOS
console.log(getPrimaryModifier()) // "Meta" on Mac, "Ctrl" elsewhere
```

### 4. Key Normalization

```typescript
import { normalizeKey, isModifierKey } from '@/lib/shortcuts'

console.log(normalizeKey('Control'))  // "Ctrl"
console.log(normalizeKey('command'))  // "Meta"
console.log(normalizeKey(' '))        // "Space"
console.log(normalizeKey('a'))        // "A" (uppercase)

console.log(isModifierKey('Ctrl'))    // true
console.log(isModifierKey('A'))       // false
```

### 5. Storage Operations

```typescript
import {
  createDefaultConfig,
  saveConfig,
  loadConfig,
  updateShortcut,
  exportConfig,
  importConfig
} from '@/lib/shortcuts'

// Create new config
const config = createDefaultConfig()

// Update a shortcut
const updated = updateShortcut('search.open', {
  type: 'combo',
  modifiers: ['Ctrl', 'Shift'],
  key: 'F'
})

// Load from storage
const loaded = loadConfig()
if (loaded) {
  console.log('Loaded config version:', loaded.version)
  console.log('Last modified:', loaded.lastModified)
}

// Export to JSON
const json = exportConfig('2.0.0')
console.log(json)

// Import from JSON
const success = importConfig(json)
console.log('Import successful:', success)
```

### 6. Working with Default Shortcuts

```typescript
import {
  DEFAULT_SHORTCUTS,
  getShortcutsByCategory,
  getShortcutById,
  getCategories,
  getAllPlatformShortcuts
} from '@/lib/shortcuts'

// Get all shortcuts
console.log('Total shortcuts:', DEFAULT_SHORTCUTS.length)

// Get by category
const searchShortcuts = getShortcutsByCategory('search')
console.log('Search shortcuts:', searchShortcuts.length)

// Get by ID
const openSearch = getShortcutById('search.open')
if (openSearch) {
  console.log('Name:', openSearch.name)
  console.log('Description:', openSearch.description)
  console.log('Priority:', openSearch.priority)
}

// Get all categories
const categories = getCategories()
categories.forEach(cat => {
  console.log(`${cat.category}: ${cat.count} shortcuts`)
})

// Get platform-adjusted shortcuts
const platformShortcuts = getAllPlatformShortcuts()
// Automatically converts Ctrl to Meta on macOS
```

## Advanced Usage Examples

### 7. Custom Validation with Suggestions

```typescript
import { validateKeyCombination, suggestAlternative } from '@/lib/shortcuts'

const keys = { type: 'simple', key: 'A' } as const

const result = validateKeyCombination(keys)
if (!result.valid) {
  const alternative = suggestAlternative(keys)
  if (alternative) {
    console.log('Suggested alternative:', alternative)
    // { type: 'combo', modifiers: ['Ctrl'], key: 'A' }
  }
}
```

### 8. Export to File

```typescript
import { exportToFile } from '@/lib/shortcuts'

// Trigger browser download
exportToFile('2.0.0', 'my-shortcuts.json')
```

### 9. Import from File

```typescript
import { importFromFile } from '@/lib/shortcuts'

// Handle file input
const fileInput = document.querySelector('input[type="file"]')
fileInput?.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const success = await importFromFile(file)
    if (success) {
      console.log('Shortcuts imported successfully')
    }
  }
})
```

### 10. Merge Configurations

```typescript
import { loadConfig, mergeConfigs, saveConfig } from '@/lib/shortcuts'

const current = loadConfig()
const imported = /* ... load from somewhere ... */

if (current && imported) {
  const merged = mergeConfigs(current, imported)
  saveConfig(merged)
}
```

### 11. Check for System Shortcuts

```typescript
import { isSystemShortcut, getBlockedShortcuts } from '@/lib/shortcuts'

const keys = {
  type: 'combo',
  modifiers: ['Ctrl', 'Alt'],
  key: 'Delete'
} as const

console.log('Is system shortcut:', isSystemShortcut(keys))

// Get all blocked shortcuts for current platform
const blocked = getBlockedShortcuts()
console.log('Blocked shortcuts:', blocked)
// ["Ctrl+Alt+Delete", "Alt+F4", "Alt+Tab", ...]
```

### 12. Platform-Specific Conversion

```typescript
import { convertKeysForPlatform } from '@/lib/shortcuts'

// Convert Windows shortcut to Mac
const { modifiers, key } = convertKeysForPlatform(
  ['Ctrl'],
  'S',
  'darwin'
)
console.log(modifiers) // ['Meta']
console.log(key)       // 'S'
```

## Integration Examples

### React Component Example

```typescript
import { useState, useEffect } from 'react'
import {
  DEFAULT_SHORTCUTS,
  keysToDisplayString,
  validateKeyCombination,
  updateShortcut,
  type KeyCombination
} from '@/lib/shortcuts'

function ShortcutSettings() {
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS)

  const handleUpdateShortcut = (id: string, keys: KeyCombination) => {
    const result = validateKeyCombination(keys)
    
    if (!result.valid) {
      alert(result.error)
      return
    }

    const updated = updateShortcut(id, keys)
    if (updated) {
      // Reload shortcuts
      setShortcuts(DEFAULT_SHORTCUTS)
    }
  }

  return (
    <div>
      {shortcuts.map(shortcut => (
        <div key={shortcut.id}>
          <span>{shortcut.name}</span>
          <span>
            {shortcut.defaultKeys.type === 'combo' &&
              keysToDisplayString(
                shortcut.defaultKeys.modifiers,
                shortcut.defaultKeys.key
              )
            }
          </span>
        </div>
      ))}
    </div>
  )
}
```

### Search Panel Integration Example

```typescript
import { DEFAULT_SHORTCUTS, getShortcutById } from '@/lib/shortcuts'

function SearchPanel() {
  const openShortcut = getShortcutById('search.open')
  const closeShortcut = getShortcutById('search.close')

  return (
    <div>
      <p>
        Press {/* display openShortcut keys */} to open search
      </p>
      <p>
        Press {/* display closeShortcut keys */} to close
      </p>
    </div>
  )
}
```

## TypeScript Type Examples

### Define Custom Shortcuts

```typescript
import type { ShortcutAction, KeyCombination } from '@/lib/shortcuts'

const customShortcut: ShortcutAction = {
  id: 'custom.action',
  name: 'Custom Action',
  description: 'A custom keyboard shortcut',
  category: 'editing',
  defaultKeys: {
    type: 'combo',
    modifiers: ['Ctrl', 'Shift'],
    key: 'X'
  },
  handler: async () => {
    console.log('Custom action triggered')
  },
  enabled: true,
  priority: 5,
  customizable: true
}
```

### Type Guards

```typescript
import type { KeyCombination } from '@/lib/shortcuts'

function isComboKey(keys: KeyCombination): keys is { type: 'combo', modifiers: string[], key: string } {
  return keys.type === 'combo'
}

function isDoublePress(keys: KeyCombination): keys is { type: 'double', key: string, maxInterval: number } {
  return keys.type === 'double'
}

const keys: KeyCombination = /* ... */

if (isComboKey(keys)) {
  console.log('Modifiers:', keys.modifiers)
  console.log('Key:', keys.key)
}
```
