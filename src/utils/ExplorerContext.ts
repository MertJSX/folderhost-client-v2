import { createContext, type Context } from "react"
import { type ExplorerContextType } from "../types/ExplorerContextType.js";
import { type ContextMenuType } from "../types/ContextMenuType.js";

const ExplorerContext: Context<ExplorerContextType> = createContext<ExplorerContextType>({
    path: "",
    setPath: ((value: string | ((prev: string) => string)) => {}) as React.SetStateAction<string>,
    readDir: () => {},
    error: "",
    response: "",
    setShowDisabled: ((value: boolean | ((prev: boolean) => boolean)) => {}) as React.SetStateAction<boolean>,
    directory: [],
    setDirectory: ((value: object[] | ((prev: object[]) => object[])) => {}) as React.SetStateAction<object[]>,
    itemInfo: {},
    setItemInfo: ((value: object | ((prev: object) => object)) => {}) as React.SetStateAction<object>,
    isEmpty: false,
    moveItem: () => {},
    getParent: () => "",
    directoryInfo: {},
    downloading: false,
    unzipping: false,
    waitingResponse: false,
    permissions: {},
    unzipProgress: "",
    createCopy: () => {},
    startUnzipping: () => {},
    createItem: () => {},
    deleteItem: () => {},
    renameItem: () => {},
    downloadFile: () => {},
    contextMenu: {
        show: false,
        x: 0,
        y: 0
    },
    setContextMenu: ((value: ContextMenuType) => {}) as React.SetStateAction<ContextMenuType>,
    setMessageBoxMsg: ((value: string | ((prev: string) => string)) => {}) as React.SetStateAction<string>,
    setError: ((value: string | ((prev: string) => string)) => {}) as React.SetStateAction<string>,
    setRes: ((value: string | ((prev: string) => string)) => {}) as React.SetStateAction<string>,
    showDisabled: false
});

export default ExplorerContext;