# HyperRead 快捷键体系设计方案

## 文档元信息
- **版本**: v1.0.0
- **创建日期**: 2025-09-30
- **作者**: AI Assistant
- **状态**: 待审核

---

## 1. 项目概述

### 1.1 需求分析

#### 核心需求
1. **全文搜索功能**: 用户双击 Shift 键在顶部弹出搜索框，支持 Markdown 内容全文搜索
2. **自定义快捷键**: 用户可以在设置中自定义快捷键组合
3. **可扩展性**: 系统需要支持未来添加更多快捷键功能

#### 功能优先级
- **P0 (必须有)**:
  - 快捷键注册和监听系统
  - 双击 Shift 触发搜索功能
  - 基础快捷键配置界面
- **P1 (应该有)**:
  - 快捷键冲突检测
  - 快捷键重置功能
  - 快捷键导出/导入
- **P2 (可以有)**:
  - 快捷键使用统计
  - 快捷键帮助面板

### 1.2 技术栈分析

**当前技术栈**:
- **前端**: React 19.1.0 + TypeScript
- **状态管理**: React Hooks (useState, useEffect, useContext)
- **样式**: Tailwind CSS 4.0
- **桌面**: Electron 38.1.0
- **UI 组件**: 自定义组件基于 Radix UI

**关键文件**:
- `src/electron-app.tsx`: 主应用组件
- `src/components/MarkdownContent.tsx`: Markdown 渲染组件
- `src/components/SettingsModal.tsx`: 设置模态框
- `electron/main.js`: Electron 主进程

---

## 2. 系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     应用层 (Application)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  搜索组件     │  │  设置面板     │  │  其他功能     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────┐
│               核心快捷键管理层 (Core Layer)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         KeyboardShortcutManager (核心管理器)            │  │
│  │  • 快捷键注册与注销                                     │  │
│  │  • 事件监听与分发                                       │  │
│  │  • 配置管理                                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │  快捷键检测器   │  │  冲突检测器     │  │  存储管理器    │  │
│  │  KeyDetector    │  │  ConflictChecker│  │  StorageManager│  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
└───────────────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────┐
│              底层工具层 (Utility Layer)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │  按键规范化     │  │  按键组合验证   │  │  平台兼容性    │  │
│  │  KeyNormalizer  │  │  KeyValidator   │  │  PlatformAdapter│ │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 核心模块设计

#### 2.2.1 KeyboardShortcutManager (核心管理器)

**职责**:
- 管理所有快捷键的生命周期
- 提供统一的 API 供应用层调用
- 协调各个子模块工作

**接口设计**:
```typescript
interface KeyboardShortcutManager {
  // 注册快捷键
  register(action: string, keys: KeyCombination, handler: () => void): void

  // 注销快捷键
  unregister(action: string): void

  // 更新快捷键配置
  updateShortcut(action: string, newKeys: KeyCombination): boolean

  // 获取所有快捷键配置
  getAllShortcuts(): ShortcutConfig[]

  // 重置为默认配置
  resetToDefaults(): void

  // 检测冲突
  detectConflicts(keys: KeyCombination): string[]

  // 启用/禁用快捷键系统
  enable(): void
  disable(): void
}
```

#### 2.2.2 KeyDetector (快捷键检测器)

**职责**:
- 监听键盘事件
- 识别按键组合 (包括双击检测)
- 触发相应的回调函数

**特殊处理**:
- 双击 Shift 检测算法
- 修饰键 (Ctrl, Alt, Shift, Meta) 组合检测
- 防抖处理

#### 2.2.3 StorageManager (存储管理器)

**职责**:
- 持久化快捷键配置
- 从 localStorage 读取配置
- 支持配置导出/导入

**数据结构**:
```typescript
interface ShortcutConfig {
  version: string
  shortcuts: {
    [action: string]: {
      keys: KeyCombination
      description: string
      category: string
      enabled: boolean
      isDefault: boolean
    }
  }
}
```

#### 2.2.4 ConflictChecker (冲突检测器)

**职责**:
- 检测快捷键冲突
- 提供冲突解决建议
- 支持优先级配置

---

## 3. 数据模型设计

### 3.1 按键组合模型

