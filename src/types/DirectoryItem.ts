export interface DirectoryItem {
    id: string,
    name: string,
    parentPath: string,
    path: string,
    isDirectory: boolean,
    dateModified: string,
    size: string,
    sizeBytes: number,
    storage_limit: string
}