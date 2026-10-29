import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { ProgressOptions } from '../../types';

export class Progress extends BaseComponent<number> {
  private trackEl: HTMLElement;
  private barEl: HTMLElement;
  private valueEl: HTMLElement;

  private min: number = 0;
  private max: number = 100;
  private showValue: boolean = true;
  private formatter: (val: number, pct: number) => string;

  constructor(
    label: string,
    targetObject: any,
    property: string,
    options: ProgressOptions = {},
    bindingEngine?: BindingEngine
  ) {
    super(label, targetObject, property, bindingEngine);
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.showValue = options.showValue !== false;
    this.formatter = options.format || ((_v, pct) => `${Math.round(pct)}%`);

    const container = document.createElement('div');
    container.className = 'relly-progress-wrap';

    this.trackEl = document.createElement('div');
    this.trackEl.className = 'relly-progress-track';

    this.barEl = document.createElement('div');
    this.barEl.className = 'relly-progress-bar';
    if (options.color) {
      this.barEl.style.backgroundColor = options.color;
      this.barEl.style.boxShadow = `0 0 10px ${options.color}88`;
    }
    this.trackEl.appendChild(this.barEl);

    this.valueEl = document.createElement('span');
    this.valueEl.className = 'relly-progress-text';
    this.valueEl.style.display = this.showValue ? 'inline-block' : 'none';

    container.appendChild(this.trackEl);
    container.appendChild(this.valueEl);
    this.controlEl.appendChild(container);

    if (options.tooltip) {
      this.setTooltip(options.tooltip);
    }

    this.update();
  }

  public setMin(min: number): this {
    this.min = min;
    this.update();
    return this;
  }

  public setMax(max: number): this {
    this.max = max;
    this.update();
    return this;
  }

  public setColor(color: string): this {
    this.barEl.style.backgroundColor = color;
    this.barEl.style.boxShadow = `0 0 10px ${color}88`;
    return this;
  }

  public setShowValue(show: boolean): this {
    this.showValue = show;
    this.valueEl.style.display = show ? 'inline-block' : 'none';
    return this;
  }

  public setFormat(fn: (val: number, pct: number) => string): this {
    this.formatter = fn;
    this.update();
    return this;
  }

  public update(): this {
    if (!this.barEl || !this.valueEl) return this;
    const rawVal = Number(this.getValue()) || 0;
    const clamped = Math.max(this.min, Math.min(this.max, rawVal));
    const range = this.max - this.min || 1;
    const pct = Math.max(0, Math.min(100, ((clamped - this.min) / range) * 100));

    this.barEl.style.width = `${pct}%`;
    this.valueEl.textContent = this.formatter(rawVal, pct);
    return this;
  }
}
