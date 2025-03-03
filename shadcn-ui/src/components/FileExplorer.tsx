// src/components/FileExplorer.tsx
import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, File } from 'lucide-react';
import { cn } from "@/lib/utils"

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const mockFiles: FileNode[] = [
  {
    name: 'src',
    type: 'directory',
    children: [
      { name: 'components', type: 'directory', children: [
        { name: 'FileExplorer.tsx', type: 'file' },
        { name: 'Terminal.tsx', type: 'file' },
      ]},
      { name: 'App.tsx', type: 'file' },
    ]
  },
  {
    name: 'public',
    type: 'directory',
    children: [
      { name: 'index.html', type: 'file' },
    ]
  }
];

const FileTreeNode: React.FC<{ node: FileNode; depth: number }> = ({ node, depth }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div 
        className={cn(
          "flex items-center hover:bg-muted/50 px-2 py-1 cursor-pointer",
          "text-sm text-muted-foreground"
        )}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={() => node.type === 'directory' && setIsOpen(!isOpen)}
      >
        {node.type === 'directory' ? (
          <>
            {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <Folder className="h-4 w-4 mr-2" />
          </>
        ) : (
          <File className="h-4 w-4 mr-2 ml-5" />
        )}
        {node.name}
      </div>
      {isOpen && node.children?.map((child, index) => (
        <FileTreeNode key={index} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export const FileExplorer: React.FC = () => {
  return (
    <div className="h-full p-2">
      <div className="text-sm font-medium mb-2">Explorer</div>
      {mockFiles.map((node, index) => (
        <FileTreeNode key={index} node={node} depth={0} />
      ))}
    </div>
  );
};