```typescript
/**
 * 按键组合类型
 * 支持单键、组合键、序列键
 */
type KeyCombination =
  | SimpleKey           // 单个按键: "a", "F1"
  | ModifierCombo       // 组合键: "Ctrl+S", "Shift+Alt+T"
  | DoublePress         // 双击: "Shift Shift"
  | KeySequence         // 序列: "g g", "Ctrl+K Ctrl+B"

interface SimpleKey {
  type: 'simple'
  key: string
}

interface ModifierCombo {
  type: 'combo'
  modifiers: Modifier[]
  key: string
}

interface DoublePress {
  type: 'double'
  key: string
  maxInterval: number  // 最大时间间隔 (毫秒)
}

interface KeySequence {
  type: 'sequence'
  keys: (SimpleKey | ModifierCombo)[]
  maxInterval: number  // 序列最大时间间隔
}

type Modifier = 'Ctrl' | 'Alt' | 'Shift' | 'Meta'
```

### 3.2 快捷键动作模型

```typescript
/**
 * 快捷键动作定义
 */
interface ShortcutAction {
  id: string                    // 唯一标识: "search.open"
  name: string                  // 显示名称: "打开搜索"
  description: string           // 描述: "在文档中搜索内容"
  category: ShortcutCategory    // 分类
  defaultKeys: KeyCombination   // 默认快捷键
  handler: () => void | Promise<void>  // 处理函数
  enabled: boolean              // 是否启用
  priority: number              // 优先级 (冲突时使用)
  scope?: 'global' | 'editor' | 'sidebar'  // 作用域
}

type ShortcutCategory =
  | 'navigation'      // 导航
  | 'editing'         // 编辑
  | 'view'           // 视图
  | 'search'         // 搜索
  | 'window'         // 窗口
  | 'system'         // 系统
```

### 3.3 配置存储模型

```typescript
/**
 * 存储在 localStorage 的配置
 */
interface StoredShortcutConfig {
  version: string  // 配置版本: "1.0.0"
  lastModified: string  // ISO 时间戳
  shortcuts: {
    [actionId: string]: {
      keys: KeyCombination
      enabled: boolean
      customized: boolean  // 是否被用户自定义
    }
  }
  preferences: {
    enableGlobal: boolean  // 是否启用全局快捷键
    enableDoublePress: boolean  // 是否启用双击检测
    doublePressInterval: number  // 双击间隔 (毫秒)
    keySequenceInterval: number  // 序列间隔 (毫秒)
  }
}
```

---

## 4. 核心功能实现方案

### 4.1 快捷键监听与触发

#### 4.1.1 基础监听实现

```typescript
class KeyboardListener {
  private pressedKeys = new Set<string>()
  private lastKeyTime = 0
  private lastKey = ''
  private sequenceKeys: string[] = []

  start() {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  stop() {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // 防止在输入框中触发
    if (this.isInputElement(e.target)) return

    // 添加到已按下的键集合
    this.pressedKeys.add(this.normalizeKey(e.key))

    // 检测修饰键
    if (e.ctrlKey) this.pressedKeys.add('Ctrl')
    if (e.altKey) this.pressedKeys.add('Alt')
    if (e.shiftKey) this.pressedKeys.add('Shift')
    if (e.metaKey) this.pressedKeys.add('Meta')

    // 匹配快捷键
    this.matchShortcut()
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    this.pressedKeys.delete(this.normalizeKey(e.key))

    // 清理修饰键
    if (!e.ctrlKey) this.pressedKeys.delete('Ctrl')
    if (!e.altKey) this.pressedKeys.delete('Alt')
    if (!e.shiftKey) this.pressedKeys.delete('Shift')
    if (!e.metaKey) this.pressedKeys.delete('Meta')
  }
}
```

#### 4.1.2 双击检测实现

```typescript
class DoublePressDetector {
  private lastPressTime = 0
  private lastKey = ''
  private maxInterval = 500  // 默认 500ms

  detect(key: string): boolean {
    const now = Date.now()
    const isDouble =
      key === this.lastKey &&
      (now - this.lastPressTime) < this.maxInterval

    this.lastKey = key
    this.lastPressTime = now

    return isDouble
  }

  reset() {
    this.lastKey = ''
    this.lastPressTime = 0
  }
}
```

### 4.2 搜索功能实现

#### 4.2.1 搜索组件设计

```typescript
/**
 * 全文搜索组件
 * 位置: src/components/SearchPanel.tsx
 */
interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
  content: string  // Markdown 内容
  onNavigate: (lineNumber: number) => void
}

interface SearchResult {
  lineNumber: number
  lineContent: string
  matchIndex: number
  matchLength: number
  context: {
    before: string
    after: string
  }
}
```

#### 4.2.2 搜索算法

