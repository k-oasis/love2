// src/layouts/IDELayout.tsx
import React from 'react';
import Split from 'react-split';
import { FileExplorer } from '@/components/FileExplorer';
import { Terminal } from '@/components/Terminal';
import { AgentChat } from '@/components/AgentChat';
import { BrowserView } from '@/components/BrowserView';
import { TaskPanel } from '@/components/TaskPanel';
import { TaskContext } from '../App';
import 'react-split/dist/split.css';

export const IDELayout: React.FC = () => {
  const { currentTask, error, onSubmitGoal } = React.useContext(TaskContext);
  
  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
      <Split
        className="flex h-full"
        sizes={[20, 80]}
        minSize={[200, 500]}
        gutterSize={4}
        gutterAlign="center"
        direction="horizontal"
      >
        <div className="h-full bg-card border-r border-border">
          <FileExplorer />
        </div>
        <div className="h-full">
          <Split
            className="flex flex-col h-full"
            sizes={[70, 30]}
            minSize={[200, 100]}
            gutterSize={4}
            gutterAlign="center"
            direction="vertical"
          >
            <div className="flex flex-col h-full">
              <Split
                className="flex h-full"
                sizes={[50, 50]}
                minSize={[300, 300]}
                gutterSize={4}
                gutterAlign="center"
                direction="horizontal"
              >
                <div className="w-full h-full bg-background overflow-auto">
                  <AgentChat />
                </div>
                <div className="w-full h-full bg-background overflow-auto">
                  <BrowserView
                    screenshotData=""
                    status={currentTask?.status ?? 'pending'}
                    progress={currentTask?.progress ?? 0}
                    currentUrl={currentTask?.url}
                  />
                </div>
              </Split>
              <div className="w-full bg-card border-t border-border">
                <Split
                  className="flex h-full"
                  sizes={[70, 30]}
                  minSize={[200, 100]}
                  gutterSize={4}
                  gutterAlign="center"
                  direction="horizontal"
                >
                  <div className="h-full">
                    <Terminal />
                  </div>
                  <div className="h-full border-l border-border">
                    <TaskPanel 
                      onSubmitGoal={onSubmitGoal} 
                      currentTask={currentTask} 
                      error={error} 
                    />
                  </div>
                </Split>
              </div>
            </div>
          </Split>
        </div>
      </Split>
    </div>
  );
};