import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import CodeEditorComp from '../../components/CodeEditor/CodeEditorComp';

const CodeEditorPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [editorLanguage, setEditorLanguage] = useState("plaintext");
    const [fileContent, setFileContent] = useState("")
    const path = params.path;
    const [res, setRes] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [fileTitle, setFileTitle] = useState("")
    const socket = useRef();
    const throttleTimeout = useRef(null);
    const [throttleDelay, setThrottleDelay] = useState(Cookies.get("editor-throttle") || 200)

    function handleEditorChange(value, event) {
        const THROTTLE_DELAY = throttleDelay; // 200ms delay to throttle changes

        console.log(THROTTLE_DELAY);
        

        if (throttleTimeout.current) {
            clearTimeout(throttleTimeout.current);
        }

        throttleTimeout.current = setTimeout(() => {
            socket.current.emit("change-file", { path: path.slice(1), content: value });
        }, THROTTLE_DELAY);
    }
    function readFile() {
        axios.post(`${Cookies.get("ip")}/api/read-file?filepath=${path.slice(1)}`,
            { token: Cookies.get("token") }).then((data) => {
                console.log(data.data);
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
        if (Cookies.get("ip") && Cookies.get("token")) {
            readFile(false)
        } else {
            navigate("/login");
        }
    }, [])

    useEffect(() => {
        if (!socket.current) {
            socket.current = io(Cookies.get("ip"), { auth: { token: Cookies.get("token"), watch: path.slice(1) } });
            socket.current.on('connect_error', (err) => {
                console.error("Socket connect error");
                setTimeout(() => {
                    // setRes(`Socket: ${err.message}`)
                    setRes(`Socket: Cannot connect to the server!`)
                    setTimeout(() => {
                        setRes("")
                    }, 5000);
                }, 3000);
            })
            socket.current.on('connect', () => {
                console.log('Connected to the server');
                socket.current.on('file-changed', (res) => {
                    if (res.path === path.slice(1)) {
                        setFileContent(res.fileContent)
                    }
                });
                socket.current.on('error', (res) => {
                    console.error(res);
                    setRes(res.err)
                    setTimeout(() => {
                        setRes("")
                    }, 5000);
                });
                socket.current.on('disconnect', (reason) => {
                    console.log(`Disconnected from the server: ${reason}`);
                    // socket.current = null;
                });
            });
        }

        return () => {
            if (socket.current) {
                socket.current.off('connect');
                socket.current.off('file-changed');
                socket.current.off('disconnect');
                socket.current.off('error');
                socket.current.off('connect_error');
            }
        };
    }, [])

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
                throttleDelay={throttleDelay}
                setThrottleDelay={setThrottleDelay}
            />
        </div>
    )
}

export default CodeEditorPage