interface DomdElectronInitialDocument {
    docId: string;
    filePath: string;
    fileName: string;
    content: string;
}

interface DomdElectronSaveResult {
    ok: true;
    filePath: string;
    content: string;
}

interface Window {
    domdElectron?: {
        getInitialDocument(): Promise<DomdElectronInitialDocument>;
        getDocumentBaseDir(): Promise<string | null>;
        readImage(path: string): Promise<string>;
        saveDocument(content: string): Promise<DomdElectronSaveResult>;
        setDirty(dirty: boolean): void;
    };
}
