import { BaseComponent } from '../../core/BaseComponent';
import { SoundEngine } from '../../core/SoundEngine';
import { OnClickCallback } from '../../types';

export class Button extends BaseComponent<void> {
  private buttonEl: HTMLButtonElement;
  private clickHandler?: OnClickCallback;
  private soundEngine?: SoundEngine;

  constructor(label: string, onClick?: OnClickCallback, soundEngine?: SoundEngine) {
    super(label);
    this.soundEngine = soundEngine;

    // Buttons look best taking the full row or acting as a direct trigger
    this.labelEl.style.display = 'none';
    this.controlEl.style.flex = '1';

    this.buttonEl = document.createElement('button');
    this.buttonEl.className = 'relly-btn';
    this.buttonEl.textContent = label;
    this.controlEl.appendChild(this.buttonEl);

    if (onClick) {
      this.onClick(onClick);
    }

    this.buttonEl.addEventListener('click', (e) => {
      this.soundEngine?.playClick();
      if (this.clickHandler) {
        this.clickHandler(e);
      }
    });
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public override setLabel(label: string): this {
    super.setLabel(label);
    this.buttonEl.textContent = label;
    return this;
  }

  public onClick(callback: OnClickCallback): this {
    this.clickHandler = callback;
    return this;
  }

  public update(): this {
    return this;
  }
}
