import { ErrorContext, ErrorNotification, ErrorSeverity } from '@/types/error';

class ErrorService {
  private static instance: ErrorService;
  private ws: WebSocket | null = null;

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public reportError(
    title: string,
    message: string,
    severity: ErrorSeverity,
    context: Omit<ErrorContext, 'timestamp'>
  ): void {
    const errorNotification: ErrorNotification = {
      id: crypto.randomUUID(),
      severity,
      title,
      message,
      context: {
        ...context,
        timestamp: Date.now(),
      },
      read: false,
      createdAt: Date.now(),
    };

    // Send error notification through WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(errorNotification));
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', errorNotification);
    }
  }

  public connect(url: string): void {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(url);
    
    this.ws.addEventListener('open', () => {
      console.log('Error reporting WebSocket connected');
    });

    this.ws.addEventListener('close', () => {
      console.log('Error reporting WebSocket disconnected');
    });

    this.ws.addEventListener('error', (error) => {
      console.error('Error reporting WebSocket error:', error);
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default ErrorService;
