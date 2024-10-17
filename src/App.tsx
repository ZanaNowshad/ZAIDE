import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import CodeEditor from './components/CodeEditor/CodeEditor';
import Terminal from './components/Terminal/Terminal';
import AIChatPopup from './components/AIChatPopup/AIChatPopup';
import { Sidebar as SidebarIcon, Terminal as TerminalIcon, MessageSquare } from 'lucide-react';

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
  content?: string;
}

const initialFileSystem: FileSystemItem[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Sidebar.tsx', type: 'file', content: '// Sidebar component code' },
          { name: 'Terminal.tsx', type: 'file', content: '// Terminal component code' },
          { name: 'CodeEditor.tsx', type: 'file', content: '// CodeEditor component code' },
          { name: 'AIChatPopup.tsx', type: 'file', content: '// AIChatPopup component code' },
        ],
      },
      { name: 'App.tsx', type: 'file', content: '// App component code' },
      { name: 'main.tsx', type: 'file', content: '// Main entry point' },
      { name: 'index.css', type: 'file', content: '/* Global styles */' },
    ],
  },
  { name: 'package.json', type: 'file', content: '{\n  "name": "zai-ide",\n  "version": "1.0.0"\n}' },
  { name: 'tsconfig.json', type: 'file', content: '{\n  "compilerOptions": {\n    "strict": true\n  }\n}' },
  { name: 'vite.config.ts', type: 'file', content: 'import { defineConfig } from "vite";\n\nexport default defineConfig({});' },
];

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(initialFileSystem);
  const [currentFile, setCurrentFile] = useState<FileSystemItem | null>(null);

  useEffect(() => {
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleFileSelect = (file: FileSystemItem) => {
    setCurrentFile(file);
  };

  const handleFileChange = (newContent: string) => {
    if (currentFile) {
      const updatedFileSystem = updateFileContent(fileSystem, currentFile.name, newContent);
      setFileSystem(updatedFileSystem);
      setCurrentFile({ ...currentFile, content: newContent });
    }
  };

  const updateFileContent = (items: FileSystemItem[], fileName: string, newContent: string): FileSystemItem[] => {
    return items.map(item => {
      if (item.name === fileName && item.type === 'file') {
        return { ...item, content: newContent };
      } else if (item.children) {
        return { ...item, children: updateFileContent(item.children, fileName, newContent) };
      }
      return item;
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {isSidebarOpen && <Sidebar fileSystem={fileSystem} onFileSelect={handleFileSelect} />}
      <div className="flex flex-col flex-grow">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded hover:bg-gray-200">
              <SidebarIcon size={20} />
            </button>
            <h1 className="text-xl font-semibold">ZAI-IDE</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="p-2 rounded hover:bg-gray-200">
              <TerminalIcon size={20} />
            </button>
            <button onClick={() => setIsAIChatOpen(!isAIChatOpen)} className="p-2 rounded hover:bg-gray-200">
              <MessageSquare size={20} />
            </button>
          </div>
        </header>
        <main className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow">
            <CodeEditor
              file={currentFile}
              onContentChange={handleFileChange}
            />
          </div>
          {isTerminalOpen && (
            <div className="h-64 border-t border-gray-300">
              <Terminal fileSystem={fileSystem} />
            </div>
          )}
        </main>
      </div>
      {isAIChatOpen && <AIChatPopup onClose={() => setIsAIChatOpen(false)} />}
    </div>
  );
}

export default App;