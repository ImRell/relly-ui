import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export class Segmented extends BaseComponent<any> {
  private containerEl: HTMLElement;
  private gliderEl: HTMLElement;
  private buttons: Map<string, HTMLButtonElement> = new Map();
  private optionsMap: Map<string, any> = new Map();
  private soundEngine?: SoundEngine;

  constructor(
    label: string,
    targetObject: any,
    property: string,
    options: string[] | number[] | Record<string, any> = [],
    bindingEngine?: BindingEngine,
    presetManager?: PresetManager,
    soundEngine?: SoundEngine
  ) {
    super(label, targetObject, property, bindingEngine, presetManager);
    this.soundEngine = soundEngine;

    this.containerEl = document.createElement('div');
    this.containerEl.className = 'relly-segmented-container';

    this.gliderEl = document.createElement('div');
    this.gliderEl.className = 'relly-segmented-glider';
    this.containerEl.appendChild(this.gliderEl);

    this.controlEl.appendChild(this.containerEl);

    this.setOptions(options);
  }

  public setOptions(options: string[] | number[] | Record<string, any>): this {
    this.optionsMap.clear();
    this.buttons.clear();

    // Preserve glider
    this.containerEl.innerHTML = '';
    this.containerEl.appendChild(this.gliderEl);

    if (Array.isArray(options)) {
      for (const item of options) {
        const key = String(item);
        this.optionsMap.set(key, item);
        this.createButton(key, key, item);
      }
    } else if (typeof options === 'object' && options !== null) {
      for (const [key, val] of Object.entries(options)) {
        this.optionsMap.set(key, val);
        this.createButton(key, key, val);
      }
    }

    this.update();
    return this;
  }

  private createButton(key: string, label: string, value: any): void {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'relly-segmented-btn';
    btn.textContent = label;

    btn.addEventListener('click', () => {
      this.soundEngine?.playClick();
      this.setValue(value);
    });

    this.containerEl.appendChild(btn);
    this.buttons.set(key, btn);
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public update(): this {
    if (!this.containerEl || this.buttons.size === 0) return this;
    const currentVal = this.getValue();

    let matchedBtn: HTMLButtonElement | null = null;

    for (const [key, val] of this.optionsMap.entries()) {
      const btn = this.buttons.get(key);
      if (!btn) continue;

      if (val === currentVal || String(val) === String(currentVal)) {
        btn.classList.add('relly-segmented-btn--active');
        matchedBtn = btn;
      } else {
        btn.classList.remove('relly-segmented-btn--active');
      }
    }

    if (matchedBtn) {
      const left = matchedBtn.offsetLeft;
      const width = matchedBtn.offsetWidth;
      this.gliderEl.style.transform = `translateX(${left}px)`;
      this.gliderEl.style.width = `${width}px`;
      this.gliderEl.style.opacity = '1';
    } else {
      this.gliderEl.style.opacity = '0';
    }

    return this;
  }
}
