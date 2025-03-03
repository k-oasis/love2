// src/types/index.ts
export interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  url?: string;
  result?: Record<string, unknown>;
  error?: string;
  goal?: string;
  subtasks?: string[];
}

export interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'extract';
  url?: string;
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface AgentMessage {
  type: 'status' | 'progress' | 'result' | 'error';
  taskId: string;
  data: Record<string, unknown>;
}

export interface AgentMemory {
  taskId: string;
  context: Record<string, unknown>;
  timestamp: number;
}