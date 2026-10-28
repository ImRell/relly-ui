export interface Listenable {
  checkDirty(): void;
}

export class BindingEngine {
  private listeners: Set<Listenable> = new Set();
  private rafId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  public register(component: Listenable): void {
    this.listeners.add(component);
    if (!this.isRunning && !this.isPaused) {
      this.start();
    }
  }

  public unregister(component: Listenable): void {
    this.listeners.delete(component);
    if (this.listeners.size === 0) {
      this.stop();
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.stop();
  }

  public resume(): void {
    this.isPaused = false;
    if (this.listeners.size > 0 && !this.isRunning) {
      this.start();
    }
  }

  private start(): void {
    if (typeof window === 'undefined') return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      for (const listener of this.listeners) {
        listener.checkDirty();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stop(): void {
    this.isRunning = false;
    if (this.rafId !== null && typeof window !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public destroy(): void {
    this.stop();
    this.listeners.clear();
  }
}
