import { BindingEngine, Listenable } from './BindingEngine';
import { PresetManager, SerializableComponent } from './PresetManager';
import { ConditionPredicate, IBaseComponent, OnChangeCallback, ContextMenuItem } from '../types';

export abstract class BaseComponent<T = any>
  implements IBaseComponent<T>, Listenable, SerializableComponent
{
  public element: HTMLElement;
  protected labelEl: HTMLElement;
  protected controlEl: HTMLElement;

  protected label: string;
  protected tooltipText?: string;
  protected tooltipEl?: HTMLElement;
  protected conditionPredicate?: ConditionPredicate;
  protected targetObject?: any;
  protected property?: string;
  protected initialValue?: T;
  protected prevValue?: T;
  protected onChangeCallback?: OnChangeCallback<T>;
  protected isListening: boolean = false;
  protected contextMenuItems?: ContextMenuItem[];

  constructor(
    label: string,
    targetObject?: any,
    property?: string,
    protected bindingEngine?: BindingEngine,
    protected presetManager?: PresetManager
  ) {
    this.label = label;
    this.targetObject = targetObject;
    this.property = property;

    if (this.targetObject && this.property) {
      this.prevValue = this.targetObject[this.property];
      try {
        this.initialValue = JSON.parse(JSON.stringify(this.prevValue));
      } catch {
        this.initialValue = this.prevValue;
      }
    }

    // Create Base DOM
    this.element = document.createElement('div');
    this.element.className = 'relly-row';
    (this.element as any).__rellyComponent = this;

    this.labelEl = document.createElement('div');
    this.labelEl.className = 'relly-row-label';
    this.labelEl.textContent = label;
    this.element.appendChild(this.labelEl);

    this.controlEl = document.createElement('div');
    this.controlEl.className = 'relly-row-control';
    this.element.appendChild(this.controlEl);

    // Register with PresetManager if bound
    if (this.presetManager && this.getSerializableKey()) {
      this.presetManager.register(this);
    }
  }

  public setLabel(label: string): this {
    this.label = label;
    this.labelEl.textContent = label;
    return this;
  }

  public getLabel(): string {
    return this.label;
  }

  public setTooltip(tooltip: string): this {
    this.tooltipText = tooltip;
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.className = 'relly-tooltip';
      this.element.appendChild(this.tooltipEl);
    }
    this.tooltipEl.textContent = tooltip;
    return this;
  }

  public getTooltip(): string | undefined {
    return this.tooltipText;
  }

  public showIf(predicate: ConditionPredicate): this {
    this.conditionPredicate = predicate;
    this.checkVisibility();
    // Register to bindingEngine so it gets evaluated every frame
    if (this.bindingEngine && !this.isListening) {
      this.bindingEngine.register(this);
    }
    return this;
  }

  public checkVisibility(): boolean {
    if (!this.conditionPredicate) return true;
    const isVisible = this.conditionPredicate();
    this.element.style.display = isVisible ? '' : 'none';
    return isVisible;
  }

  public setContextMenu(items: ContextMenuItem[]): this {
    this.contextMenuItems = items;
    return this;
  }

  public getContextMenu(): ContextMenuItem[] | undefined {
    return this.contextMenuItems;
  }

  public reset(): this {
    if (this.initialValue !== undefined) {
      try {
        this.setValue(JSON.parse(JSON.stringify(this.initialValue)));
      } catch {
        this.setValue(this.initialValue);
      }
    }
    return this;
  }

  public onChange(callback: OnChangeCallback<T>): this {
    this.onChangeCallback = callback;
    return this;
  }

  public listen(): this {
    if (!this.isListening && this.bindingEngine && this.targetObject && this.property) {
      this.isListening = true;
      this.bindingEngine.register(this);
    }
    return this;
  }

  public getValue(): T {
    if (this.targetObject && this.property) {
      return this.targetObject[this.property];
    }
    return this.prevValue as T;
  }

  public setValue(value: T): this {
    const prev = this.getValue();
    if (this.targetObject && this.property) {
      this.targetObject[this.property] = value;
    }
    this.prevValue = value;
    this.update();
    if (prev !== value) {
      this.triggerChange(value, prev);
      this.presetManager?.notifyChange();
    }
    return this;
  }

  protected disabled: boolean = false;

  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    if (this.disabled) {
      this.element.classList.add('relly-disabled');
      const inputs = this.element.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input, button, select');
      inputs.forEach(el => el.disabled = true);
    } else {
      this.element.classList.remove('relly-disabled');
      const inputs = this.element.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input, button, select');
      inputs.forEach(el => el.disabled = false);
    }
    return this;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  public checkDirty(): void {
    this.checkVisibility();
    if (!this.targetObject || !this.property) return;
    const current = this.targetObject[this.property];
    if (current !== this.prevValue) {
      const prev = this.prevValue;
      this.prevValue = current;
      this.update();
      this.triggerChange(current, prev as T);
    }
  }

  protected triggerChange(value: T, prev: T): void {
    if (this.onChangeCallback) {
      this.onChangeCallback(value, prev);
    }
  }

  public getSerializableKey(): string | null {
    if (this.property) {
      return this.property;
    }
    return this.label || null;
  }

  /**
   * Updates the UI elements based on current value.
   * To be implemented by subclasses.
   */
  public abstract update(): this;

  public destroy(): void {
    if (this.isListening && this.bindingEngine) {
      this.bindingEngine.unregister(this);
      this.isListening = false;
    }
    if (this.presetManager) {
      this.presetManager.unregister(this);
    }
    this.element.remove();
  }
}