```typescript
class FullTextSearcher {
  /**
   * 搜索算法特点:
   * 1. 支持正则表达式
   * 2. 支持大小写敏感/不敏感
   * 3. 支持全词匹配
   * 4. 高亮显示匹配结果
   */
  search(content: string, query: string, options: SearchOptions): SearchResult[] {
    const lines = content.split('\n')
    const results: SearchResult[] = []

    const regex = this.buildRegex(query, options)

    lines.forEach((line, index) => {
      let match
      while ((match = regex.exec(line)) !== null) {
        results.push({
          lineNumber: index + 1,
          lineContent: line,
          matchIndex: match.index,
          matchLength: match[0].length,
          context: this.getContext(lines, index)
        })
      }
    })

    return results
  }

  private buildRegex(query: string, options: SearchOptions): RegExp {
    const flags = options.caseSensitive ? 'g' : 'gi'
    const pattern = options.useRegex
      ? query
      : this.escapeRegex(query)

    return new RegExp(
      options.wholeWord ? `\\b${pattern}\\b` : pattern,
      flags
    )
  }
}
```

### 4.3 快捷键配置界面

#### 4.3.1 配置组件结构

```typescript
/**
 * 快捷键配置面板
 * 位置: src/components/ShortcutSettings.tsx
 */
interface ShortcutSettingsProps {
  isOpen: boolean
  onClose: () => void
}

// 组件内部状态
interface ShortcutSettingsState {
  shortcuts: ShortcutAction[]
  selectedAction: string | null
  isRecording: boolean
  recordedKeys: KeyCombination | null
  searchFilter: string
  categoryFilter: ShortcutCategory | 'all'
}
```

#### 4.3.2 按键录制功能

```typescript
class KeyRecorder {
  private recording = false
  private recordedKeys: string[] = []
  private modifiers: Modifier[] = []

  startRecording(callback: (keys: KeyCombination) => void) {
    this.recording = true
    this.recordedKeys = []
    this.modifiers = []

    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // 收集修饰键
      if (e.ctrlKey && !this.modifiers.includes('Ctrl')) {
        this.modifiers.push('Ctrl')
      }
      if (e.altKey && !this.modifiers.includes('Alt')) {
        this.modifiers.push('Alt')
      }
      if (e.shiftKey && !this.modifiers.includes('Shift')) {
        this.modifiers.push('Shift')
      }
      if (e.metaKey && !this.modifiers.includes('Meta')) {
        this.modifiers.push('Meta')
      }

      // 收集主键
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        this.recordedKeys.push(e.key)

        // 生成按键组合
        const combination = this.buildCombination()
        callback(combination)

        this.stopRecording()
      }
    }

    window.addEventListener('keydown', handler)
  }

  stopRecording() {
    this.recording = false
    window.removeEventListener('keydown', this.handler)
  }
}
```

### 4.4 冲突检测与解决

```typescript
class ConflictChecker {
  /**
   * 检测快捷键冲突
   * 返回冲突的动作 ID 列表
   */
  checkConflict(
    newKeys: KeyCombination,
    existingShortcuts: ShortcutAction[]
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = []

    for (const action of existingShortcuts) {
      if (this.isSameKeyCombination(newKeys, action.defaultKeys)) {
        conflicts.push({
          actionId: action.id,
          actionName: action.name,
          keys: action.defaultKeys,
          priority: action.priority
        })
      }
    }

    return conflicts
  }

  /**
   * 自动解决冲突
   * 策略: 优先级低的快捷键自动禁用
   */
  autoResolveConflict(
    conflicts: ConflictInfo[],
    newAction: ShortcutAction
  ): Resolution[] {
    return conflicts.map(conflict => ({
      conflictActionId: conflict.actionId,
      resolution: conflict.priority < newAction.priority
        ? 'disable_conflict'
        : 'disable_new',
      suggestion: this.suggestAlternativeKeys(conflict.keys)
    }))
  }
}
```

---

## 5. 默认快捷键配置

### 5.1 快捷键列表

