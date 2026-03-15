/**
 * AI Assistant Plugin v2.0 for HyperRead
 *
 * Demonstrates npm dependency usage in plugins:
 *   - `marked` (bundled via esbuild) for markdown rendering in AI responses
 *
 * UI features:
 *   - Full markdown rendering with code blocks
 *   - Typewriter streaming effect
 *   - Auto-resizing textarea input
 *   - Copy button on messages
 *   - No close button (sidebar is collapsed via RightSidebar's ‹ button)
 *   - Role selector bottom pill
 *   - Beautiful welcome screen
 */

import { marked } from 'marked'

// ─── Marked configuration ──────────────────────────────────────────────────

marked.use({
  breaks: true,
  gfm: true,
  renderer: {
    code(code, lang) {
      const language = (lang || 'text').trim()
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<div class="ai-code-block" data-lang="${language}">
        <div class="ai-code-header">
          <span class="ai-code-lang">${language}</span>
          <button class="ai-code-copy" title="复制代码" onclick="(function(btn){
            const code = btn.closest('.ai-code-block').querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(()=>{
              btn.innerHTML='${ICON_CHECK}';
              setTimeout(()=>{btn.innerHTML='${ICON_COPY}'},1500);
            });
          })(this)">${ICON_COPY}</button>
        </div>
        <pre><code class="ai-code language-${language}">${escaped}</code></pre>
      </div>`
    },
    codespan(code) {
      return `<code class="ai-inline-code">${code}</code>`
    }
  }
})

// ─── SVG icons ─────────────────────────────────────────────────────────────

const ICON_COPY = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
const ICON_CHECK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
const ICON_TRASH = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`
const ICON_SEND = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
const ICON_BOT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`
const ICON_USER = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const ICON_CHEVRON = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`

// ─── Injected CSS ───────────────────────────────────────────────────────────

const PLUGIN_STYLES = `
.ai-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-size: 13px;
  font-family: inherit;
  background: var(--background);
  color: var(--foreground);
}

/* Header */
.ai-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  min-height: 40px;
}
.ai-header-title {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--foreground);
}
.ai-header-sub {
  font-size: 10px;
  font-weight: 400;
  color: var(--muted-foreground);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ai-icon-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.ai-icon-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}

/* Status bar */
.ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 10px;
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ai-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}
.ai-status-dot.error { background: #ef4444; }

/* Message area */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  scroll-behavior: smooth;
}
.ai-messages::-webkit-scrollbar { width: 4px; }
.ai-messages::-webkit-scrollbar-track { background: transparent; }
.ai-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Message rows */
.ai-msg-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  animation: ai-msg-in 0.2s ease;
}
.ai-msg-row.user { justify-content: flex-end; }
@keyframes ai-msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Avatars */
.ai-avatar {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.ai-avatar.bot {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
}
.ai-avatar.user {
  background: var(--muted);
  color: var(--muted-foreground);
}

/* Bubbles */
.ai-bubble-wrap {
  max-width: 88%;
  display: flex;
  flex-direction: column;
}
.ai-bubble {
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 12.5px;
  line-height: 1.6;
  word-break: break-word;
  position: relative;
}
.ai-msg-row.user .ai-bubble {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: 12px 12px 3px 12px;
}
.ai-msg-row.bot .ai-bubble {
  background: color-mix(in srgb, var(--muted) 60%, transparent);
  border: 1px solid var(--border);
  color: var(--foreground);
  border-radius: 12px 12px 12px 3px;
}

/* Bubble actions */
.ai-bubble-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  height: 18px;
}
.ai-msg-row:hover .ai-bubble-actions { opacity: 1; }
.ai-msg-row.user .ai-bubble-actions { justify-content: flex-end; }
.ai-bubble-action-btn {
  padding: 2px 6px;
  font-size: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: background 0.1s, color 0.1s;
}
.ai-bubble-action-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}

/* Timestamp */
.ai-meta {
  font-size: 10px;
  color: var(--muted-foreground);
  margin-top: 3px;
  padding: 0 2px;
}
.ai-msg-row.user .ai-meta { text-align: right; }

/* Markdown inside bot bubbles */
.ai-bubble p { margin: 0 0 8px; }
.ai-bubble p:last-child { margin-bottom: 0; }
.ai-bubble h1,.ai-bubble h2,.ai-bubble h3,.ai-bubble h4 {
  margin: 10px 0 6px;
  font-weight: 600;
  line-height: 1.3;
}
.ai-bubble h1 { font-size: 15px; }
.ai-bubble h2 { font-size: 14px; }
.ai-bubble h3,.ai-bubble h4 { font-size: 13px; }
.ai-bubble ul,.ai-bubble ol { margin: 4px 0 8px; padding-left: 18px; }
.ai-bubble li { margin-bottom: 3px; }
.ai-bubble blockquote {
  border-left: 3px solid var(--border);
  margin: 6px 0;
  padding: 4px 10px;
  color: var(--muted-foreground);
}
.ai-bubble strong { font-weight: 600; }
.ai-bubble em { font-style: italic; }
.ai-bubble hr { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
.ai-bubble table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; }
.ai-bubble th,.ai-bubble td { border: 1px solid var(--border); padding: 4px 8px; text-align: left; }
.ai-bubble th { background: var(--muted); font-weight: 600; }
.ai-bubble a { color: var(--primary); text-decoration: underline; word-break: break-all; }

/* Inline code */
.ai-inline-code {
  font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
  font-size: 11.5px;
  background: color-mix(in srgb, var(--muted) 80%, transparent);
  border: 1px solid var(--border);
  padding: 1px 5px;
  border-radius: 4px;
}

/* Code blocks (from marked renderer) */
.ai-code-block {
  margin: 8px 0;
  border-radius: 8px;
  border: 1px solid var(--border);
  overflow: hidden;
  background: color-mix(in srgb, var(--background) 95%, var(--muted));
}
.ai-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}
.ai-code-lang {
  font-size: 10px;
  font-family: ui-monospace, monospace;
  color: var(--muted-foreground);
  text-transform: lowercase;
}
.ai-code-copy {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  padding: 2px 4px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  transition: background 0.1s, color 0.1s;
}
.ai-code-copy:hover { background: var(--background); color: var(--foreground); }
.ai-code-block pre {
  margin: 0;
  padding: 10px 12px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}
.ai-code { font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace; }

/* Loading dots */
.ai-typing {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 12px 12px 12px 3px;
  background: color-mix(in srgb, var(--muted) 60%, transparent);
  border: 1px solid var(--border);
  width: fit-content;
}
.ai-typing span {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--muted-foreground);
  display: inline-block;
  animation: ai-bounce 1.2s ease-in-out infinite;
}
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes ai-bounce {
  0%,60%,100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* Welcome screen */
.ai-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: 20px 16px;
  text-align: center;
}
.ai-welcome-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.ai-welcome-title {
  font-size: 14px; font-weight: 600;
  margin: 0 0 4px;
}
.ai-welcome-desc {
  font-size: 11px;
  color: var(--muted-foreground);
  margin: 0 0 14px;
  line-height: 1.5;
  max-width: 200px;
}
.ai-suggestions { width: 100%; }
.ai-sug-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.ai-sug-btn {
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  font-size: 11.5px;
  background: color-mix(in srgb, var(--muted) 50%, transparent);
  border: 1px solid var(--border);
  border-radius: 7px;
  cursor: pointer;
  color: var(--foreground);
  margin-bottom: 5px;
  transition: background 0.12s, border-color 0.12s;
  line-height: 1.4;
}
.ai-sug-btn:hover {
  background: color-mix(in srgb, var(--primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
  color: var(--primary);
}

/* Input area */
.ai-input-area {
  padding: 8px 10px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--background);
}
.ai-role-bar {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  position: relative;
}
.ai-role-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 6px;
  border: 1px solid var(--border);
  border-radius: 100px;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  color: var(--muted-foreground);
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.ai-role-btn:hover {
  background: var(--muted);
  color: var(--foreground);
  border-color: var(--border);
}
.ai-role-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}
.ai-role-dropdown {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  z-index: 200;
  min-width: 160px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.ai-role-item {
  width: 100%;
  text-align: left;
  padding: 6px 9px;
  font-size: 12px;
  background: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: var(--foreground);
  display: flex;
  flex-direction: column;
  gap: 1px;
  transition: background 0.1s;
}
.ai-role-item:hover { background: var(--muted); }
.ai-role-item.active { background: color-mix(in srgb, var(--primary) 10%, transparent); }
.ai-role-item-name { font-weight: 500; }
.ai-role-item-desc { font-size: 10px; color: var(--muted-foreground); }

.ai-input-row {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}
.ai-textarea {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12.5px;
  background: color-mix(in srgb, var(--muted) 30%, transparent);
  color: var(--foreground);
  outline: none;
  resize: none;
  min-height: 34px;
  max-height: 120px;
  line-height: 1.5;
  font-family: inherit;
  transition: border-color 0.15s;
  overflow-y: auto;
}
.ai-textarea:focus { border-color: var(--primary); }
.ai-textarea::placeholder { color: var(--muted-foreground); }
.ai-textarea::-webkit-scrollbar { width: 3px; }
.ai-textarea::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.ai-send-btn {
  width: 34px; height: 34px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s, transform 0.1s;
}
.ai-send-btn:hover { opacity: 0.85; }
.ai-send-btn:active { transform: scale(0.93); }
.ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Settings panel */
.ai-settings {
  font-size: 13px;
  color: var(--foreground);
  height: 100%;
  display: flex;
  flex-direction: column;
}
.ai-settings-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 10px 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ai-settings-tab {
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  background: transparent;
  color: var(--muted-foreground);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.1s;
}
.ai-settings-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 6%, transparent);
}
.ai-settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
}
.ai-settings-content::-webkit-scrollbar { width: 4px; }
.ai-settings-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.ai-field { margin-bottom: 12px; }
.ai-label {
  display: block;
  font-size: 11.5px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--foreground);
}
.ai-input {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 12px;
  background: var(--background);
  color: var(--foreground);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.ai-input:focus { border-color: var(--primary); }
.ai-btn-row { display: flex; gap: 8px; margin-top: 4px; }
.ai-btn {
  flex: 1;
  padding: 7px;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  color: var(--foreground);
  transition: background 0.1s;
  font-family: inherit;
}
.ai-btn:hover { background: var(--muted); }
.ai-btn.primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.ai-btn.primary:hover { opacity: 0.85; }
.ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-status-msg {
  font-size: 11px;
  padding: 7px 10px;
  border-radius: 6px;
  margin-top: 8px;
  display: none;
}
.ai-status-msg.success { background: #dcfce7; color: #166534; }
.ai-status-msg.error { background: #fee2e2; color: #991b1b; }
.ai-status-msg.info { background: var(--muted); color: var(--muted-foreground); }
.ai-role-card {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 8px;
}
.ai-role-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.ai-role-name { font-size: 13px; font-weight: 500; }
.ai-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
  border-radius: 3px;
}
.ai-role-desc { font-size: 11px; color: var(--muted-foreground); margin-bottom: 6px; }
.ai-role-actions { display: flex; gap: 4px; }
.ai-role-action-btn {
  padding: 3px 9px;
  font-size: 11px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  color: var(--foreground);
  transition: background 0.1s;
  font-family: inherit;
}
.ai-role-action-btn:hover { background: var(--muted); }
.ai-role-action-btn.danger { color: #dc2626; }
.ai-role-action-btn.danger:hover { background: #fee2e2; }
.ai-add-role-btn {
  width: 100%;
  padding: 8px;
  font-size: 12px;
  border: 1.5px dashed var(--border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: var(--muted-foreground);
  transition: border-color 0.1s, color 0.1s, background 0.1s;
  font-family: inherit;
  margin-top: 4px;
}
.ai-add-role-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, transparent);
}
.ai-hist-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 6px;
  gap: 8px;
}
.ai-hist-info { flex: 1; min-width: 0; }
.ai-hist-name {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ai-hist-meta { font-size: 10px; color: var(--muted-foreground); margin-top: 2px; }
.ai-info-card {
  padding: 8px 10px;
  background: color-mix(in srgb, var(--muted) 50%, transparent);
  border-radius: 7px;
  font-size: 11px;
  color: var(--muted-foreground);
  margin-bottom: 10px;
}
`

// ─── State ──────────────────────────────────────────────────────────────────

function createState(api) {
  return {
    config: { apiKey: '', apiUrl: '', model: '', isConfigured: false },
    roles: [],
    messages: [],
    currentDocument: null,
    isLoading: false,
    selectedRoleId: 'default',
    conversations: {},
    api,
    sidebarHandle: null,
    settingsHandle: null,
    // Injected style element
    _styleEl: null,
  }
}

// ─── Persist ────────────────────────────────────────────────────────────────

function genDocKey(fp) {
  return btoa(encodeURIComponent(fp)).replace(/[/+=]/g, '_')
}

function hashContent(content) {
  let h = 0
  for (let i = 0; i < content.length; i++) {
    h = ((h << 5) - h) + content.charCodeAt(i)
    h = h & h
  }
  return h.toString(36)
}

async function loadData(state) {
  const d = await state.api.loadData()
  state.conversations = d.conversations || {}
  state.config = { ...state.config, ...(d.config || {}) }
  if (state.config.apiKey && state.config.apiUrl && state.config.model) {
    state.config.isConfigured = true
  }
  state.roles = (d.roles && d.roles.length) ? d.roles : defaultRoles()
}

async function saveData(state) {
  await state.api.saveData({
    conversations: state.conversations,
    config: state.config,
    roles: state.roles,
  })
}

function getDocMessages(state, filePath, content) {
  const conv = state.conversations[genDocKey(filePath)]
  if (!conv) return []
  if (content && conv.documentHash && conv.documentHash !== hashContent(content)) {
    return conv.messages.filter(m => m.role === 'system')
  }
  return conv.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
}

function saveDocMessages(state, filePath, fileName, messages, content) {
  const key = genDocKey(filePath)
  state.conversations[key] = {
    filePath,
    fileName,
    messages: messages.map(m => ({ ...m, timestamp: new Date(m.timestamp).toISOString() })),
    lastUpdated: new Date().toISOString(),
    documentHash: content ? hashContent(content) : undefined,
  }
  const entries = Object.entries(state.conversations)
  if (entries.length > 100) {
    entries.sort((a, b) => new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated))
    state.conversations = Object.fromEntries(entries.slice(0, 100))
  }
}

function defaultRoles() {
  return [
    {
      id: 'default',
      name: '文档助手',
      systemPrompt: 'You are a professional document analysis assistant. Help users understand, analyze, and extract insights from documents. Be clear, concise, and accurate.',
      description: '专业的文档分析和问答助手',
      isDefault: true,
    },
    {
      id: 'translator',
      name: '翻译助手',
      systemPrompt: 'You are a professional translator. Translate content accurately while preserving the original meaning and style. Provide natural, fluent translations.',
      description: '准确翻译文档内容',
    },
    {
      id: 'summarizer',
      name: '摘要助手',
      systemPrompt: 'You are an expert document summarizer. Extract key points and create clear, structured summaries. Focus on the most important information.',
      description: '提取关键点并生成简洁摘要',
    },
    {
      id: 'coder',
      name: '代码助手',
      systemPrompt: 'You are an expert programmer. Help analyze code, explain technical concepts, suggest improvements, and write clean code. Format code examples properly.',
      description: '代码分析和技术问答',
    },
  ]
}

// ─── AI Service ─────────────────────────────────────────────────────────────

class AiService {
  constructor(config) { this.config = config }

  async send(messages) {
    if (!this.config.isConfigured) throw new Error('未配置 AI 服务')
    const res = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({ model: this.config.model, messages, temperature: 0.7, max_tokens: 2000 }),
    })
    if (!res.ok) throw new Error(`API 错误 ${res.status}: ${await res.text()}`)
    const data = await res.json()
    const text =
      data.choices?.[0]?.message?.content ||
      data.content?.[0]?.text ||
      data.response ||
      data.text
    if (!text) throw new Error('无法解析响应')
    return text
  }

  async test() {
    try { return !!(await this.send([{ role: 'user', content: 'Hi' }])) }
    catch { return false }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function h(tag, cls, ...children) {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  for (const c of children) {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c))
    else if (c) el.appendChild(c)
  }
  return el
}

