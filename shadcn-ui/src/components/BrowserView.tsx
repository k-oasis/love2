import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';

interface BrowserViewProps {
  screenshotData: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentUrl?: string;
  error?: string;
}

export function BrowserView({
  screenshotData,
  status,
  progress,
  currentUrl,
  error
}: BrowserViewProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'running':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header with status and URL */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          {currentUrl && (
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {currentUrl}
            </span>
          )}
        </div>
        {status === 'running' && (
          <Progress value={progress} className="w-[100px]" />
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4 overflow-auto">
        {error ? (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : status === 'completed' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CheckCircledIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Task completed successfully</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            {screenshotData ? (
              <img
                src={screenshotData}
                alt="Browser screenshot"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {status === 'pending' 
                    ? 'Waiting to start...'
                    : 'Processing...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress footer */}
      {status === 'running' && (
        <div className="p-4 border-t border-border">
          <Progress value={progress} className="w-full mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Progress: {Math.round(progress)}%
          </p>
        </div>
      )}
    </Card>
  );
}