| 功能 | 默认快捷键 | 分类 | 优先级 | 描述 |
|------|-----------|------|--------|------|
| 打开搜索 | `Shift Shift` (双击) | search | 10 | 在文档中搜索内容 |
| 关闭搜索 | `Esc` | search | 10 | 关闭搜索面板 |
| 下一个搜索结果 | `Enter` / `F3` | search | 8 | 跳转到下一个匹配 |
| 上一个搜索结果 | `Shift+Enter` / `Shift+F3` | search | 8 | 跳转到上一个匹配 |
| 打开文件 | `Ctrl+O` (Win/Linux) / `Cmd+O` (Mac) | navigation | 9 | 打开文件对话框 |
| 打开文件夹 | `Ctrl+Shift+O` / `Cmd+Shift+O` | navigation | 9 | 打开文件夹对话框 |
| 刷新文件列表 | `F5` / `Ctrl+R` / `Cmd+R` | navigation | 7 | 刷新当前文件夹 |
| 放大字体 | `Ctrl+=` / `Cmd+=` | view | 6 | 增大阅读字体 |
| 缩小字体 | `Ctrl+-` / `Cmd+-` | view | 6 | 减小阅读字体 |
| 重置字体 | `Ctrl+0` / `Cmd+0` | view | 6 | 恢复默认字体大小 |
| 切换侧边栏 | `Ctrl+B` / `Cmd+B` | view | 7 | 显示/隐藏文件列表 |
| 切换主题 | `Ctrl+Shift+T` / `Cmd+Shift+T` | view | 5 | 切换亮/暗主题 |
| 打开设置 | `Ctrl+,` / `Cmd+,` | system | 8 | 打开设置面板 |
| 打开关于 | `F1` | system | 5 | 显示关于信息 |
| 切换 AI 助手 | `Ctrl+Shift+A` / `Cmd+Shift+A` | ai | 7 | 显示/隐藏 AI 助手 |
| 全屏/退出全屏 | `F11` / `Ctrl+Cmd+F` (Mac) | window | 6 | 切换全屏模式 |
| 退出应用 | `Ctrl+Q` / `Cmd+Q` | system | 10 | 退出应用程序 |

### 5.2 快捷键优先级说明

- **优先级 10**: 核心功能,不应被覆盖
- **优先级 8-9**: 重要功能,冲突时提示用户
- **优先级 6-7**: 常用功能,可被覆盖
- **优先级 1-5**: 次要功能,自动解决冲突

---

## 6. 实现计划

### 6.1 文件结构

```
src/
├── lib/
│   ├── shortcuts/
│   │   ├── types.ts                    # 类型定义
│   │   ├── manager.ts                  # KeyboardShortcutManager
│   │   ├── detector.ts                 # KeyDetector
│   │   ├── storage.ts                  # StorageManager
│   │   ├── conflict-checker.ts         # ConflictChecker
│   │   ├── key-normalizer.ts           # KeyNormalizer
│   │   ├── key-validator.ts            # KeyValidator
│   │   ├── platform-adapter.ts         # PlatformAdapter
│   │   ├── default-shortcuts.ts        # 默认快捷键配置
│   │   └── index.ts                    # 统一导出
│   └── hooks/
│       └── useKeyboardShortcut.ts      # React Hook
├── components/
│   ├── SearchPanel.tsx                 # 搜索面板组件
│   ├── SearchResultItem.tsx            # 搜索结果项组件
│   ├── ShortcutSettings.tsx            # 快捷键设置组件
│   ├── ShortcutRecorder.tsx            # 按键录制组件
│   └── ShortcutConflictDialog.tsx      # 冲突解决对话框
└── contexts/
    └── ShortcutContext.tsx             # 快捷键上下文

electron/
├── shortcuts/
│   └── global-shortcuts.js             # 全局快捷键 (Electron)
```

### 6.2 开发阶段

#### 阶段一: 基础框架搭建 (3-4天)

**任务清单**:
1. [ ] 创建类型定义文件 (`types.ts`)
2. [ ] 实现按键规范化工具 (`key-normalizer.ts`)
3. [ ] 实现按键验证工具 (`key-validator.ts`)
4. [ ] 实现存储管理器 (`storage.ts`)
5. [ ] 创建默认快捷键配置 (`default-shortcuts.ts`)
6. [ ] 编写单元测试

**验收标准**:
- 所有工具类通过单元测试
- 能够正确序列化/反序列化快捷键配置
- 支持跨平台按键规范化

#### 阶段二: 核心功能实现 (4-5天)

**任务清单**:
1. [ ] 实现快捷键检测器 (`detector.ts`)
   - 基础按键监听
   - 双击检测
   - 组合键检测
2. [ ] 实现冲突检测器 (`conflict-checker.ts`)
3. [ ] 实现核心管理器 (`manager.ts`)
4. [ ] 创建 React Hook (`useKeyboardShortcut.ts`)
5. [ ] 创建全局上下文 (`ShortcutContext.tsx`)
6. [ ] 编写集成测试

