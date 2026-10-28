import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export class Checkbox extends BaseComponent<boolean> {
  private wrapperEl: HTMLElement;
  private boxEl: HTMLElement;
  private soundEngine?: SoundEngine;

  constructor(
    label: string,
    targetObject: any,
    property: string,
    bindingEngine?: BindingEngine,
    presetManager?: PresetManager,
    soundEngine?: SoundEngine
  ) {
    super(label, targetObject, property, bindingEngine, presetManager);
    this.soundEngine = soundEngine;

    this.wrapperEl = document.createElement('div');
    this.wrapperEl.className = 'relly-checkbox-wrapper';
    this.wrapperEl.setAttribute('role', 'checkbox');
    this.wrapperEl.setAttribute('tabindex', '0');

    this.boxEl = document.createElement('div');
    this.boxEl.className = 'relly-checkbox-box';

    // SVG checkmark
    this.boxEl.innerHTML = `
      <svg class="relly-checkbox-icon" viewBox="0 0 12 10">
        <polyline points="1.5 5 4.5 8.5 10.5 1.5"></polyline>
      </svg>
    `;

    this.wrapperEl.appendChild(this.boxEl);
    this.controlEl.appendChild(this.wrapperEl);

    this.wrapperEl.addEventListener('click', () => {
      const nextVal = !this.getValue();
      this.soundEngine?.playToggle(nextVal);
      this.setValue(nextVal);
    });

    this.wrapperEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const nextVal = !this.getValue();
        this.soundEngine?.playToggle(nextVal);
        this.setValue(nextVal);
      }
    });

    this.update();
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public update(): this {
    if (!this.wrapperEl) return this;
    const isChecked = Boolean(this.getValue());
    this.wrapperEl.setAttribute('aria-checked', isChecked ? 'true' : 'false');
    if (isChecked) {
      this.wrapperEl.classList.add('relly-checked');
    } else {
      this.wrapperEl.classList.remove('relly-checked');
    }
    return this;
  }
}
