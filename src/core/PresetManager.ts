export interface SerializableComponent {
  getSerializableKey(): string | null;
  getValue(): any;
  setValue(val: any): void;
}

export class PresetManager {
  private components: Set<SerializableComponent> = new Set();
  private pendingValues: Record<string, any> = {};
  private changeCallback?: () => void;

  public setOnChange(cb: () => void): void {
    this.changeCallback = cb;
  }

  public notifyChange(): void {
    this.changeCallback?.();
  }

  public register(component: SerializableComponent): void {
    this.components.add(component);
    const key = component.getSerializableKey();
    if (key && key in this.pendingValues) {
      component.setValue(this.pendingValues[key]);
    }
  }

  public setPendingValues(values: Record<string, any>): void {
    this.pendingValues = { ...this.pendingValues, ...values };
    for (const comp of this.components) {
      const key = comp.getSerializableKey();
      if (key && key in this.pendingValues) {
        comp.setValue(this.pendingValues[key]);
      }
    }
  }

  public getPendingValues(): Record<string, any> {
    return { ...this.pendingValues };
  }

  public unregister(component: SerializableComponent): void {
    this.components.delete(component);
  }

  public export(): Record<string, any> {
    const data: Record<string, any> = { ...this.pendingValues };
    for (const comp of this.components) {
      const key = comp.getSerializableKey();
      if (key) {
        data[key] = comp.getValue();
      }
    }
    return data;
  }

  public import(data: Record<string, any>): void {
    if (!data || typeof data !== 'object') return;
    this.setPendingValues(data);
  }

  public save(storageKey: string = 'relly-ui-preset'): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const exported = this.export();
      window.localStorage.setItem(storageKey, JSON.stringify(exported));
    } catch (err) {
      console.warn('[RellyUI] Failed to save preset to localStorage', err);
    }
  }

  public load(storageKey: string = 'relly-ui-preset'): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.import(parsed);
      }
    } catch (err) {
      console.warn('[RellyUI] Failed to load preset from localStorage', err);
    }
  }

  public clear(): void {
    this.components.clear();
    this.pendingValues = {};
  }
}
