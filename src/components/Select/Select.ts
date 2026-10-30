import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export class Select extends BaseComponent<any> {
  private selectEl: HTMLSelectElement;
  private optionsMap: Map<string, any> = new Map();
  private soundEngine?: SoundEngine;

  constructor(
    label: string,
    targetObject: any,
    property: string,
    options?: any[] | Record<string, any>,
    bindingEngine?: BindingEngine,
    presetManager?: PresetManager,
    soundEngine?: SoundEngine
  ) {
    super(label, targetObject, property, bindingEngine, presetManager);
    this.soundEngine = soundEngine;

    this.selectEl = document.createElement('select');
    this.selectEl.className = 'relly-select-input';
    this.controlEl.appendChild(this.selectEl);

    if (options) {
      this.setOptions(options);
    }

    this.selectEl.addEventListener('change', () => {
      const selectedKey = this.selectEl.value;
      const actualValue = this.optionsMap.has(selectedKey)
        ? this.optionsMap.get(selectedKey)
        : selectedKey;
      this.soundEngine?.playSelect();
      this.setValue(actualValue);
    });

    this.update();
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public setOptions(options: any[] | Record<string, any>): this {
    this.selectEl.innerHTML = '';
    this.optionsMap.clear();

    if (Array.isArray(options)) {
      for (const item of options) {
        const key = String(item);
        this.optionsMap.set(key, item);
        const optEl = document.createElement('option');
        optEl.value = key;
        optEl.textContent = key;
        this.selectEl.appendChild(optEl);
      }
    } else if (typeof options === 'object' && options !== null) {
      for (const [key, value] of Object.entries(options)) {
        this.optionsMap.set(key, value);
        const optEl = document.createElement('option');
        optEl.value = key;
        optEl.textContent = key;
        this.selectEl.appendChild(optEl);
      }
    }

    this.update();
    return this;
  }

  public update(): this {
    if (!this.selectEl) return this;
    const currentVal = this.getValue();
    for (const [key, val] of this.optionsMap.entries()) {
      if (val === currentVal || String(val) === String(currentVal)) {
        this.selectEl.value = key;
        return this;
      }
    }
    this.selectEl.value = String(currentVal);
    return this;
  }
}