**验收标准**:
- 能够正确注册和触发快捷键
- 双击 Shift 功能正常工作
- 快捷键系统可以启用/禁用
- 无内存泄漏

#### 阶段三: 搜索功能实现 (3-4天)

**任务清单**:
1. [ ] 创建搜索面板组件 (`SearchPanel.tsx`)
   - UI 设计与实现
   - 搜索输入框
   - 结果列表
   - 导航控制
2. [ ] 实现搜索算法
   - 全文搜索
   - 正则表达式支持
   - 大小写敏感选项
3. [ ] 实现搜索结果高亮
4. [ ] 集成到主应用 (`electron-app.tsx`)
5. [ ] 优化性能 (大文件搜索)

**验收标准**:
- 双击 Shift 正确弹出搜索框
- 搜索结果准确
- 支持键盘导航
- 大文件 (>1MB) 搜索流畅

#### 阶段四: 设置界面实现 (3-4天)

**任务清单**:
1. [ ] 创建快捷键设置面板 (`ShortcutSettings.tsx`)
   - 快捷键列表展示
   - 分类筛选
   - 搜索功能
2. [ ] 实现按键录制组件 (`ShortcutRecorder.tsx`)
3. [ ] 实现冲突解决对话框 (`ShortcutConflictDialog.tsx`)
4. [ ] 集成到设置模态框 (`SettingsModal.tsx`)
5. [ ] 添加导出/导入功能
6. [ ] 添加重置功能

**验收标准**:
- 用户可以查看所有快捷键
- 用户可以自定义任意快捷键
- 冲突检测正常工作
- 配置可以持久化保存

#### 阶段五: 测试与优化 (2-3天)

**任务清单**:
1. [ ] 编写端到端测试
2. [ ] 跨平台测试 (Mac, Windows, Linux)
3. [ ] 性能优化
   - 减少事件监听开销
   - 优化搜索算法
4. [ ] 用户体验优化
   - 添加动画效果
   - 改进错误提示
5. [ ] 文档完善
   - API 文档
   - 用户手册
6. [ ] 代码审查与重构

**验收标准**:
- 所有测试通过
- 无已知 bug
- 性能达标 (搜索延迟 < 100ms)
- 文档完整

#### 阶段六: 国际化与发布 (1-2天)

**任务清单**:
1. [ ] 添加国际化支持
   - 中文翻译
   - 英文翻译
2. [ ] 准备发布说明
3. [ ] 版本更新 (v2.1.0)
4. [ ] 创建发布 PR

---

## 7. 技术细节

### 7.1 平台适配

#### macOS
```typescript
// 使用 Cmd 代替 Ctrl
const isMac = platform === 'darwin'
const modifierKey = isMac ? 'Meta' : 'Ctrl'

// 快捷键显示
const displayKey = isMac ? '⌘' : 'Ctrl'
```

#### Windows/Linux
```typescript
// 使用 Ctrl
const modifierKey = 'Ctrl'
```

#### 按键映射
```typescript
const keyMap: Record<string, string> = {
  // macOS 特殊键
  'Meta': isMac ? '⌘' : 'Win',
  'Alt': isMac ? '⌥' : 'Alt',
  'Shift': isMac ? '⇧' : 'Shift',
  'Control': isMac ? '⌃' : 'Ctrl',

  // 功能键
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'Enter': '↵',
  'Backspace': '⌫',
  'Delete': isMac ? '⌦' : 'Del',
  'Escape': 'Esc',
  'Tab': '⇥',
  'Space': '␣',
}
```

### 7.2 性能优化

#### 事件节流
```typescript
class ThrottledListener {
  private lastTrigger = 0
  private throttleMs = 16  // ~60 FPS

  onKeyDown(e: KeyboardEvent) {
    const now = Date.now()
    if (now - this.lastTrigger < this.throttleMs) {
      return  // 跳过过于频繁的事件
    }
    this.lastTrigger = now

    // 处理按键事件
    this.processKey(e)
  }
}
```

#### 搜索优化
```typescript
class OptimizedSearcher {
  // 使用 Web Worker 处理大文件搜索
  searchInWorker(content: string, query: string): Promise<SearchResult[]> {
    return new Promise((resolve) => {
      const worker = new Worker('./search-worker.js')

      worker.postMessage({ content, query })

      worker.onmessage = (e) => {
        resolve(e.data.results)
        worker.terminate()
      }
    })
  }

  // 增量搜索 (输入时实时搜索)
  incrementalSearch = debounce((query: string) => {
    this.search(query)
  }, 300)
}
```

