import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
  content?: string;
}

interface TerminalProps {
  fileSystem: FileSystemItem[];
}

const Terminal: React.FC<TerminalProps> = ({ fileSystem }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isTerminalReady, setIsTerminalReady] = useState(false);
  const [interpreterActive, setInterpreterActive] = useState(false);
  const [currentPath, setCurrentPath] = useState('/home/project');

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    const initializeTerminal = () => {
      if (terminalRef.current && !xtermRef.current) {
        try {
          xtermRef.current = new XTerm({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          });

          fitAddonRef.current = new FitAddon();
          xtermRef.current.loadAddon(fitAddonRef.current);

          setTimeout(() => {
            if (xtermRef.current && terminalRef.current) {
              xtermRef.current.open(terminalRef.current);
              fitAddonRef.current?.fit();
              xtermRef.current.writeln('Welcome to ZAI-IDE Terminal');
              xtermRef.current.writeln('Type "help" for available commands');
              setIsTerminalReady(true);
              promptUser();
            }
          }, 0);

          xtermRef.current.onKey(({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.keyCode === 13) {
              const currentLine = xtermRef.current?.buffer.active.getLine(xtermRef.current.buffer.active.length - 1)?.translateToString();
              if (currentLine) {
                processCommand(currentLine.trim());
              }
              xtermRef.current?.writeln('');
            } else if (printable) {
              xtermRef.current?.write(key);
            }
          });

          resizeObserver = new ResizeObserver(() => {
            if (isTerminalReady && fitAddonRef.current) {
              fitAddonRef.current.fit();
            }
          });

          resizeObserver.observe(terminalRef.current);
        } catch (error) {
          console.error('Error initializing terminal:', error);
        }
      }
    };

    initializeTerminal();

    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  const promptUser = () => {
    if (xtermRef.current) {
      xtermRef.current.write(`${currentPath} $ `);
    }
  };

  const processCommand = (command: string) => {
    if (xtermRef.current) {
      const [cmd, ...args] = command.split(' ');
      switch (cmd.toLowerCase()) {
        case 'help':
          showHelp();
          break;
        case 'ls':
          listFiles(args[0]);
          break;
        case 'cd':
          changeDirectory(args[0]);
          break;
        case 'cat':
          catFile(args[0]);
          break;
        case 'pwd':
          xtermRef.current.writeln(currentPath);
          break;
        case 'echo':
          xtermRef.current.writeln(args.join(' '));
          break;
        case 'clear':
          xtermRef.current.clear();
          break;
        default:
          xtermRef.current.writeln(`Command not found: ${cmd}`);
      }
      promptUser();
    }
  };

  const showHelp = () => {
    if (xtermRef.current) {
      xtermRef.current.writeln('Available commands:');
      xtermRef.current.writeln('  help - Show this help message');
      xtermRef.current.writeln('  ls [path] - List files and directories');
      xtermRef.current.writeln('  cd <path> - Change current directory');
      xtermRef.current.writeln('  cat <file> - Display file contents');
      xtermRef.current.writeln('  pwd - Print working directory');
      xtermRef.current.writeln('  echo <message> - Display a message');
      xtermRef.current.writeln('  clear - Clear the terminal screen');
    }
  };

  const listFiles = (path?: string) => {
    const targetPath = path ? `${currentPath}/${path}` : currentPath;
    const items = getItemsAtPath(targetPath);
    if (xtermRef.current) {
      if (items) {
        items.forEach(item => {
          const itemType = item.type === 'folder' ? 'd' : '-';
          xtermRef.current?.writeln(`${itemType} ${item.name}`);
        });
      } else {
        xtermRef.current.writeln(`No such directory: ${targetPath}`);
      }
    }
  };

  const changeDirectory = (path: string) => {
    if (path === '..') {
      const parts = currentPath.split('/');
      if (parts.length > 2) {
        parts.pop();
        setCurrentPath(parts.join('/'));
      }
    } else {
      const newPath = `${currentPath}/${path}`;
      const item = getItemAtPath(newPath);
      if (item && item.type === 'folder') {
        setCurrentPath(newPath);
      } else {
        xtermRef.current?.writeln(`No such directory: ${newPath}`);
      }
    }
  };

  const catFile = (path: string) => {
    const filePath = `${currentPath}/${path}`;
    const file = getItemAtPath(filePath);
    if (file && file.type === 'file' && file.content) {
      xtermRef.current?.writeln(file.content);
    } else {
      xtermRef.current?.writeln(`No such file: ${filePath}`);
    }
  };

  const getItemsAtPath = (path: string): FileSystemItem[] | null => {
    const parts = path.split('/').filter(Boolean);
    let currentItems = fileSystem;
    for (const part of parts) {
      const folder = currentItems.find(item => item.name === part && item.type === 'folder');
      if (folder && folder.children) {
        currentItems = folder.children;
      } else {
        return null;
      }
    }
    return currentItems;
  };

  const getItemAtPath = (path: string): FileSystemItem | null => {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop();
    const parentPath = `/${parts.join('/')}`;
    const parentItems = getItemsAtPath(parentPath);
    if (parentItems) {
      return parentItems.find(item => item.name === fileName) || null;
    }
    return null;
  };

  return <div ref={terminalRef} className="h-full w-full bg-black" />;
};

export default Terminal;