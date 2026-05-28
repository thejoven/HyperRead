export const isTauri = (): boolean =>
    typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const isElectronHost = (): boolean =>
    typeof window !== "undefined" && !!window.domdElectron;

export const isMdPath = (p: string): boolean => /\.(md|markdown)$/i.test(p);
