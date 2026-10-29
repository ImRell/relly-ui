import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';
import { SwitchOptions } from '../../types';

export class Switch extends BaseComponent<boolean> {
  private wrapperEl: HTMLLabelElement;
  private inputEl: HTMLInputElement;
  private trackEl: HTMLElement;
  private thumbEl: HTMLElement;
  private statusTextEl: HTMLElement;

  private onLabel?: string;
  private offLabel?: string;
  private soundEngine?: SoundEngine;

  constructor(
    label: string,
    targetObject: any,
    property: string,
    options: SwitchOptions = {},
    bindingEngine?: BindingEngine,
    presetManager?: PresetManager,
    soundEngine?: SoundEngine
  ) {
    super(label, targetObject, property, bindingEngine, presetManager);
    this.soundEngine = soundEngine;
    this.onLabel = options.onLabel;
    this.offLabel = options.offLabel;

    this.wrapperEl = document.createElement('label');
    this.wrapperEl.className = 'relly-switch-wrap';

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'checkbox';
    this.inputEl.className = 'relly-switch-native';

    this.trackEl = document.createElement('span');
    this.trackEl.className = 'relly-switch-track';

    this.thumbEl = document.createElement('span');
    this.thumbEl.className = 'relly-switch-thumb';
    this.trackEl.appendChild(this.thumbEl);

    this.statusTextEl = document.createElement('span');
    this.statusTextEl.className = 'relly-switch-text';

    this.wrapperEl.appendChild(this.inputEl);
    this.wrapperEl.appendChild(this.trackEl);
    this.wrapperEl.appendChild(this.statusTextEl);
    this.controlEl.appendChild(this.wrapperEl);

    this.inputEl.addEventListener('change', () => {
      const checked = this.inputEl.checked;
      this.soundEngine?.playToggle(checked);
      this.setValue(checked);
    });

    if (options.disabled) {
      this.setDisabled(true);
    }
    if (options.tooltip) {
      this.setTooltip(options.tooltip);
    }

    this.update();
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public setOnLabel(text: string): this {
    this.onLabel = text;
    this.update();
    return this;
  }

  public setOffLabel(text: string): this {
    this.offLabel = text;
    this.update();
    return this;
  }

  public onToggle(cb: (val: boolean) => void): this {
    return this.onChange(cb);
  }

  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    if (this.inputEl) {
      this.inputEl.disabled = disabled;
    }
    return this;
  }

  public update(): this {
    if (!this.inputEl || !this.trackEl) return this;
    const checked = Boolean(this.getValue());
    this.inputEl.checked = checked;

    if (checked) {
      this.trackEl.classList.add('relly-switch-track--checked');
    } else {
      this.trackEl.classList.remove('relly-switch-track--checked');
    }

    if (this.onLabel || this.offLabel) {
      this.statusTextEl.textContent = checked ? (this.onLabel || 'ON') : (this.offLabel || 'OFF');
      this.statusTextEl.style.display = 'inline-block';
    } else {
      this.statusTextEl.style.display = 'none';
    }

    return this;
  }
}
