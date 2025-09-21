import Editor from '@monaco-editor/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { htmlSnippets } from './snippets/htmlSnippets';
import { jsSnippets } from './snippets/jsSnippets';
import { yamlSnippets } from './snippets/yamlSnippets';
import theme from './themes/theme.json'
import Cookies from 'js-cookie';

const CodeEditorComp = ({ editorLanguage, handleEditorChange, setEditorLanguage, fileContent, response, title, readOnly, messages, isConnectedRef }) => {
  const [editorFontSize, setEditorFontSize] = useState(Cookies.get("editor-fontsize") || 18);
  const [minimap, setMinimap] = useState(Cookies.get("editor-minimap") || true);
  const [toggleSettings, setToggleSettings] = useState(false);
  const [clientsCount, setClientsCount] = useState(0)
  const isRemoteChangeRef = useRef(false);
  const editorRef = useRef(null);

  const handleEditorDidMount = useCallback((editor, monaco) => {

    editorRef.current = editor;

    monaco.editor.defineTheme('vs-dark', theme);

    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model, position) => {
        let suggestions = htmlSnippets(monaco);
        const textBeforePosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

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
          return { suggestions: jsSnippets(monaco) };
        }

        return { suggestions: suggestions };
      }
    });
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: () => {
        let suggestions = jsSnippets(monaco)
        return { suggestions: suggestions };
      }
    });
    monaco.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: () => {
        let suggestions = yamlSnippets(monaco)
        return { suggestions: suggestions };
      }
    });

    editor.onDidChangeModelContent((event) => {
      console.log("On did change model content");
      console.log(event);

      if (readOnly) {
        editor.trigger("myapp", "undo");
        return;
      }

      if (isRemoteChangeRef.current) {
        isRemoteChangeRef.current = false;
        return;
      }

      handleEditorChange(event)

    })

    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
      ],
      run: () => {
        console.log("Already saved!");
      }
    });

    editor.addAction({
      id: 'undo-file',
      label: 'Undo File',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ
      ],
      run: () => {
        editor.trigger("myapp", "undo");
      }
    });

    editor.addAction({
      id: 'redo-file',
      label: 'Redo File',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Shift | monaco.KeyCode.KeyZ
      ],
      run: () => {
        editor.trigger("myapp", "redo");
      }
    });
  });

  useEffect(() => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();

      editorRef.current.getModel().setValue(fileContent);
      editorRef.current.setPosition(position);
      editorRef.current.updateOptions({ readOnly: readOnly })
    }

  }, [readOnly, fileContent])

  useEffect(() => {
    if (isConnectedRef.current) {
      let message = {};
      
      try {
        message = JSON.parse(messages[messages.length - 1]);
      } catch (err) {
        console.warn(messages[messages.length - 1]);
        
        console.error(err);
        return
      }

      switch (message.type) {
        case "editor-change":
          isRemoteChangeRef.current = true;
          applyRemoteChange(message.change)
          break;
        case "editor-update-usercount":
          setClientsCount(message.count)
          break;
      }
    }
  }, [messages])

  const applyRemoteChange = (change) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();

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
        model.setValue(change.content);
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
              setToggleSettings(!toggleSettings)
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
              readOnlyMessage: true,
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
                invincibleCharacters: true,
                selectOnLineNumbers: true,
                autoClosingBrackets: 'always',
                snippetSuggestions: 'inline',
                suggestOnTriggerCharacters: true,
                tabCompletion: 'on',
                wordBasedSuggestions: true
              }
            }}
            language={editorLanguage}
            value={fileContent}
          />
          {
            toggleSettings ?
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
                      setEditorFontSize(parseInt(e.target.value, 10));
                      Cookies.set("editor-fontsize", parseInt(e.target.value, 10))
                    }} />px
                </div>
                <div className="flex">
                  <h1 className='text-lg italic text-nowrap'>Minimap:</h1>
                  <select
                    className='bg-slate-600 font-bold px-2 mx-2 w-full'
                    value={minimap}
                    onChange={(e) => {
                      setMinimap(e.target.value);
                      Cookies.set("editor-minimap", e.target.value)
                    }}
                  >
                    <option value={true}>Enabled</option>
                    <option value={false}>Disabled</option>
                  </select>
                </div>
              </div> :
              null

          }

        </div>
      </div>
    </div>
  );
};

export default CodeEditorComp;
