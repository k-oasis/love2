// src/services/ErrorService.ts
import { v4 as uuidv4 } from 'uuid';
import { ErrorContext, ErrorNotification, ErrorSeverity } from '../types/error';

class ErrorService {
  private static instance: ErrorService;
  private ws: WebSocket | null = null;
  private listeners: Set<(notification: ErrorNotification) => void> = new Set();

  private constructor() {
    this.initializeWebSocket();
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  private initializeWebSocket() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as ErrorNotification;
        this.notifyListeners(notification);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setTimeout(() => this.initializeWebSocket(), 5000);
    };
  }

  private notifyListeners(notification: ErrorNotification) {
    this.listeners.forEach(listener => listener(notification));
  }

  subscribe(listener: (notification: ErrorNotification) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reportError(
    title: string,
    message: string,
    severity: ErrorSeverity,
    context: Partial<ErrorContext>
  ) {
    const notification: ErrorNotification = {
      id: uuidv4(),
      severity,
      title,
      message,
      context: {
        message,
        timestamp: Date.now(),
        ...context
      },
      read: false,
      createdAt: Date.now()
    };

    // Send to server via WebSocket if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(notification));
    }

    // Notify local listeners immediately
    this.notifyListeners(notification);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${severity}] ${title}:`, message, context);
    }
  }
}

export default ErrorService;