### 7.3 安全考虑

#### 防止快捷键劫持
```typescript
class SecureShortcutManager {
  // 白名单机制
  private allowedKeys = new Set([
    'F1', 'F2', 'F3', 'F5', 'F11',
    // ... 其他安全按键
  ])

  // 黑名单机制 (禁止覆盖系统快捷键)
  private blockedKeys = new Set([
    'Ctrl+Alt+Delete',  // Windows 安全桌面
    'Cmd+Q',            // macOS 退出 (可配置)
    'Cmd+W',            // 关闭窗口
    // ... 其他系统快捷键
  ])

  validateKeyCombination(keys: KeyCombination): boolean {
    const keyString = this.stringifyKeys(keys)

    if (this.blockedKeys.has(keyString)) {
      throw new Error(`快捷键 ${keyString} 被系统保留,无法使用`)
    }

    return true
  }
}
```

---

## 8. 用户体验设计

### 8.1 搜索面板 UI 设计

```
┌─────────────────────────────────────────────────────────┐
│  🔍 在文档中搜索...                               ✕       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │  搜索内容                                   [Aa] │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ☑ 大小写敏感  ☐ 正则表达式  ☐ 全词匹配               │
│                                                          │
│  📄 3 个结果                                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │  1️⃣  第 12 行: ... 这是包含 搜索 的内容 ...        │    │
│  │  2️⃣  第 45 行: ... 另一个 搜索 结果 ...            │    │
│  │  3️⃣  第 78 行: ... 第三个 搜索 匹配项 ...          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Enter] 下一个  [Shift+Enter] 上一个  [Esc] 关闭      │
└─────────────────────────────────────────────────────────┘
```

### 8.2 快捷键设置 UI 设计

```
┌─────────────────────────────────────────────────────────┐
│  ⌨️  快捷键设置                                           │
├─────────────────────────────────────────────────────────┤
│  🔍 搜索快捷键...                                         │
│                                                          │
│  分类: [全部 ▾] [搜索] [导航] [视图] [系统]              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  📋 搜索                                          │    │
│  │  ┌─────────────────────────────────────────┐     │    │
│  │  │  打开搜索        Shift Shift      [编辑] │     │    │
│  │  │  关闭搜索        Esc               [编辑] │     │    │
│  │  │  下一个结果      Enter / F3        [编辑] │     │    │
│  │  └─────────────────────────────────────────┘     │    │
│  │                                                   │    │
│  │  🧭 导航                                          │    │
│  │  ┌─────────────────────────────────────────┐     │    │
│  │  │  打开文件        Ctrl+O            [编辑] │     │    │
│  │  │  打开文件夹      Ctrl+Shift+O      [编辑] │     │    │
│  │  └─────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [重置为默认]  [导出配置]  [导入配置]                    │
└─────────────────────────────────────────────────────────┘
```

### 8.3 按键录制 UI

