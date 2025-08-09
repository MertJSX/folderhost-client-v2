export const jsSnippets = (monaco) => {
    return [
        {
            label: 'funcion',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `function \${1:name}() {\n\t$0\n}`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Creates a new function'
        },
        {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `if (\${1:condition}) {\n\t$0\n}`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Creates a new function'
        },
        {
            label: 'switch',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `switch (\${1:key}) {\n\tcase value:\n\t\t\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Creates a new switch statement'
        },
        {
            label: 'log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `console.log(\${1:});`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Console log output'
        },
        {
            label: 'warn',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `console.warn(\${1:});`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Console warn output'
        },
        {
            label: 'error',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `console.error(\${1:});`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Console error output'
        }
    ];
}