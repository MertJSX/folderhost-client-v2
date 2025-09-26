interface WebSocketResponseType {
    type: string,
    err?: string,
    res?: string,
    path?: string,
    totalSize?: string,
    isCompleted?: boolean,
    abortMsg?: string,
    change?: ChangeData
}

interface EditorChange {
    type: string,
    path: string,
    count?: number,
    error?: string,
    change: ChangeData
}

interface ChangeData {
    type: string,
    range: ChangeRange,
    text: string,
    timestamp: number
}

interface ChangeRange {
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number
}

export {type WebSocketResponseType, type EditorChange, type ChangeData, type ChangeRange}