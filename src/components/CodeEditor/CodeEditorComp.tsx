import { Editor } from '@monaco-editor/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { htmlSnippets } from './snippets/htmlSnippets';
import { jsSnippets } from './snippets/jsSnippets';
import { yamlSnippets } from './snippets/yamlSnippets';
import theme from './themes/theme.json' with { type: 'json' }
import Cookies from 'js-cookie';
import type { ChangeData, EditorChange } from '../../types/CodeEditorTypes';
import type { Monaco } from '@monaco-editor/react';

// Monaco Editor tip tanımlamaları
// import type monaco from 'monaco-editor';
import { editor, Position } from 'monaco-editor';

interface CodeEditorCompProps {
  editorLanguage: string,
  handleEditorChange: (event: editor.IModelContentChangedEvent) => void,
  setEditorLanguage: React.Dispatch<React.SetStateAction<string>>,
  fileContent: string,
  response: string,
  title: string,
  readOnly: boolean,
  messages: Array<string>,
  isConnectedRef: React.RefObject<Boolean>,
  setRes: React.Dispatch<React.SetStateAction<string>>,
  setFileContent: React.Dispatch<React.SetStateAction<string>>,
  setReadOnly: React.Dispatch<React.SetStateAction<boolean>>
}

const CodeEditorComp: React.FC<CodeEditorCompProps> = ({
  editorLanguage,
  handleEditorChange,
  setEditorLanguage,
  fileContent,
  response,
  title,
  readOnly,
  messages,
  isConnectedRef,
  setRes,
  setFileContent,
  setReadOnly
}) => {
  const [editorFontSize, setEditorFontSize] = useState<number>(parseInt(Cookies.get("editor-fontsize") ?? "18", 10) || 18);
  const [minimap, setMinimap] = useState<boolean>(Cookies.get("editor-minimap") === "false" ? false : true);
  const [toggleSettings, setToggleSettings] = useState<boolean>(false);
  const [clientsCount, setClientsCount] = useState<number>(0)
  const isRemoteChangeRef = useRef<boolean>(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
    editorRef.current = editor;

    monacoInstance.editor.defineTheme('vs-dark', theme as any);

    monacoInstance.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model: editor.ITextModel, position: Position) => {
        let suggestions = htmlSnippets(monacoInstance).map(snippet => ({
          ...snippet,
          range,
        }));
        const textBeforePosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const scriptOpen = /<script[^>]*>/gi;
        const scriptClose = /<\/script>/gi;

        let match;
        let lastOpenIndex = -1;
        let lastCloseIndex = -1;

        while ((match = scriptOpen.exec(textBeforePosition))) {
          lastOpenIndex = match.index;
        }

        while ((match = scriptClose.exec(textBeforePosition))) {
          lastCloseIndex = match.index;
        }

        const inScriptTag = lastOpenIndex > lastCloseIndex;

        if (inScriptTag) {
          const suggestions = jsSnippets(monacoInstance).map(snippet => ({
            ...snippet,
            range,
          }));
          return { suggestions: suggestions };
        }

        return { suggestions: suggestions };
      }
    });

    monacoInstance.languages.registerCompletionItemProvider("javascript", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = jsSnippets(monacoInstance).map(snippet => ({
          ...snippet,
          range,
        }));

        return { suggestions };
      },
    });

    monacoInstance.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        let suggestions = yamlSnippets(monacoInstance).map(snippet => ({
          ...snippet,
          range
        }))
        return { suggestions: suggestions };
      }
    });

    editor.onDidChangeModelContent((event: editor.IModelContentChangedEvent) => {
      console.log(event);

      if (readOnly) {
        editor.trigger("myapp", "undo", "");
        return;
      }

      if (isRemoteChangeRef.current) {
        isRemoteChangeRef.current = false;
        return;
      }

      handleEditorChange(event);
    });

    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [
        monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS
      ],
      run: () => {
        console.log("Already saved!");
      }
    });

    editor.addAction({
      id: 'undo-file',
      label: 'Undo File',
      keybindings: [
        monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyZ
      ],
      run: () => {
        editor.trigger("myapp", "undo", "");
      }
    });

    editor.addAction({
      id: 'redo-file',
      label: 'Redo File',
      keybindings: [
        monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyZ
      ],
      run: () => {
        editor.trigger("myapp", "redo", "");
      }
    });
  }, [handleEditorChange, readOnly]);

  useEffect(() => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      const model = editorRef.current.getModel();

      if (model) {
        model.setValue(fileContent);
        if (position) {
          editorRef.current.setPosition(position);
        }
        editorRef.current.updateOptions({ readOnly: readOnly });
      }
    }
  }, [readOnly, fileContent]);

  useEffect(() => {
    if (isConnectedRef.current && messages.length > 0) {
      let message: EditorChange;

      try {
        message = JSON.parse(messages[messages.length - 1] ?? "");
      } catch (err) {
        console.warn(messages[messages.length - 1]);
        console.error(err);
        return;
      }

      switch (message.type) {
        case "editor-change":
          isRemoteChangeRef.current = true;
          if (message.change) {
            applyRemoteChange(message.change);
          }
          break;
        case "editor-update-usercount":
          setClientsCount(message.count ?? 0);
          break;
        case "error":
          setRes(message.error ?? "Unknown error");
          break;
        case "file-changed-externally":
          setRes("File changed externally! Please refresh!");
          setReadOnly(true);
          break;
        case "full-content-update":
          if (message.content) {
            setFileContent(message.content)
          }
          break;
      }
    }
  }, [messages, isConnectedRef, setRes]);

  const applyRemoteChange = (change: ChangeData) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();

    if (!model) return;

    switch (change.type) {
      case 'insert':
        model.applyEdits([{
          range: change.range,
          text: change.text,
          forceMoveMarkers: true
        }]);
        break;
      case 'delete':
        model.applyEdits([{
          range: change.range,
          text: '',
          forceMoveMarkers: true
        }]);
        break;
      case 'replace':
        model.applyEdits([{
          range: change.range,
          text: change.text,
          forceMoveMarkers: true
        }]);
        break;
      case 'full':
        if (change.content !== undefined) {
          model.setValue(change.content);
        }
        break;
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 p-2 flex-nowrap">
          <h1 className='text-lg px-5 text-green-400'>Online: <span className='text-emerald-300'>{clientsCount}</span></h1>
          <h1 className='text-lg italic px-5 text-gray-400 text-nowrap'>Editing: <span className='text-emerald-300'>{title}</span></h1>
          <button
            className='text-lg px-6 border-2 bg-gray-700 hover:bg-gray-800 active:bg-gray-700 border-slate-400 rounded-lg'
            onClick={() => {
              setToggleSettings(!toggleSettings);
            }}
          >
            Settings
          </button>

          <h1 className='text-amber-200 text-xl'>{response}</h1>
        </div>
        <div className="flex flex-row w-full justify-center">
          <Editor
            className='mx-auto'
            width={toggleSettings ? "65vw" : "90vw"}
            height="90vh"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              fontSize: editorFontSize,
              tabCompletion: "on",
              smoothScrolling: true,
              cursorSmoothCaretAnimation: "on",
              readOnly: readOnly,
              domReadOnly: readOnly,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              minimap: {
                enabled: minimap,
                renderCharacters: false,
                maxColumn: 120
              },
              scrollBeyondLastLine: false,
              renderWhitespace: 'none',
              unicodeHighlight: {
                ambiguousCharacters: true,
                includeComments: true,
                includeStrings: true,
              }
            }}
            language={editorLanguage}
            value={fileContent}
          />
          {toggleSettings && (
            <div className='flex flex-col bg-gray-800 w-[25%] h-auto items-center gap-2 pt-2 rounded-r-3xl'>
              <h1 className="text-center text-4xl italic font-bold">Settings</h1>
              <div className="flex">
                <h1 className='text-lg italic text-nowrap'>Mode:</h1>
                <select
                  className='bg-slate-600 font-bold text-lg px-2 mx-2'
                  value={editorLanguage}
                  onChange={(e) => {
                    setEditorLanguage(e.target.value);
                  }}
                >
                  <option value="javascript">Javascript</option>
                  <option value="typescript">Typescript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="php">PHP</option>
                  <option value="yaml">YAML / YML</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="shell">Shell</option>
                  <option value="bat">BAT</option>
                  <option value="java">Java</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="python">Python</option>
                  <option value="csharp">C#</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="sql">SQL</option>
                  <option value="mysql">MYSQL</option>
                  <option value="plaintext">Plain text</option>
                </select>
              </div>
              <div className="flex">
                <h1 className='text-lg italic text-nowrap'>Font size:</h1>
                <input
                  className='bg-gray-600 text-center px-0 mx-2 w-14'
                  type="number"
                  value={editorFontSize}
                  min={5}
                  max={100}
                  step={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setEditorFontSize(value);
                    Cookies.set("editor-fontsize", value.toString());
                  }}
                />px
              </div>
              <div className="flex">
                <h1 className='text-lg italic text-nowrap'>Minimap:</h1>
                <select
                  className='bg-slate-600 font-bold px-2 mx-2 w-full'
                  value={minimap.toString()}
                  onChange={(e) => {
                    setMinimap(e.target.value === "true");
                    Cookies.set("editor-minimap", e.target.value);
                  }}
                >
                  <option value={"true"}>Enabled</option>
                  <option value={"false"}>Disabled</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditorComp;