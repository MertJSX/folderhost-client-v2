import { type ContextMenuType } from "./ContextMenuType.js"
import React from "react"
import { type DirectoryItem } from "./DirectoryItem.js"
import { type AccountPermissions } from "./AccountPermissions.js"
export interface ExplorerContextType {
        path: string,
        setPath: React.Dispatch<React.SetStateAction<string>>,
        readDir: Function,
        error: string,
        response: string,
        setShowDisabled: React.Dispatch<React.SetStateAction<boolean>>,
        directory: DirectoryItem[] | null,
        setDirectory: React.Dispatch<React.SetStateAction<DirectoryItem[]>>,
        itemInfo: DirectoryItem,
        setItemInfo: React.Dispatch<React.SetStateAction<DirectoryItem>>,
        isEmpty: boolean,
        moveItem: Function,
        getParent: Function,
        directoryInfo: DirectoryItem,
        downloading: boolean,
        unzipping: boolean,
        waitingResponse: boolean,
        permissions: AccountPermissions,
        unzipProgress: string,
        createCopy: Function,
        startUnzipping: Function,
        createItem: Function,
        deleteItem: Function,
        renameItem: Function,
        downloadFile: Function,
        contextMenu: ContextMenuType,
        setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuType>>,
        setMessageBoxMsg: React.Dispatch<React.SetStateAction<string>>,
        setError: React.Dispatch<React.SetStateAction<string>>,
        setRes: React.Dispatch<React.SetStateAction<string>>,
        showDisabled: boolean,
        downloadProgress: number
}