function fmtTime(d) {
  return new Date(d).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(d) {
  const now = new Date(), dd = new Date(d)
  const diffDays = Math.floor((now - dd) / 86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  return dd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// ─── Chat Panel ──────────────────────────────────────────────────────────────

function buildChatPanel(container, state) {
  container.classList.add('ai-panel')

  // ── Header ──────────────────────────────────────────────────────────────
  const header = h('div', 'ai-header')
  const titleWrap = h('div', '', )
  titleWrap.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;'
  const title = h('div', 'ai-header-title', 'AI 助手')
  const subTitle = h('div', 'ai-header-sub', '')
  titleWrap.append(title, subTitle)

  const btnClear = h('button', 'ai-icon-btn')
  btnClear.title = '清空对话'
  btnClear.innerHTML = ICON_TRASH

  header.append(titleWrap, btnClear)
  container.append(header)

  // ── Status bar ───────────────────────────────────────────────────────────
  const statusBar = h('div', 'ai-status')
  statusBar.style.display = 'none'
  container.append(statusBar)

  const refreshStatus = () => {
    statusBar.innerHTML = ''
    if (state.config.isConfigured) {
      const dot = h('div', 'ai-status-dot')
      const label = h('span', '', `自定义 · ${state.config.model}`)
      statusBar.append(dot, label)
      statusBar.style.display = 'flex'
    } else {
      statusBar.style.display = 'none'
    }
  }
  refreshStatus()

  // ── Message area ─────────────────────────────────────────────────────────
  const msgArea = h('div', 'ai-messages')
  container.append(msgArea)

  let currentMessages = []

  // Typewriter effect for a bot message element
  function typewrite(el, text, speed = 12) {
    return new Promise(resolve => {
      const words = text.split(/(\s+)/)
      let i = 0
      const tick = () => {
        if (i >= words.length) { resolve(); return }
        el.innerHTML = marked.parse(words.slice(0, i + 1).join(''))
        i++
        setTimeout(tick, speed)
      }
      tick()
    })
  }

  function renderMsgBubble(msg, animate = false) {
    const isUser = msg.role === 'user'
    const row = h('div', `ai-msg-row ${isUser ? 'user' : 'bot'}`)

    if (!isUser) {
      const avatar = h('div', 'ai-avatar bot')
      avatar.innerHTML = ICON_BOT
      row.append(avatar)
    }

    const wrap = h('div', 'ai-bubble-wrap')
    const bubble = h('div', 'ai-bubble')

    if (isUser) {
      bubble.textContent = msg.content
    } else {
      if (animate) {
        bubble.innerHTML = ''
        // Return a function that starts the typewriter
        wrap.append(bubble)
        const actions = makeBubbleActions(msg)
        wrap.append(actions)
        row.append(wrap)
        return { row, startTypewrite: () => typewrite(bubble, msg.content) }
      } else {
        bubble.innerHTML = marked.parse(msg.content)
      }
    }

    const actions = makeBubbleActions(msg)
    const meta = h('div', 'ai-meta', fmtTime(msg.timestamp))
    wrap.append(bubble, actions, meta)
    row.append(wrap)

    if (isUser) {
      const avatar = h('div', 'ai-avatar user')
      avatar.innerHTML = ICON_USER
      row.append(avatar)
    }

    return { row }
  }

  function makeBubbleActions(msg) {
    const actions = h('div', 'ai-bubble-actions')
    const copyBtn = h('button', 'ai-bubble-action-btn')
    copyBtn.innerHTML = `${ICON_COPY} <span>复制</span>`
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(msg.content).then(() => {
        copyBtn.innerHTML = `${ICON_CHECK} <span>已复制</span>`
        setTimeout(() => { copyBtn.innerHTML = `${ICON_COPY} <span>复制</span>` }, 1500)
      })
    }
    actions.append(copyBtn)
    return actions
  }

  function buildTypingIndicator() {
    const row = h('div', 'ai-msg-row bot')
    const avatar = h('div', 'ai-avatar bot')
    avatar.innerHTML = ICON_BOT
    const dots = h('div', 'ai-typing')
    dots.innerHTML = '<span></span><span></span><span></span>'
    row.append(avatar, dots)
    return row
  }

  function buildWelcome() {
    const wrap = h('div', 'ai-welcome')
    const icon = h('div', 'ai-welcome-icon')
    icon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>`
    const titleEl = h('h4', 'ai-welcome-title', state.config.isConfigured ? '你好，有什么可以帮你？' : '欢迎使用 AI 助手')
    const desc = h('p', 'ai-welcome-desc')

    if (!state.config.isConfigured) {
      desc.textContent = '请在设置 → 插件 → AI 助手设置 中配置 API'
      wrap.append(icon, titleEl, desc)
      return wrap
    }

    if (state.currentDocument) {
      desc.textContent = `正在阅读「${state.currentDocument.fileName}」，可以提问关于该文档的任何问题`
    } else {
      desc.textContent = '打开文档后，我可以帮你分析和理解内容'
    }
    wrap.append(icon, titleEl, desc)

    if (state.currentDocument) {
      const sugs = h('div', 'ai-suggestions')
      const label = h('p', 'ai-sug-label', '建议提问')
      sugs.append(label)
      const questions = ['这篇文档的主要内容是什么？', '帮我总结一下关键要点', '文档中有哪些重要的概念？', '帮我找出文档中的结论']
      questions.forEach(q => {
        const btn = h('button', 'ai-sug-btn', q)
        btn.onclick = () => { textarea.value = q; autoResize(); textarea.focus() }
        sugs.append(btn)
      })
      wrap.append(sugs)
    }
    return wrap
  }

  async function renderMessages(animateLast = false) {
    msgArea.innerHTML = ''
    const display = currentMessages.filter(m => m.role !== 'system')

    if (display.length === 0) {
      msgArea.append(buildWelcome())
      return
    }

    for (let i = 0; i < display.length; i++) {
      const msg = display[i]
      const isLast = i === display.length - 1
      const animate = animateLast && isLast && msg.role === 'assistant'

      const result = renderMsgBubble(msg, animate)
      msgArea.append(result.row)

      if (animate && result.startTypewrite) {
        await result.startTypewrite()
        // After typewrite, add meta/actions
        const bubble = result.row.querySelector('.ai-bubble')
        const meta = h('div', 'ai-meta', fmtTime(msg.timestamp))
        result.row.querySelector('.ai-bubble-wrap').append(meta)
      }
    }

    if (state.isLoading) {
      msgArea.append(buildTypingIndicator())
    }

    msgArea.scrollTop = msgArea.scrollHeight
  }

  function buildSystemMsg() {
    const role = state.roles.find(r => r.id === state.selectedRoleId) || state.roles.find(r => r.isDefault) || state.roles[0]
    let prompt = role?.systemPrompt || 'You are a helpful assistant.'
    if (state.currentDocument) {
      const excerpt = state.currentDocument.content.substring(0, 4000)
      prompt += `\n\nThe user is reading "${state.currentDocument.fileName}".\n\nDocument content:\n${excerpt}${state.currentDocument.content.length > 4000 ? '\n\n[content truncated]' : ''}\n\nAnswer questions based on this document.`
    }
    return { id: '__sys__', role: 'system', content: prompt, timestamp: new Date() }
  }

  function loadDocMsgs() {
    if (state.currentDocument) {
      const saved = getDocMessages(state, state.currentDocument.filePath, state.currentDocument.content)
      currentMessages = saved.length > 0 ? saved : [buildSystemMsg()]
    } else {
      currentMessages = [buildSystemMsg()]
    }
    renderMessages()
  }

  // ── Input area ───────────────────────────────────────────────────────────
  const inputArea = h('div', 'ai-input-area')

  // Role selector
  const roleBar = h('div', 'ai-role-bar')
  const roleBtn = h('button', 'ai-role-btn')
  const roleDot = h('span', 'ai-role-dot')
  const roleName = h('span', '', '')
  const roleChev = h('span', '')
  roleChev.innerHTML = ICON_CHEVRON
  roleBtn.append(roleDot, roleName, roleChev)

  const roleDrop = h('div', 'ai-role-dropdown')
  roleDrop.style.display = 'none'
  let roleDropOpen = false

  const refreshRoleBtn = () => {
    const cur = state.roles.find(r => r.id === state.selectedRoleId) || state.roles[0]
    roleName.textContent = cur?.name || '选择角色'
  }
  refreshRoleBtn()

  const openRoleDrop = () => {
    roleDrop.innerHTML = ''
    state.roles.forEach(role => {
      const item = h('button', `ai-role-item${role.id === state.selectedRoleId ? ' active' : ''}`)
      const nameEl = h('span', 'ai-role-item-name', role.name)
      item.append(nameEl)
      if (role.description) item.append(h('span', 'ai-role-item-desc', role.description))
      item.onclick = () => {
        state.selectedRoleId = role.id
        const sysMsg = buildSystemMsg()
        currentMessages = [sysMsg, ...currentMessages.filter(m => m.role !== 'system')]
        refreshRoleBtn()
        roleDrop.style.display = 'none'
        roleDropOpen = false
        renderMessages()
      }
      roleDrop.append(item)
    })
  }

  roleBtn.onclick = () => {
    roleDropOpen = !roleDropOpen
    if (roleDropOpen) { openRoleDrop(); roleDrop.style.display = 'block' }
    else roleDrop.style.display = 'none'
  }

  document.addEventListener('click', e => {
    if (!roleBar.contains(e.target)) { roleDrop.style.display = 'none'; roleDropOpen = false }
  })

  roleBar.append(roleBtn, roleDrop)
  inputArea.append(roleBar)

  // Textarea + send
  const inputRow = h('div', 'ai-input-row')
  const textarea = document.createElement('textarea')
  textarea.className = 'ai-textarea'
  textarea.placeholder = state.config.isConfigured ? '发送消息... (Enter 发送，Shift+Enter 换行)' : '请先配置 API...'
  textarea.disabled = !state.config.isConfigured
  textarea.rows = 1

  const autoResize = () => {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
  textarea.addEventListener('input', autoResize)

  const sendBtn = h('button', 'ai-send-btn')
  sendBtn.innerHTML = ICON_SEND
  sendBtn.disabled = !state.config.isConfigured

  const doSend = async () => {
    const text = textarea.value.trim()
    if (!text || state.isLoading || !state.config.isConfigured) return

    const userMsg = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    currentMessages.push(userMsg)
    textarea.value = ''
    autoResize()
    state.isLoading = true
    renderMessages()

    try {
      const svc = new AiService(state.config)
      const aiText = await svc.send(currentMessages.map(m => ({ role: m.role, content: m.content })))
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiText, timestamp: new Date() }
      currentMessages.push(aiMsg)
      state.isLoading = false

      if (state.currentDocument) {
        saveDocMessages(state, state.currentDocument.filePath, state.currentDocument.fileName, currentMessages, state.currentDocument.content)
      }
      saveData(state)
      renderMessages(true) // animate last
    } catch (e) {
      const errMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: `**错误**：${e.message}`, timestamp: new Date() }
      currentMessages.push(errMsg)
      state.isLoading = false
      renderMessages()
    }
  }

  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend() }
  })
  sendBtn.onclick = doSend

  inputRow.append(textarea, sendBtn)
  inputArea.append(inputRow)
  container.append(inputArea)

  // ── Wire up header buttons ───────────────────────────────────────────────
  const refreshHeaderTitle = () => {
    if (state.currentDocument) {
      title.textContent = state.currentDocument.fileName
      subTitle.textContent = 'AI 助手'
    } else {
      title.textContent = 'AI 助手'
      subTitle.textContent = ''
    }
  }
  refreshHeaderTitle()

  btnClear.onclick = () => {
    if (state.currentDocument) {
      delete state.conversations[genDocKey(state.currentDocument.filePath)]
      saveData(state)
    }
    currentMessages = [buildSystemMsg()]
    renderMessages()
  }

  // ── Document open listener ───────────────────────────────────────────────
  const onDocOpen = (fileData) => {
    state.currentDocument = fileData
    refreshHeaderTitle()
    refreshStatus()
    textarea.placeholder = state.config.isConfigured ? '发送消息... (Enter 发送，Shift+Enter 换行)' : '请先配置 API...'
    textarea.disabled = !state.config.isConfigured
    sendBtn.disabled = !state.config.isConfigured
    loadDocMsgs()
  }
  state.api.on('document:open', onDocOpen)

  loadDocMsgs()

  return () => {
    state.api.off('document:open', onDocOpen)
  }
}

// ─── Settings Panel ──────────────────────────────────────────────────────────

function buildSettingsPanel(container, state) {
  container.classList.add('ai-settings')

  const tabNames = ['api', 'roles', 'history']
  const tabLabels = { api: 'API 配置', roles: '角色管理', history: '对话历史' }
  let activeTab = 'api'

  // Tab bar
  const tabBar = h('div', 'ai-settings-tabs')
  const tabBtns = {}
  tabNames.forEach(t => {
    const btn = h('button', `ai-settings-tab${t === activeTab ? ' active' : ''}`, tabLabels[t])
    btn.onclick = () => {
      activeTab = t
      tabNames.forEach(name => {
        tabBtns[name].className = `ai-settings-tab${name === t ? ' active' : ''}`
        panels[name].style.display = name === t ? '' : 'none'
      })
    }
    tabBtns[t] = btn
    tabBar.append(btn)
  })
  container.append(tabBar)

  const panels = {}

  // ── API Config ──────────────────────────────────────────────────────────
  const apiPanel = h('div', 'ai-settings-content')

  const mkField = (label, inputEl) => {
    const field = h('div', 'ai-field')
    field.append(h('label', 'ai-label', label), inputEl)
    return field
  }

  const apiKeyInp = document.createElement('input')
  apiKeyInp.type = 'password'
  apiKeyInp.className = 'ai-input'
  apiKeyInp.value = state.config.apiKey || ''
  apiKeyInp.placeholder = 'sk-...'

  const apiUrlInp = document.createElement('input')
  apiUrlInp.type = 'url'
  apiUrlInp.className = 'ai-input'
  apiUrlInp.value = state.config.apiUrl || ''
  apiUrlInp.placeholder = 'https://api.openai.com/v1/chat/completions'

  const modelInp = document.createElement('input')
  modelInp.type = 'text'
  modelInp.className = 'ai-input'
  modelInp.value = state.config.model || ''
  modelInp.placeholder = 'gpt-4o'

  const statusMsg = h('div', 'ai-status-msg')

  const setStatus = (type, text) => {
    statusMsg.className = `ai-status-msg ${type}`
    statusMsg.textContent = text
    statusMsg.style.display = 'block'
  }

  const btnRow = h('div', 'ai-btn-row')

  const testBtn = h('button', 'ai-btn', '测试连接')
  testBtn.onclick = async () => {
    const cfg = { apiKey: apiKeyInp.value, apiUrl: apiUrlInp.value, model: modelInp.value, isConfigured: true }
    if (!cfg.apiKey || !cfg.apiUrl || !cfg.model) { setStatus('error', '请填写所有字段'); return }
    testBtn.disabled = true; testBtn.textContent = '测试中...'
    setStatus('info', '正在连接...')
    const ok = await new AiService(cfg).test()
    testBtn.disabled = false; testBtn.textContent = '测试连接'
    setStatus(ok ? 'success' : 'error', ok ? '✓ 连接成功' : '✗ 连接失败，请检查配置')
  }

  const saveBtn = h('button', 'ai-btn primary', '保存')
  saveBtn.onclick = () => {
    state.config = {
      apiKey: apiKeyInp.value.trim(),
      apiUrl: apiUrlInp.value.trim(),
      model: modelInp.value.trim(),
      isConfigured: !!(apiKeyInp.value.trim() && apiUrlInp.value.trim() && modelInp.value.trim()),
    }
    saveData(state)
    setStatus('success', '✓ 配置已保存')
  }

  btnRow.append(testBtn, saveBtn)
  apiPanel.append(
    mkField('API Key', apiKeyInp),
    mkField('API URL (兼容 OpenAI 格式)', apiUrlInp),
    mkField('模型名称', modelInp),
    btnRow,
    statusMsg,
  )
  panels.api = apiPanel

  // ── Roles ────────────────────────────────────────────────────────────────
  const rolesPanel = h('div', 'ai-settings-content')

  const renderRoles = () => {
    rolesPanel.innerHTML = ''
    state.roles.forEach(role => {
      const card = h('div', 'ai-role-card')
      const hdr = h('div', 'ai-role-card-header')
      hdr.append(h('span', 'ai-role-name', role.name))
      if (role.isDefault) hdr.append(h('span', 'ai-badge', '默认'))

      if (role.description) card.append(hdr, h('p', 'ai-role-desc', role.description))
      else card.append(hdr)

      const editForm = h('div', '')
      editForm.style.display = 'none'

      const nameInp = document.createElement('input')
      nameInp.type = 'text'
      nameInp.className = 'ai-input'
      nameInp.value = role.name
      nameInp.style.marginBottom = '6px'

      const descInp = document.createElement('input')
      descInp.type = 'text'
      descInp.className = 'ai-input'
      descInp.value = role.description || ''
      descInp.placeholder = '角色描述（可选）'
      descInp.style.marginBottom = '6px'

      const promptTa = document.createElement('textarea')
      promptTa.className = 'ai-input'
      promptTa.value = role.systemPrompt
      promptTa.placeholder = 'System prompt...'
      promptTa.rows = 4
      promptTa.style.cssText = 'min-height:80px;resize:vertical;font-family:inherit;'

      const fBtnRow = h('div', 'ai-btn-row')
      fBtnRow.style.marginTop = '6px'
      const saveRoleBtn = h('button', 'ai-btn primary', '保存')
      saveRoleBtn.onclick = () => {
        role.name = nameInp.value.trim() || role.name
        role.description = descInp.value.trim()
        role.systemPrompt = promptTa.value
        saveData(state)
        renderRoles()
      }
      const cancelBtn = h('button', 'ai-btn', '取消')
      cancelBtn.onclick = () => { editForm.style.display = 'none'; actRow.style.display = 'flex' }
      fBtnRow.append(saveRoleBtn, cancelBtn)

      editForm.append(
        h('label', 'ai-label', '名称'), nameInp,
        h('label', 'ai-label', '描述'), descInp,
        h('label', 'ai-label', 'System Prompt'), promptTa,
        fBtnRow,
      )

      const actRow = h('div', 'ai-role-actions')
      const editBtn = h('button', 'ai-role-action-btn', '编辑')
      editBtn.onclick = () => { editForm.style.display = 'block'; actRow.style.display = 'none' }
      actRow.append(editBtn)

      if (!role.isDefault) {
        const delBtn = h('button', 'ai-role-action-btn danger', '删除')
        delBtn.onclick = () => {
          state.roles = state.roles.filter(r => r.id !== role.id)
          saveData(state)
          renderRoles()
        }
        actRow.append(delBtn)
      }

      card.append(actRow, editForm)
      rolesPanel.append(card)
    })

    const addBtn = h('button', 'ai-add-role-btn', '+ 添加自定义角色')
    addBtn.onclick = () => {
      state.roles.push({ id: `role-${Date.now()}`, name: '新角色', systemPrompt: '', description: '' })
      saveData(state)
      renderRoles()
    }
    rolesPanel.append(addBtn)
  }
  renderRoles()
  panels.roles = rolesPanel

  // ── History ──────────────────────────────────────────────────────────────
  const histPanel = h('div', 'ai-settings-content')

  const renderHistory = () => {
    histPanel.innerHTML = ''
    const convs = Object.values(state.conversations)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 50)

    const infoCard = h('div', 'ai-info-card')
    infoCard.innerHTML = `共 <strong>${convs.length}</strong> 段对话历史（最多保留 100 段）`
    histPanel.append(infoCard)

    if (convs.length === 0) {
      histPanel.append(h('p', '', '暂无对话历史'))
    } else {
      convs.forEach(conv => {
        const item = h('div', 'ai-hist-item')
        const info = h('div', 'ai-hist-info')
        info.append(h('div', 'ai-hist-name', conv.fileName))
        const msgCount = conv.messages.filter(m => m.role !== 'system').length
        info.append(h('div', 'ai-hist-meta', `${msgCount} 条消息 · ${fmtDate(conv.lastUpdated)}`))
        const del = h('button', 'ai-role-action-btn danger', '删除')
        del.onclick = () => {
          delete state.conversations[genDocKey(conv.filePath)]
          saveData(state)
          renderHistory()
        }
        item.append(info, del)
        histPanel.append(item)
      })
    }

    const row = h('div', 'ai-btn-row')
    const clearAll = h('button', 'ai-btn', '清空全部')
    clearAll.onclick = () => {
      if (confirm('确定要清空所有对话历史吗？')) {
        state.conversations = {}
        saveData(state)
        renderHistory()
      }
    }
    const exportBtn = h('button', 'ai-btn', '导出备份')
    exportBtn.onclick = () => {
      const blob = new Blob([JSON.stringify(state.conversations, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-history-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    row.append(clearAll, exportBtn)
    histPanel.append(row)
  }
  renderHistory()
  panels.history = histPanel

  // Show panels, hide inactive
  tabNames.forEach(t => {
    panels[t].style.display = t === activeTab ? '' : 'none'
    container.append(panels[t])
  })
}

// ─── CSS injection ───────────────────────────────────────────────────────────

function injectStyles() {
  const el = document.createElement('style')
  el.setAttribute('data-plugin', 'ai-assistant')
  el.textContent = PLUGIN_STYLES
  document.head.appendChild(el)
  return el
}

// ─── Plugin entry ─────────────────────────────────────────────────────────────

const plugin = {
  state: null,

  async onload(api) {
    this.state = createState(api)
    await loadData(this.state)

    // Inject global styles
    this.state._styleEl = injectStyles()

    // Register chat sidebar panel
    this.state.sidebarHandle = api.registerSidebarPanel({
      id: 'ai-assistant',
      title: 'AI 助手',
      icon: '🤖',
      render: (container) => buildChatPanel(container, this.state),
    })

    // Register settings panel
    this.state.settingsHandle = api.registerSettingsPanel({
      id: 'ai-assistant-settings',
      title: 'AI 助手设置',
      render: (container) => buildSettingsPanel(container, this.state),
    })

    // Track current document
    api.on('document:open', (fileData) => {
      this.state.currentDocument = fileData
    })

    api.log('AI 助手插件 v2.0 已加载 (marked 已捆绑)')
  },

  async onunload() {
    if (this.state) {
      await saveData(this.state)
      if (this.state._styleEl?.parentNode) {
        this.state._styleEl.parentNode.removeChild(this.state._styleEl)
      }
      this.state = null
    }
  },
}

export default plugin
