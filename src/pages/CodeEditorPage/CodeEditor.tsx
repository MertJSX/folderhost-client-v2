import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import CodeEditorComp from '../../components/CodeEditor/CodeEditorComp.jsx';
import useWebSocket from '../../utils/useWebSocket.js';
import axiosInstance from '../../utils/axiosInstance.js';

const CodeEditorPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [editorLanguage, setEditorLanguage] = useState<string>("plaintext");
    const [fileContent, setFileContent] = useState<string>("")
    const path = params.path;
    const [res, setRes] = useState<string>("");
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [fileTitle, setFileTitle] = useState<string>("")
    const {
        isConnected,
        isConnectedRef,
        messages,
        sendMessage
    } = useWebSocket(path.slice(1))

    function handleEditorChange(event) {
        sendChangeToWebSocket(event.changes)
    }

    const sendChangeToWebSocket = useCallback((changes) => {
        if (!isConnectedRef.current || readOnly) return;

        changes.forEach(change => {
            let changeType;
            if (change.text && change.range.startLineNumber !== change.range.endLineNumber ||
                change.range.startColumn !== change.range.endColumn) {
                changeType = 'replace';
            } else if (change.text) {
                changeType = 'insert';
            } else {
                changeType = 'delete';
            }

            const delta = JSON.stringify({
                type: 'editor-change',
                path: path.slice(1),
                change: {
                    type: changeType,
                    range: {
                        startLineNumber: change.range.startLineNumber,
                        startColumn: change.range.startColumn,
                        endLineNumber: change.range.endLineNumber,
                        endColumn: change.range.endColumn
                    },
                    text: change.text || '',
                    timestamp: Date.now()
                }
            });

            console.log("Sending delta:", delta);
            sendMessage(delta);
        });
    }, [readOnly]);

    function readFile() {
        axiosInstance.get(`/read-file?filepath=${path.slice(1)}`
            ).then((data) => {
                if (data.data.res) {
                    setFileTitle(data.data.title);
                    setFileContent(data.data.data);
                    setReadOnly(!data.data.writePermission);
                    setEditorLanguage(detectFileLanguage());
                }
            })
    }

    function detectFileLanguage() {
        const extensionToLanguageMap = {
            "yml": "yaml",
            "yaml": "yaml",
            "js": "javascript",
            "json": "json",
            "ts": "typescript",
            "html": "html",
            "css": "css",
            "php": "php",
            "sh": "shell",
            "bat": "bat",
            "java": "java",
            "kt": "kotlin",
            "py": "python",
            "cs": "csharp",
            "c": "c",
            "cpp": "cpp",
            "sql": "sql",
            "xml": "xml"
        };

        let fileExtension = path.substring(path.lastIndexOf('.') + 1);
        return extensionToLanguageMap[fileExtension] || "plaintext";
    }

    useEffect(() => {
        if (Cookies.get("token")) {
            readFile()
        } else {
            navigate("/login");
        }
    }, [])

    useEffect(() => {
        if (isConnected) {
            setRes("Connected!")
            setTimeout(() => {
                setRes("")
            }, 1000);
            return
        }
        
        setRes("Connection lost")

    }, [isConnected])

    return (
        <div>
            <CodeEditorComp
                handleEditorChange={handleEditorChange}
                editorLanguage={editorLanguage}
                setEditorLanguage={setEditorLanguage}
                fileContent={fileContent}
                response={res}
                title={fileTitle}
                readOnly={readOnly}
                isConnectedRef={isConnectedRef}
                messages={messages}
                setRes={setRes}
            />
        </div>
    )
}

export default CodeEditorPage