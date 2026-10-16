import { AgentRole, AgentStatus } from '../types.js';
import { store } from '../store/state.js';

export abstract class BaseAgent {
  public abstract readonly role: AgentRole;
  protected status: AgentStatus = 'idle';
  protected tasksCompleted = 0;
  protected isRunning = false;

  public async start(): Promise<void> {
    this.isRunning = true;
    this.status = 'idle';
    this.emitTelemetry('Agent started and initialized');
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    this.status = 'idle';
    this.emitTelemetry('Agent paused');
  }

  public abstract tick(): Promise<void>;

  protected setStatus(status: AgentStatus, taskDesc: string): void {
    this.status = status;
    this.emitTelemetry(taskDesc);
  }

  protected incrementTasks(): void {
    this.tasksCompleted += 1;
  }

  protected emitTelemetry(taskDesc: string): void {
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;
    store.updateAgent(this.role, {
      status: this.status,
      tasksCompleted: this.tasksCompleted,
      memoryUsageMb: Number(memory.toFixed(1)),
      currentTaskDescription: taskDesc,
    });
  }

  protected log(
    level: 'info' | 'warn' | 'success' | 'error',
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    store.addLog(this.role, level, message, meta);
  }
}
