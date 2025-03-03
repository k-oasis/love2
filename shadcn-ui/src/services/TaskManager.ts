// src/services/TaskManager.ts
import { v4 as uuidv4 } from 'uuid';
import { Task, AgentMessage, AgentMemory } from '../types';

export class TaskManager {
  private tasks: Map<string, Task>;
  private memories: Map<string, AgentMemory>;
  private ws: WebSocket | null;
  private agentPort: number;

  constructor(agentPort: number = 8080) {
    this.tasks = new Map();
    this.memories = new Map();
    this.ws = null;
    this.agentPort = agentPort;
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.ws = new WebSocket(`ws://localhost:${this.agentPort}/agent`);
    
    this.ws.onmessage = (event) => {
      const message: AgentMessage = JSON.parse(event.data);
      this.handleAgentMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  public getWebSocket(): WebSocket | null {
    return this.ws;
  }

  private handleAgentMessage(message: AgentMessage) {
    const task = this.tasks.get(message.taskId);
    if (!task) return;

    switch (message.type) {
      case 'status':
        task.status = message.data.status as Task['status'];
        break;
      case 'progress':
        task.progress = message.data.progress as number;
        break;
      case 'result':
        task.result = message.data.result as Record<string, unknown>;
        task.status = 'completed';
        break;
      case 'error':
        task.error = message.data.error as string;
        task.status = 'failed';
        break;
    }

    this.tasks.set(message.taskId, { ...task });
  }

  public async parseGoal(goal: string): Promise<Task> {
    const taskId = uuidv4();
    const task: Task = {
      id: taskId,
      status: 'pending',
      progress: 0,
      goal,
      subtasks: []
    };

    try {
      const response = await fetch(`http://localhost:${this.agentPort}/parse_goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });

      if (!response.ok) {
        throw new Error('Failed to parse goal');
      }

      const data: { subtasks: string[] } = await response.json();
      task.subtasks = data.subtasks;
      this.tasks.set(taskId, task);
      
      // Initialize agent memory
      this.memories.set(taskId, {
        taskId,
        context: { goal, initialParse: data },
        timestamp: Date.now()
      });

      return task;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      this.tasks.set(taskId, task);
      throw error;
    }
  }

  public async executeNext(): Promise<Task | null> {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending');

    if (pendingTasks.length === 0) return null;

    const nextTask = pendingTasks[0];
    nextTask.status = 'running';
    this.tasks.set(nextTask.id, nextTask);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'execute',
        taskId: nextTask.id,
        data: {
          goal: nextTask.goal,
          subtasks: nextTask.subtasks,
          memory: this.memories.get(nextTask.id)
        }
      }));
    }

    return nextTask;
  }

  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  public async cleanup(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.tasks.clear();
    this.memories.clear();
  }
}