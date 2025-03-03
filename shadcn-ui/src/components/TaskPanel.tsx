import React from 'react';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskPanelProps {
  onSubmitGoal: (goal: string) => Promise<void>;
  currentTask: Task | null;
  error: string | null;
}

export function TaskPanel({
  onSubmitGoal,
  currentTask,
  error
}: TaskPanelProps) {
  const [goalInput, setGoalInput] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmitGoal(goalInput.trim());
      setGoalInput('');
    } catch (err) {
      console.error('Failed to submit goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter your goal..."
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting || !goalInput.trim()}>
            {isSubmitting ? (
              <div className="animate-spin">↻</div>
            ) : (
              <ArrowRightIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      <ScrollArea className="flex-1 p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentTask && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Current Goal</h3>
              <p className="text-sm text-muted-foreground">{currentTask.goal}</p>
            </div>

            {currentTask.subtasks && currentTask.subtasks.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Subtasks</h3>
                <ul className="space-y-2">
                  {currentTask.subtasks.map((subtask, index) => (
                    <li 
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="mt-0.5">•</span>
                      <span>{subtask}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentTask.result && (
              <div>
                <h3 className="font-medium mb-2">Result</h3>
                <pre className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(currentTask.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {!currentTask && !error && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Enter a goal to begin...
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}