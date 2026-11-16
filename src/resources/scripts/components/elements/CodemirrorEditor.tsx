import React, { useCallback, useEffect, useState } from 'react';
import CodeMirror from 'codemirror';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import modes from '@/modes';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/ayu-mirage.css');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/edit/closetag');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/matchtags');
require('codemirror/addon/edit/trailingspace');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/foldgutter.css');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/brace-fold');
require('codemirror/addon/fold/comment-fold');
require('codemirror/addon/fold/indent-fold');
require('codemirror/addon/fold/markdown-fold');
require('codemirror/addon/fold/xml-fold');
require('codemirror/addon/hint/css-hint');
require('codemirror/addon/hint/html-hint');
require('codemirror/addon/hint/javascript-hint');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/sql-hint');
require('codemirror/addon/hint/xml-hint');
require('codemirror/addon/mode/simple');
require('codemirror/addon/dialog/dialog.css');
require('codemirror/addon/dialog/dialog');
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/addon/scroll/scrollpastend');
require('codemirror/addon/scroll/simplescrollbars.css');
require('codemirror/addon/scroll/simplescrollbars');
require('codemirror/addon/search/jump-to-line');
require('codemirror/addon/search/match-highlighter');
require('codemirror/addon/search/matchesonscrollbar.css');
require('codemirror/addon/search/matchesonscrollbar');
require('codemirror/addon/search/search');
require('codemirror/addon/search/searchcursor');

require('codemirror/mode/brainfuck/brainfuck');
require('codemirror/mode/clike/clike');
require('codemirror/mode/css/css');
require('codemirror/mode/dart/dart');
require('codemirror/mode/diff/diff');
require('codemirror/mode/dockerfile/dockerfile');
require('codemirror/mode/erlang/erlang');
require('codemirror/mode/gfm/gfm');
require('codemirror/mode/go/go');
require('codemirror/mode/handlebars/handlebars');
require('codemirror/mode/htmlembedded/htmlembedded');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/mode/http/http');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/jsx/jsx');
require('codemirror/mode/julia/julia');
require('codemirror/mode/lua/lua');
require('codemirror/mode/markdown/markdown');
require('codemirror/mode/nginx/nginx');
require('codemirror/mode/perl/perl');
require('codemirror/mode/php/php');
require('codemirror/mode/properties/properties');
require('codemirror/mode/protobuf/protobuf');
require('codemirror/mode/pug/pug');
require('codemirror/mode/python/python');
require('codemirror/mode/rpm/rpm');
require('codemirror/mode/ruby/ruby');
require('codemirror/mode/rust/rust');
require('codemirror/mode/sass/sass');
require('codemirror/mode/shell/shell');
require('codemirror/mode/smarty/smarty');
require('codemirror/mode/sql/sql');
require('codemirror/mode/swift/swift');
require('codemirror/mode/toml/toml');
require('codemirror/mode/twig/twig');
require('codemirror/mode/vue/vue');
require('codemirror/mode/xml/xml');
require('codemirror/mode/yaml/yaml');

// The ayu-mirage base, recoloured to the v2 palette: paper-3 well, metric hues for the token kinds. Every
// override names the theme class, since the theme sheet loads after this one and wins ties.
const EditorContainer = styled.div`
    min-height: 18rem;
    height: max(18rem, calc(100vh - 17.5rem));
    ${tw`relative`};

    > div {
        ${tw`h-full`};
    }

    .CodeMirror {
        font-family: var(--font-mono);
        font-size: 13px;
        line-height: 1.5rem;
    }

    .cm-s-ayu-mirage.CodeMirror {
        background: var(--color-paper-3);
        color: var(--color-ink-2);
    }

    .cm-s-ayu-mirage .CodeMirror-gutters {
        border-right: 1px solid var(--color-rule);
        background: var(--color-paper-3);
    }

    .cm-s-ayu-mirage .CodeMirror-linenumber {
        padding: 1px 12px 0 12px !important;
        color: var(--color-muted);
    }

    .cm-s-ayu-mirage .CodeMirror-cursor {
        border-left: 2px solid var(--color-accent-text);
    }

    .cm-s-ayu-mirage .CodeMirror-line::selection,
    .cm-s-ayu-mirage .CodeMirror-line > span::selection,
    .cm-s-ayu-mirage .CodeMirror-line > span > span::selection {
        background: color-mix(in oklab, var(--color-accent) 40%, transparent);
    }

    .CodeMirror-foldmarker {
        color: var(--color-muted);
        text-shadow: none;
        margin-left: 0.25rem;
        margin-right: 0.25rem;
    }

    .cm-s-ayu-mirage div.CodeMirror-selected,
    .cm-s-ayu-mirage.CodeMirror-focused div.CodeMirror-selected {
        background: color-mix(in oklab, var(--color-accent) 40%, transparent);
    }

    .cm-s-ayu-mirage .CodeMirror-activeline-background {
        background: var(--color-paper-2);
    }

    .cm-s-ayu-mirage .CodeMirror-matchingbracket {
        color: var(--color-ink) !important;
        background: color-mix(in oklab, var(--color-accent) 30%, transparent);
        text-decoration: none;
    }

    .cm-s-ayu-mirage span.cm-comment {
        color: var(--color-muted);
        font-style: italic;
    }

    .cm-s-ayu-mirage span.cm-keyword,
    .cm-s-ayu-mirage span.cm-meta {
        color: var(--color-mem);
    }

    .cm-s-ayu-mirage span.cm-string,
    .cm-s-ayu-mirage span.cm-string-2 {
        color: var(--color-ok);
    }

    .cm-s-ayu-mirage span.cm-number {
        color: var(--color-warn);
    }

    .cm-s-ayu-mirage span.cm-atom,
    .cm-s-ayu-mirage span.cm-builtin {
        color: var(--color-net);
    }

    .cm-s-ayu-mirage span.cm-def,
    .cm-s-ayu-mirage span.cm-type,
    .cm-s-ayu-mirage span.cm-variable-2,
    .cm-s-ayu-mirage span.cm-variable-3 {
        color: var(--color-accent-text);
    }

    .cm-s-ayu-mirage span.cm-variable,
    .cm-s-ayu-mirage span.cm-operator {
        color: var(--color-ink-2);
    }

    /* After the string rule: JSON keys carry both classes and read as properties. */
    .cm-s-ayu-mirage span.cm-property,
    .cm-s-ayu-mirage span.cm-attribute,
    .cm-s-ayu-mirage span.cm-tag {
        color: var(--color-cpu);
    }
`;

