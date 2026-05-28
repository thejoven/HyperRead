export type FileMeta =
    | { kind: "electron"; docId: string; path: string; name: string }
    | { kind: "tauri"; path: string | null; name: string }
    | {
          kind: "web";
          name: string;
          handle: FileSystemFileHandle | null;
          dirHandle?: FileSystemDirectoryHandle | null;
      };

export type View = "loading" | "editor";
