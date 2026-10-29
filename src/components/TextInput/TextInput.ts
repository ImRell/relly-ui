import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';
import { TextInputOptions } from '../../types';

export class TextInput extends BaseComponent<string> {
  private wrapperEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private clearBtn?: HTMLButtonElement;
  private soundEngine?: SoundEngine;

  constructor(
    label: string,
    targetObject: any,
    property: string,
    options: TextInputOptions = {},
    bindingEngine?: BindingEngine,
    presetManager?: PresetManager,
    soundEngine?: SoundEngine
  ) {
    super(label, targetObject, property, bindingEngine, presetManager);
    this.soundEngine = soundEngine;

    this.wrapperEl = document.createElement('div');
    this.wrapperEl.className = 'relly-text-wrap';

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.className = 'relly-text-input';
    this.inputEl.spellcheck = false;

    if (options.placeholder) this.inputEl.placeholder = options.placeholder;
    if (options.maxLength) this.inputEl.maxLength = options.maxLength;
    if (options.readOnly) this.inputEl.readOnly = true;

    this.wrapperEl.appendChild(this.inputEl);

    if (options.clearable) {
      this.clearBtn = document.createElement('button');
      this.clearBtn.type = 'button';
      this.clearBtn.className = 'relly-text-clear';
      this.clearBtn.innerHTML = '✕';
      this.clearBtn.title = 'Clear text';
      this.clearBtn.style.display = 'none';

      this.clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setValue('');
        this.inputEl.focus();
      });

      this.wrapperEl.appendChild(this.clearBtn);
    }

    this.controlEl.appendChild(this.wrapperEl);

    this.inputEl.addEventListener('input', () => {
      const val = this.inputEl.value;
      this.setValue(val);
      this.updateClearBtn(val);
    });

    this.inputEl.addEventListener('change', () => {
      this.soundEngine?.playClick();
      this.setValue(this.inputEl.value);
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

  public setPlaceholder(placeholder: string): this {
    this.inputEl.placeholder = placeholder;
    return this;
  }

  public setMaxLength(max: number): this {
    this.inputEl.maxLength = max;
    return this;
  }

  public setReadOnly(readOnly: boolean): this {
    this.inputEl.readOnly = readOnly;
    return this;
  }

  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    if (this.inputEl) {
      this.inputEl.disabled = disabled;
    }
    return this;
  }

  private updateClearBtn(val: string): void {
    if (this.clearBtn) {
      this.clearBtn.style.display = val.length > 0 ? 'flex' : 'none';
    }
  }

  public update(): this {
    if (!this.inputEl) return this;
    const currentVal = String(this.getValue() ?? '');
    if (document.activeElement !== this.inputEl) {
      this.inputEl.value = currentVal;
    }
    this.updateClearBtn(currentVal);
    return this;
  }
}
