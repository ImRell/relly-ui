import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';

export type LabelFormatter = (value: any) => string;

export class DynamicLabel extends BaseComponent<any> {
  private valueBadge: HTMLElement;
  private formatter: LabelFormatter = (v) => String(v !== undefined && v !== null ? v : '');

  constructor(label: string, targetObject?: any, property?: string, bindingEngine?: BindingEngine) {
    super(label, targetObject, property, bindingEngine);

    this.valueBadge = document.createElement('span');
    this.valueBadge.className = 'relly-dynamic-value';
    this.controlEl.appendChild(this.valueBadge);

    this.update();
  }

  public setFormat(formatter: LabelFormatter): this {
    this.formatter = formatter;
    this.update();
    return this;
  }

  public update(): this {
    const val = this.getValue();
    this.valueBadge.textContent = this.formatter(val);
    return this;
  }
}
