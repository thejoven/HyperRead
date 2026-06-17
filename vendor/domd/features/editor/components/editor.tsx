"use client";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Undo2,
    Redo2,
    Heading1,
    Heading2,
    Bold,
    Italic,
    List,
    Quote,
    Code,
    Table,
    Link,
} from "lucide-react";
import {
    DOMD,
    toMarkdown,
    useEditor,
    useRenderData,
    useEditorStoreApi,
} from "@do-md/react";
import "@do-md/react/style.css";
import { isTauri } from "@/common/lib/platform";
import { tauriCore } from "@/common/lib/tauri";
import { useLatest } from "@/common/lib/use-latest";
import { useAutoSave } from "../hooks/use-auto-save";
import { useTauriEvent } from "../hooks/use-tauri-event";
import { saveDocument } from "../lib/save-document";
import type { FileMeta } from "../lib/types";

export function Editor({
    meta,
    onMetaUpdate,
    onRequestOpenUrl,
    saveRef,
}: {
    meta: FileMeta;
    onMetaUpdate: (meta: FileMeta) => void;
    onRequestOpenUrl: () => void;
    saveRef: React.MutableRefObject<(() => Promise<boolean>) | null>;
}) {
    const renderData = useRenderData();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const editor = useEditor();
    const store = useEditorStoreApi();

    const metaRef = useLatest(meta);
    const domdRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     if (editor?.aiInsertInCursor) {
    //         // @ts-ignore
    //         window.aiInsertInCursor = (text: string) => {
    //             editor?.aiInsertInCursor(text);
    //         };
    //         // @ts-ignore
    //         window.insertText = (text: string) => {
    //             store?.insertText(text);
    //         };
    //         // @ts-ignore
    //         window.insertTexts = async (...texts: string) => {
    //             const SPEED = 1.0;

    //             const sleep = (ms: number) =>
    //                 new Promise((r) => setTimeout(r, ms * SPEED));
    //             const rand = (min: number, max: number) =>
    //                 min + Math.random() * (max - min);

    //             for (const chunk of texts) {
    //                 store.insertText(chunk);
    //                 await sleep(rand(25, 60));
    //             }
    //         };
    //         // @ts-ignore
    //         window.mockAI = async (text: string) => {
    //             const SPEED = 1.0;

    //             const content = text;

    //             const sleep = (ms: number) =>
    //                 new Promise((r) => setTimeout(r, ms * SPEED));
    //             const rand = (min: number, max: number) =>
    //                 min + Math.random() * (max - min);

    //             let i = 0;
    //             while (i < content.length) {
    //                 const chunkSize = 1 + Math.floor(Math.random() * 5); // 1..5
    //                 const chunk = content.slice(i, i + chunkSize);
    //                 store.insertText(chunk);
    //                 i += chunkSize;

    //                 await sleep(rand(25, 60));
    //             }
    //         };
    //     }
    // }, [editor, store]);

    // Benchmark: signal once after the initial paint. initMd makes renderData
    // available synchronously on first render, so a single mount effect is enough.
    useEffect(() => {
        if (!isTauri()) return;
        const raf1 = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tauriCore().then(({ invoke }) => {
                    invoke("benchmark_mark_ready").catch(() => {});
                });
            });
        });
        return () => cancelAnimationFrame(raf1);
    }, []);

    const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        return () => {
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        };
    }, []);

    const storeRef = useLatest(store);
    const getTitle = useCallback(() => {
        try {
            return storeRef.current?.getTitle() ?? "";
        } catch {
            return "";
        }
    }, [storeRef]);

    const doSave = useCallback(
        async (data: ReturnType<typeof useRenderData>) => {
            const md = toMarkdown(data) ?? "";
            const currentMeta = metaRef.current;
            setSaving(true);
            try {
                const result = await saveDocument(currentMeta, md, getTitle);
                if (!result.ok) return false;
                onMetaUpdate(result.meta);
                if (currentMeta.kind === "electron") {
                    window.domdElectron?.setDirty(false);
                }
                if (currentMeta.kind === "web" || currentMeta.kind === "electron") {
                    setSaved(true);
                    if (savedTimerRef.current)
                        clearTimeout(savedTimerRef.current);
                    savedTimerRef.current = setTimeout(() => {
                        setSaved(false);
                        savedTimerRef.current = null;
                    }, 2000);
                }
                return true;
            } finally {
                setSaving(false);
            }
        },
        [onMetaUpdate, metaRef, getTitle],
    );

    const doSaveRef = useRef(doSave);
    doSaveRef.current = doSave;
    const renderDataRef = useRef(renderData);
    renderDataRef.current = renderData;

    const insertMarkdown = useCallback(
        (markdown: string) => {
            editor?.focus();
            store?.insertText(markdown);
        },
        [editor, store],
    );

    const setHeading = useCallback(
        (level: number) => {
            editor?.focus();
            store?.setHeaderLevel(level);
        },
        [editor, store],
    );

    const insertCodeBlock = useCallback(() => {
        editor?.focus();
        store?.insertCodeArea();
    }, [editor, store]);

    const insertTable = useCallback(() => {
        editor?.focus();
        store?.insertTable();
    }, [editor, store]);

    const runUndo = useCallback(() => {
        editor?.focus();
        store?.undo();
    }, [editor, store]);

    const runRedo = useCallback(() => {
        editor?.focus();
        store?.redo();
    }, [editor, store]);

    useAutoSave(meta, renderData, doSave);

    useEffect(() => {
        saveRef.current = () => doSaveRef.current(renderDataRef.current);
        return () => {
            saveRef.current = null;
        };
    }, [saveRef]);

    // When a Prism grammar finishes loading, re-parse the doc so already-rendered
    // code blocks pick up the now-available syntax highlighting. Debounced so
    // multiple grammars loading back-to-back result in a single re-parse.
    // baseVersionRef captures the version at mount so previously-loaded grammars
    // (from earlier docs in this session) don't trigger a spurious initial reparse.
    const [grammarVersion, setGrammarVersion] = useState(0);
    const baseVersionRef = useRef(0);
    useEffect(() => {
        if (meta.kind === "electron") return;
        let cancelled = false;
        let unsubscribe: (() => void) | undefined;

        import("@/common/lib/prism")
            .then(({ getGrammarVersion, subscribeGrammarLoad }) => {
                if (cancelled) return;
                const syncGrammarVersion = () => {
                    setGrammarVersion(getGrammarVersion());
                };
                baseVersionRef.current = getGrammarVersion();
                setGrammarVersion(baseVersionRef.current);
                unsubscribe = subscribeGrammarLoad(syncGrammarVersion);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, [meta.kind]);

    useEffect(() => {
        if (meta.kind === "electron") return;
        if (grammarVersion <= baseVersionRef.current) return;
        if (!editor) return;
        const id = setTimeout(() => {
            const md = toMarkdown(renderDataRef.current) ?? "";
            editor.editorStore.resetMD(md);
        }, 50);
        return () => clearTimeout(id);
    }, [grammarVersion, editor, meta.kind]);

    // Tauri: menu → Save
    useTauriEvent("menu-save", () => {
        doSaveRef.current(renderDataRef.current);
    });

    // Tauri: CLI → insert text. Driven from the Rust-side cli_server
    // (~/.domd/cli.sock). A blank new window has no children → no cursor →
    // store.insertText is a silent no-op. Seed via resetMD on first insert,
    // then fall through to incremental insertText.
    useTauriEvent<{ text: string }>("cli-insert", ({ text }) => {
        const isEmpty = (toMarkdown(renderDataRef.current) ?? "").length === 0;
        if (isEmpty && editor?.editorStore) {
            editor.editorStore.resetMD(text);
            return;
        }
        // TODO(user): if there's an active range selection, delete it before
        // insertText so the new text replaces the selection (standard editor
        // behavior). store.insertText currently only handles the caret case.
        store?.insertText(text);
    });

    // Tauri: CLI → push selection snapshot whenever it changes. The Rust
    // cli_server reads from a HashMap keyed by window label so an AI agent
    // querying `selection` gets an instant synchronous answer.
    //
    // Debounced (60ms) — selection changes can arrive in bursts during drag.
    useEffect(() => {
        if (!isTauri() || !store) return;
        let timer: ReturnType<typeof setTimeout> | null = null;
        const push = () => {
            try {
                const sel = store.getSelectionState();
                tauriCore().then(({ invoke }) => {
                    invoke("update_selection", { sel }).catch(() => {});
                });
            } catch {
                // getSelectionState may throw while user is still implementing
                // the body — swallow so the rest of the editor keeps working.
            }
        };
        const schedule = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(push, 60);
        };
        const unsubscribe = store.subscribe(schedule);
        // Initial push so the Rust state has something on first selection query.
        schedule();
        return () => {
            if (timer) clearTimeout(timer);
            unsubscribe?.();
        };
    }, [store]);

    // Tauri: CLI → push full content + dirty flag whenever the doc changes.
    // Debounced (150ms) since this serializes the whole renderData to markdown.
    const lastSavedMdRef = useRef<string>("");
    useEffect(() => {
        // Treat the initial loaded content as the baseline for dirty detection.
        // Re-runs only when meta changes (new doc loaded into this window).
        lastSavedMdRef.current = toMarkdown(renderDataRef.current) ?? "";
        if (meta.kind === "electron") {
            window.domdElectron?.setDirty(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meta]);
    useEffect(() => {
        if (meta.kind !== "electron") return;
        const handle = setTimeout(() => {
            const md = toMarkdown(renderData) ?? "";
            window.domdElectron?.setDirty(md !== lastSavedMdRef.current);
        }, 150);
        return () => clearTimeout(handle);
    }, [renderData, meta.kind]);
    useEffect(() => {
        if (!isTauri()) return;
        const handle = setTimeout(() => {
            const md = toMarkdown(renderData) ?? "";
            const isDirty = md !== lastSavedMdRef.current;
            tauriCore().then(({ invoke }) => {
                invoke("update_content", { content: md, isDirty }).catch(
                    () => {},
                );
            });
        }, 150);
        return () => clearTimeout(handle);
    }, [renderData]);

    // Tauri: CLI just saved this window to disk on our behalf. Update the
    // baseline so subsequent dirty checks compare against the saved content.
    useTauriEvent<string>("saved-by-cli", () => {
        lastSavedMdRef.current = toMarkdown(renderDataRef.current) ?? "";
        // Push an immediate clean-state update so AI sees has_unsaved_changes
        // flip to false without waiting for the debounce.
        tauriCore().then(({ invoke }) => {
            invoke("update_content", {
                content: lastSavedMdRef.current,
                isDirty: false,
            }).catch(() => {});
        });
    });

    // Also clear the dirty baseline after a successful FE-initiated save
    // (menu Save, autosave, web Save button) — keeps the dirty flag accurate
    // whoever did the saving.
    const prevSavingRef = useRef(saving);
    useEffect(() => {
        if (prevSavingRef.current && !saving) {
            lastSavedMdRef.current = toMarkdown(renderDataRef.current) ?? "";
        }
        prevSavingRef.current = saving;
    }, [saving]);

    // Web: Cmd/Ctrl+S
    useEffect(() => {
        if (isTauri()) return;
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                doSaveRef.current(renderDataRef.current);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Web: warn before unload if there's no file handle yet. Electron close
    // confirmation lives in the main process so the window never fails silently.
    useEffect(() => {
        if (isTauri()) return;
        const handler = (e: BeforeUnloadEvent) => {
            const m = metaRef.current;
            if (m.kind === "web" && !m.handle) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [metaRef]);

    const showSaveBar = meta.kind === "web" || meta.kind === "electron";
    const toolbarButtonClass =
        "flex items-center justify-center size-7 rounded-md transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 text-base-content/70";

    const iconSize = 15;
    const iconProps = { size: iconSize, strokeWidth: 2 };

    const toolbarGroups: Array<{
        id: string;
        buttons: Array<{
            id: string;
            icon: JSX.Element;
            title: string;
            action: () => void;
        }>;
    }> = [
        {
            id: "history",
            buttons: [
                { id: "undo", icon: <Undo2 {...iconProps} />, title: "撤销", action: runUndo },
                { id: "redo", icon: <Redo2 {...iconProps} />, title: "重做", action: runRedo },
            ],
        },
        {
            id: "heading",
            buttons: [
                { id: "h1", icon: <Heading1 {...iconProps} />, title: "一级标题", action: () => setHeading(1) },
                { id: "h2", icon: <Heading2 {...iconProps} />, title: "二级标题", action: () => setHeading(2) },
            ],
        },
        {
            id: "format",
            buttons: [
                { id: "bold", icon: <Bold {...iconProps} />, title: "加粗", action: () => insertMarkdown("**加粗文字**") },
                { id: "italic", icon: <Italic {...iconProps} />, title: "斜体", action: () => insertMarkdown("*斜体文字*") },
                { id: "list", icon: <List {...iconProps} />, title: "无序列表", action: () => insertMarkdown("\n- 列表项") },
                { id: "quote", icon: <Quote {...iconProps} />, title: "引用块", action: () => insertMarkdown("\n> 引用内容") },
            ],
        },
        {
            id: "insert",
            buttons: [
                { id: "code", icon: <Code {...iconProps} />, title: "代码块", action: insertCodeBlock },
                { id: "table", icon: <Table {...iconProps} />, title: "表格", action: insertTable },
                { id: "link", icon: <Link {...iconProps} />, title: "链接", action: () => insertMarkdown("[链接文字](https://example.com)") },
            ],
        },
    ];

    return (
        <div className="fixed inset-0 flex flex-col bg-base-100 overflow-hidden">
            {showSaveBar ? (
                <div className="shrink-0 border-b border-base-300 bg-base-100/95 shadow-sm select-none">
                    <div className="flex min-h-14 flex-wrap items-center gap-3 px-4 py-2 text-xs">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                                MD
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold leading-4 text-base-content">
                                    编辑器
                                </div>
                                <div className="max-w-[16rem] truncate text-[11px] leading-4 text-base-content/50">
                                    {meta.name}
                                </div>
                            </div>
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                            <div className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-base-300 bg-base-200/45 p-1 shadow-inner">
                                {toolbarGroups.map((group, index) => (
                                    <div
                                        key={group.id}
                                        className={`flex items-center gap-0.5 ${index > 0 ? "ml-1 border-l border-base-300 pl-1" : ""}`}
                                    >
                                        {group.buttons.map((button) => (
                                            <button type="button"
                                                key={button.id}
                                                title={button.title}
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={button.action}
                                                className={toolbarButtonClass}
                                            >
                                                {button.icon}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-base-300 bg-base-100 p-1 shadow-sm">
                                {meta.kind === "web" ? (
                                    <button type="button"
                                        onClick={onRequestOpenUrl}
                                        className="h-7 rounded-md px-2 text-[11px] font-medium text-base-content/65 transition-colors hover:bg-base-200 hover:text-base-content"
                                    >
                                        打开链接
                                    </button>
                                ) : null}
                                <button type="button"
                                    onClick={() => setShowHelp(true)}
                                    className="h-7 rounded-md px-2 text-[11px] font-medium text-base-content/65 transition-colors hover:bg-base-200 hover:text-base-content"
                                >
                                    帮助
                                </button>
                                <button type="button"
                                    onClick={() => doSave(renderData)}
                                    disabled={saving}
                                    className="h-7 rounded-md bg-primary px-3 text-[11px] font-semibold text-primary-content transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? "保存中" : saved ? "已保存" : "保存"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div
                className="flex-1 overflow-y-auto overscroll-contain"
                onClick={(e) => {
                    if (domdRef.current?.contains(e.target as Node)) return;
                    editor?.focus();
                }}
            >
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <div ref={domdRef}>
                        <DOMD />
                    </div>
                </div>
            </div>

            {showHelp ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="domd-help-title"
                    onMouseDown={() => setShowHelp(false)}
                >
                    <div
                        className="w-full max-w-xl rounded-lg border border-base-300 bg-base-100 shadow-2xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                            <h2
                                id="domd-help-title"
                                className="text-base font-semibold text-base-content"
                            >
                                MD 编辑帮助
                            </h2>
                            <button type="button"
                                onClick={() => setShowHelp(false)}
                                className="btn btn-xs btn-ghost"
                            >
                                关闭
                            </button>
                        </div>
                        <div className="space-y-4 px-5 py-4 text-sm leading-6 text-base-content/80">
                            <div>
                                <p className="font-medium text-base-content">
                                    常用操作
                                </p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>顶部按钮可插入标题、加粗、斜体、列表、引用、代码块、表格和链接。</li>
                                    <li>直接在正文中输入 Markdown，DOMD 会即时渲染结构。</li>
                                    <li>
                                        保存可点击 Save，也可以使用{" "}
                                        <kbd className="kbd kbd-sm">Cmd</kbd>
                                        /<kbd className="kbd kbd-sm">Ctrl</kbd>
                                        +<kbd className="kbd kbd-sm">S</kbd>。
                                    </li>
                                    <li>保存成功后，HyperRead 会刷新当前预览和标签缓存。</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium text-base-content">
                                    Markdown 示例
                                </p>
                                <pre className="mt-2 overflow-x-auto rounded-md bg-base-200 p-3 text-xs leading-5 text-base-content/80">
{`# 一级标题
## 二级标题
**加粗文字** 和 *斜体文字*
- 列表项
> 引用内容
[链接文字](https://example.com)

\`\`\`js
console.log("hello");
\`\`\`

| 列 | 值 |
| --- | --- |
| 名称 | DOMD |`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
