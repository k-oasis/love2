// src/App.tsx
import React, { useEffect, useState } from 'react';
import Split from 'react-split';
import { Badge } from '@/components/ui/badge';
import { TaskPanel } from '@/components/TaskPanel';
import { BrowserView } from '@/components/BrowserView';
import { TaskManager } from '@/services/TaskManager';
import { Task } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import './App.css';
import { useErrorNotification } from '@/hooks/useErrorNotification';
import { ErrorNotification } from '@/components/ui/error-notification';
import ErrorService from '@/services/ErrorService';

function App() {
  const [taskManager] = useState(() => new TaskManager(8080));
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // WebSocket status check
    const wsCheck = setInterval(() => {
      const ws = taskManager.getWebSocket();
      if (ws) {
        setWsStatus(ws.readyState === WebSocket.OPEN ? 'connected' : 'disconnected');
      }
    }, 1000);

    return () => {
      clearInterval(wsCheck);
      taskManager.cleanup();
    };
  }, [taskManager]);

  // Initialize error notification system
  const { notifications, clearNotification } = useErrorNotification();

  const handleSubmitGoal = async (goal: string) => {
    try {
      setError(null);
      const task = await taskManager.parseGoal(goal);
      setCurrentTask(task);
      
      // Start task execution
      const executingTask = await taskManager.executeNext();
      if (executingTask) {
        setCurrentTask(executingTask);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit goal';
      setError(errorMessage);
      
      // Report error through ErrorService
      ErrorService.getInstance().reportError(
        'Goal Submission Failed',
        errorMessage,
        'P1',
        {
          componentName: 'TaskPanel',
          metadata: { goal }
        }
      );
    }
  };

  // Update task status on changes
  useEffect(() => {
    const taskUpdateInterval = setInterval(() => {
      if (currentTask) {
        const updatedTask = taskManager.getTask(currentTask.id);
        if (updatedTask && JSON.stringify(updatedTask) !== JSON.stringify(currentTask)) {
          setCurrentTask(updatedTask);
          
          // Show notifications for status changes
          if (updatedTask.status !== currentTask.status) {
            if (updatedTask.status === 'completed') {
              toast.success('Task completed successfully');
            } else if (updatedTask.status === 'failed') {
              const errorMessage = updatedTask.error || 'Task failed';
              ErrorService.getInstance().reportError(
                'Task Execution Failed',
                errorMessage,
                'P0',
                {
                  componentName: 'TaskManager',
                  metadata: { taskId: updatedTask.id }
                }
              );
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(taskUpdateInterval);
  }, [currentTask, taskManager]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header with connection status */}
      <div className="h-12 border-b border-border flex items-center px-4 justify-between">
        <h1 className="text-lg font-semibold">Personal Agent Workspace</h1>
        <Badge
          variant={wsStatus === 'connected' ? 'default' : 'destructive'}
          className="capitalize"
        >
          {wsStatus}
        </Badge>
      </div>

      {/* Main content area with split panels */}
      <Split
        className="flex-1 flex"
        sizes={[30, 70]}
        minSize={[200, 400]}
        expandToMin={false}
        gutterSize={4}
        gutterAlign="center"
        direction="horizontal"
      >
        {/* Task Panel */}
        <div className="h-full overflow-hidden">
          <TaskPanel
            onSubmitGoal={handleSubmitGoal}
            currentTask={currentTask}
            error={error}
          />
        </div>

        {/* Browser View */}
        <div className="h-full overflow-hidden">
          <BrowserView
            screenshotData=""
            status={currentTask?.status || 'pending'}
            progress={currentTask?.progress || 0}
            currentUrl={currentTask?.url}
            error={currentTask?.error}
          />
        </div>
      </Split>

      {/* Error notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {notifications.map(notification => (
          <ErrorNotification
            key={notification.id}
            notification={notification}
            onClose={() => clearNotification(notification.id)}
          />
        ))}
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;