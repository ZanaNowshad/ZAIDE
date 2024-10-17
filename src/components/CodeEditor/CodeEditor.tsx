import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
  content?: string;
}

interface CodeEditorProps {
  file: FileSystemItem | null;
  onContentChange: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onContentChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: file?.content || '',
        language: getLanguageFromFileName(file?.name || ''),
        theme: 'vs-dark',
        automaticLayout: true,
      });

      monacoEditorRef.current.onDidChangeModelContent(() => {
        const content = monacoEditorRef.current?.getValue() || '';
        onContentChange(content);
      });
    }

    return () => {
      monacoEditorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current && file) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, getLanguageFromFileName(file.name));
      }
      monacoEditorRef.current.setValue(file.content || '');
    }
  }, [file]);

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  return (
    <div ref={editorRef} className="h-full w-full" />
  );
};

export default CodeEditor;