```
┌─────────────────────────────────────────────────────────┐
│  ⌨️  录制快捷键                                           │
├─────────────────────────────────────────────────────────┤
│  正在录制快捷键: 打开搜索                                 │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │          请按下您想设置的快捷键组合                │    │
│  │                                                  │    │
│  │               ⌨️  Shift Shift                    │    │
│  │                                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ⚠️  此快捷键已被以下功能使用:                            │
│  • 打开搜索 (当前功能)                                    │
│                                                          │
│  [ 取消 ]                          [ 确认并覆盖 ]         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. 测试策略

### 9.1 单元测试

```typescript
// lib/shortcuts/__tests__/detector.test.ts
describe('KeyDetector', () => {
  test('should detect simple key press', () => {
    const detector = new KeyDetector()
    const handler = jest.fn()

    detector.register({ type: 'simple', key: 'a' }, handler)

    // 模拟按键事件
    fireKeyEvent('keydown', { key: 'a' })

    expect(handler).toHaveBeenCalled()
  })

  test('should detect double press', () => {
    const detector = new KeyDetector()
    const handler = jest.fn()

    detector.register(
      { type: 'double', key: 'Shift', maxInterval: 500 },
      handler
    )

    // 模拟双击
    fireKeyEvent('keydown', { key: 'Shift' })
    fireKeyEvent('keyup', { key: 'Shift' })

    setTimeout(() => {
      fireKeyEvent('keydown', { key: 'Shift' })
      fireKeyEvent('keyup', { key: 'Shift' })

      expect(handler).toHaveBeenCalled()
    }, 200)
  })

  test('should detect key combination', () => {
    const detector = new KeyDetector()
    const handler = jest.fn()

    detector.register(
      { type: 'combo', modifiers: ['Ctrl'], key: 's' },
      handler
    )

    fireKeyEvent('keydown', { key: 'Control', ctrlKey: true })
    fireKeyEvent('keydown', { key: 's', ctrlKey: true })

    expect(handler).toHaveBeenCalled()
  })
})
```

### 9.2 集成测试

```typescript
// __tests__/shortcuts-integration.test.tsx
describe('Keyboard Shortcuts Integration', () => {
  test('double shift should open search panel', async () => {
    const { getByPlaceholder } = render(<App />)

    // 模拟双击 Shift
    await userEvent.keyboard('{Shift>}{/Shift}')
    await waitFor(() => {
      // 等待 200ms
    }, { timeout: 200 })
    await userEvent.keyboard('{Shift>}{/Shift}')

    // 验证搜索面板打开
    expect(getByPlaceholder('在文档中搜索...')).toBeInTheDocument()
  })

  test('Esc should close search panel', async () => {
    const { getByPlaceholder, queryByPlaceholder } = render(<App />)

    // 打开搜索面板
    await openSearchPanel()

    expect(getByPlaceholder('在文档中搜索...')).toBeInTheDocument()

    // 按 Esc
    await userEvent.keyboard('{Escape}')

    // 验证搜索面板关闭
    expect(queryByPlaceholder('在文档中搜索...')).not.toBeInTheDocument()
  })
})
```

### 9.3 端到端测试

```typescript
// e2e/shortcuts.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Keyboard Shortcuts', () => {
  test('should search content with double shift', async ({ page }) => {
    await page.goto('/')

    // 加载测试文档
    await page.click('text=打开文件')
    await page.setInputFiles('input[type="file"]', 'test.md')

    // 双击 Shift
    await page.keyboard.press('Shift')
    await page.keyboard.up('Shift')
    await page.waitForTimeout(200)
    await page.keyboard.press('Shift')

    // 验证搜索面板出现
    await expect(page.locator('[placeholder*="搜索"]')).toBeVisible()

    // 输入搜索内容
    await page.fill('[placeholder*="搜索"]', 'test')

    // 验证搜索结果
    await expect(page.locator('.search-result')).toHaveCount(3)
  })
})
```

---

## 10. 风险评估与应对

### 10.1 技术风险

| 风险 | 影响 | 概率 | 应对策略 |
|------|------|------|----------|
| 浏览器兼容性问题 | 高 | 中 | 使用标准 Web API,添加 polyfill |
| 性能问题 (大文件搜索) | 中 | 高 | 使用 Web Worker,增量搜索 |
| 快捷键冲突 | 中 | 中 | 完善冲突检测机制,提供用户自定义 |
| 内存泄漏 | 高 | 低 | 严格的事件监听器管理,及时清理 |
| 双击检测不准确 | 中 | 中 | 可调节时间间隔,提供手动调整选项 |

### 10.2 用户体验风险

| 风险 | 影响 | 概率 | 应对策略 |
|------|------|------|----------|
| 快捷键学习成本高 | 中 | 高 | 提供快捷键帮助面板,合理的默认配置 |
| 搜索结果不准确 | 高 | 中 | 优化搜索算法,提供搜索选项 |
| 配置界面复杂 | 中 | 中 | 简化 UI,提供预设配置 |
| 误触发快捷键 | 低 | 中 | 在输入框中禁用快捷键 |

---

## 11. 后续扩展计划

### 11.1 短期扩展 (v2.2)

1. **快捷键帮助面板**
   - 显示所有可用快捷键
   - 搜索快捷键
   - 打印快捷键列表

2. **全局快捷键** (Electron)
   - 支持应用失焦时触发
   - 例如: 全局搜索快捷键

3. **快捷键宏**
   - 录制一系列操作
   - 绑定到单个快捷键

### 11.2 中期扩展 (v2.3)

1. **快捷键主题**
   - VSCode 风格
   - Vim 风格
   - Emacs 风格

2. **快捷键统计**
   - 使用频率统计
   - 推荐优化建议

3. **语音快捷键**
   - 语音命令触发功能
   - "打开搜索"等语音指令

### 11.3 长期扩展 (v3.0)

1. **AI 辅助快捷键配置**
   - 根据使用习惯推荐快捷键
   - 自动解决冲突

2. **云同步快捷键配置**
   - 跨设备同步
   - 团队共享配置

3. **可视化快捷键编辑器**
   - 拖拽式配置界面
   - 快捷键冲突可视化

---

## 12. 性能指标

### 12.1 目标指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 快捷键响应时间 | < 50ms | Performance API |
| 双击检测准确率 | > 95% | 用户测试 |
| 搜索延迟 (小文件 < 100KB) | < 100ms | Performance API |
| 搜索延迟 (大文件 < 10MB) | < 500ms | Performance API |
| 内存占用增长 | < 10MB | Chrome DevTools |
| 快捷键冲突检测时间 | < 10ms | Performance API |

### 12.2 性能测试用例

```typescript
// 性能测试
describe('Performance Tests', () => {
  test('shortcut trigger latency < 50ms', async () => {
    const manager = new KeyboardShortcutManager()
    const handler = jest.fn()

    manager.register('test', { type: 'simple', key: 'a' }, handler)

    const start = performance.now()
    fireKeyEvent('keydown', { key: 'a' })
    const end = performance.now()

    expect(end - start).toBeLessThan(50)
  })

  test('search in 1MB file < 500ms', async () => {
    const content = generateLargeContent(1024 * 1024) // 1MB
    const searcher = new FullTextSearcher()

    const start = performance.now()
    const results = searcher.search(content, 'test', {})
    const end = performance.now()

    expect(end - start).toBeLessThan(500)
  })
})
```

---

## 13. 文档与培训

### 13.1 用户文档

1. **快速入门指南**
   - 如何使用双击 Shift 打开搜索
   - 常用快捷键列表
   - 如何自定义快捷键

2. **详细用户手册**
   - 所有快捷键功能说明
   - 快捷键配置指南
   - 常见问题解答

3. **视频教程**
   - 搜索功能演示
   - 快捷键配置教程

### 13.2 开发者文档

1. **API 文档**
   - `KeyboardShortcutManager` API
   - `useKeyboardShortcut` Hook
   - 扩展开发指南

2. **架构文档**
   - 系统设计文档 (本文档)
   - 模块交互图
   - 数据流图

3. **贡献指南**
   - 代码规范
   - 测试要求
   - PR 流程

---

## 14. 总结

本设计方案提供了一个完整、可扩展、高性能的快捷键系统,具有以下特点:

### 核心优势

1. **模块化设计**: 各模块职责清晰,易于维护和扩展
2. **类型安全**: 完整的 TypeScript 类型定义
3. **高性能**: 优化的事件处理和搜索算法
4. **用户友好**: 直观的配置界面,合理的默认配置
5. **跨平台**: 完善的平台适配机制
6. **可测试**: 清晰的测试策略和用例

### 技术亮点

1. **双击检测算法**: 准确识别双击 Shift
2. **冲突检测机制**: 自动检测并解决快捷键冲突
3. **增量搜索**: 实时搜索,无需等待
4. **Web Worker**: 大文件搜索不阻塞 UI
5. **持久化配置**: 配置自动保存,支持导出/导入

### 实现路径

- **总工期**: 约 3 周
- **人力**: 1-2 名前端工程师
- **风险**: 可控,有明确的应对策略
- **扩展性**: 易于添加新功能

---

## 附录

### A. 参考资料

1. [Web Keyboard Event API](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
2. [Electron Keyboard Shortcuts](https://www.electronjs.org/docs/latest/api/accelerator)
3. [VSCode Keybindings](https://code.visualstudio.com/docs/getstarted/keybindings)
4. [React Event Handling](https://react.dev/learn/responding-to-events)

### B. 术语表

| 术语 | 定义 |
|------|------|
| 快捷键 (Shortcut) | 用于触发特定功能的按键组合 |
| 修饰键 (Modifier) | Ctrl, Alt, Shift, Meta 等辅助按键 |
| 组合键 (Combination) | 修饰键 + 主键的组合 |
| 双击 (Double Press) | 在短时间内连续按两次同一个键 |
| 序列键 (Sequence) | 连续按多个不同的键 |
| 冲突 (Conflict) | 多个功能使用相同的快捷键 |
| 优先级 (Priority) | 快捷键的重要程度,用于解决冲突 |
| 作用域 (Scope) | 快捷键生效的范围 (全局/编辑器/侧边栏等) |

### C. 变更历史

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| v1.0.0 | 2025-09-30 | AI Assistant | 初始版本 |

---

**文档结束**

请仔细审阅本设计方案。如有任何问题或需要调整的地方,请及时反馈。确认无误后,我们即可开始开发工作。