export interface Props {
    style?: React.CSSProperties;
    initialContent?: string;
    mode: string;
    filename?: string;
    onModeChanged: (mode: string) => void;
    fetchContent: (callback: () => Promise<string>) => void;
    onContentSaved: () => void;
    onContentChanged?: (content: string) => void;
}

const findModeByFilename = (filename: string) => {
    for (let i = 0; i < modes.length; i++) {
        const info = modes[i];

        if (info.file && info.file.test(filename)) {
            return info;
        }
    }

    const dot = filename.lastIndexOf('.');
    const ext = dot > -1 && filename.substring(dot + 1, filename.length);

    if (ext) {
        for (let i = 0; i < modes.length; i++) {
            const info = modes[i];
            if (info.ext) {
                for (let j = 0; j < info.ext.length; j++) {
                    if (info.ext[j] === ext) {
                        return info;
                    }
                }
            }
        }
    }

    return undefined;
};

export default ({
    style,
    initialContent,
    filename,
    mode,
    fetchContent,
    onContentSaved,
    onModeChanged,
    onContentChanged,
}: Props) => {
    const [editor, setEditor] = useState<CodeMirror.Editor>();

    const ref = useCallback((node) => {
        if (!node) return;

        const e = CodeMirror.fromTextArea(node, {
            mode: 'text/plain',
            theme: 'ayu-mirage',
            indentUnit: 4,
            smartIndent: true,
            tabSize: 4,
            indentWithTabs: false,
            lineWrapping: true,
            lineNumbers: true,
            foldGutter: true,
            fixedGutter: true,
            scrollbarStyle: 'overlay',
            coverGutterNextToScrollbar: false,
            readOnly: false,
            showCursorWhenSelecting: false,
            autofocus: false,
            spellcheck: true,
            autocorrect: false,
            autocapitalize: false,
            lint: false,
            // @ts-expect-error this property is actually used, the d.ts file for CodeMirror is incorrect.
            autoCloseBrackets: true,
            matchBrackets: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        });

        setEditor(e);
    }, []);

    useEffect(() => {
        if (filename === undefined) {
            return;
        }

        onModeChanged(findModeByFilename(filename)?.mime || 'text/plain');
    }, [filename]);

    useEffect(() => {
        editor && editor.setOption('mode', mode);
    }, [editor, mode]);

    useEffect(() => {
        if (editor) {
            editor.setValue(initialContent || '');
            // Reset the history so that "Ctrl+Z" doesn't delete the intial content
            // we just set above.
            editor.setHistory({ done: [], undone: [] });
        }
    }, [editor, initialContent]);

    useEffect(() => {
        if (!editor || !onContentChanged) return;

        const onChange = () => onContentChanged(editor.getValue());

        editor.on('change', onChange);

        return () => editor.off('change', onChange);
    }, [editor, onContentChanged]);

    useEffect(() => {
        if (!editor) {
            fetchContent(() => Promise.reject(new Error('no editor session has been configured')));
            return;
        }

        editor.addKeyMap({
            'Ctrl-S': () => onContentSaved(),
            'Cmd-S': () => onContentSaved(),
        });

        fetchContent(() => Promise.resolve(editor.getValue()));
    }, [editor, fetchContent, onContentSaved]);

    return (
        <EditorContainer style={style}>
            <textarea ref={ref} />
        </EditorContainer>
    );
};
