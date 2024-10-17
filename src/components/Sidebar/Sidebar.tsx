import React, { useState } from 'react';
import { FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
  content?: string;
}

interface SidebarProps {
  fileSystem: FileSystemItem[];
  onFileSelect: (file: FileSystemItem) => void;
}

const FileSystemItem: React.FC<{ 
  item: FileSystemItem; 
  depth: number; 
  onFileSelect: (file: FileSystemItem) => void;
}> = ({ item, depth, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const handleClick = () => {
    if (item.type === 'file') {
      onFileSelect(item);
    } else {
      toggleOpen();
    }
  };

  return (
    <div style={{ marginLeft: `${depth * 10}px` }}>
      <div
        className="flex items-center p-1 hover:bg-gray-700 cursor-pointer"
        onClick={handleClick}
      >
        {item.type === 'folder' && (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        )}
        {item.type === 'folder' ? (
          <FolderOpen size={16} className="mr-2" />
        ) : (
          <File size={16} className="mr-2" />
        )}
        <span>{item.name}</span>
      </div>
      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileSystemItem key={index} item={child} depth={depth + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ fileSystem, onFileSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filterFileSystem = (items: FileSystemItem[], term: string): FileSystemItem[] => {
    return items.filter(item => {
      if (item.name.toLowerCase().includes(term.toLowerCase())) {
        return true;
      }
      if (item.children) {
        const filteredChildren = filterFileSystem(item.children, term);
        return filteredChildren.length > 0;
      }
      return false;
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterFileSystem(item.children, term)
        };
      }
      return item;
    });
  };

  const filteredFileSystem = searchTerm ? filterFileSystem(fileSystem, searchTerm) : fileSystem;

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search files..."
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex-grow overflow-auto">
        {filteredFileSystem.map((item, index) => (
          <FileSystemItem key={index} item={item} depth={0} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;