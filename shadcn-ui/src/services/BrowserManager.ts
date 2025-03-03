// src/services/BrowserManager.ts
import { Task } from '@/types';

export interface BrowserResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  screenshot?: string;
}

export class BrowserManager {
  private browserPort: number;

  constructor(browserPort: number = 8081) {
    this.browserPort = browserPort;
  }

  async executeAction(task: Task): Promise<BrowserResponse> {
    try {
      const response = await fetch(`http://localhost:${this.browserPort}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId: task.id,
          goal: task.goal,
          subtasks: task.subtasks
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute browser action');
      }

      return await response.json() as BrowserResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown browser error'
      };
    }
  }

  async getScreenshot(): Promise<string | null> {
    try {
      const response = await fetch(`http://localhost:${this.browserPort}/screenshot`);
      if (!response.ok) {
        throw new Error('Failed to get screenshot');
      }
      const data = await response.json();
      return data.screenshot;
    } catch (error) {
      console.error('Screenshot error:', error);
      return null;
    }
  }
}