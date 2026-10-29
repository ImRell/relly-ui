import { BaseComponent } from '../../core/BaseComponent';
import { SoundEngine } from '../../core/SoundEngine';
import { ButtonGroupItem } from '../../types';

export class ButtonGroup extends BaseComponent<void> {
  private groupContainerEl: HTMLElement;
  private buttonElements: HTMLButtonElement[] = [];
  private soundEngine?: SoundEngine;

  constructor(
    buttons: ButtonGroupItem[] = [],
    soundEngine?: SoundEngine
  ) {
    super('');
    this.soundEngine = soundEngine;

    // Full row width for button group
    this.element.className = 'relly-row relly-button-group-row';
    this.element.innerHTML = '';

    this.groupContainerEl = document.createElement('div');
    this.groupContainerEl.className = 'relly-button-group';
    this.element.appendChild(this.groupContainerEl);

    for (const item of buttons) {
      this.addButton(item);
    }
  }

  public addButton(item: ButtonGroupItem): this {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'relly-btn relly-btn--group';
    btn.textContent = item.label;

    if (item.danger) btn.classList.add('relly-btn--danger');
    if (item.primary) btn.classList.add('relly-btn--primary');
    if (item.disabled) btn.disabled = true;
    if (item.tooltip) btn.title = item.tooltip;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.soundEngine?.playClick();
      item.onClick(btn);
    });

    this.buttonElements.push(btn);
    this.groupContainerEl.appendChild(btn);
    return this;
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    for (const btn of this.buttonElements) {
      btn.disabled = disabled;
    }
    return this;
  }

  public update(): this {
    return this;
  }
}
