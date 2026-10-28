import { ContainerHelper } from '../../core/ComponentContainer';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export class Tab extends ContainerHelper {
  public contentEl: HTMLElement;
  public buttonEl: HTMLButtonElement;

  constructor(
    private label: string,
    bindingEngine: BindingEngine,
    presetManager: PresetManager,
    soundEngine?: SoundEngine
  ) {
    const content = document.createElement('div');
    content.className = 'relly-tab-content';
    super(content, bindingEngine, presetManager, soundEngine);

    this.contentEl = content;

    this.buttonEl = document.createElement('button');
    this.buttonEl.className = 'relly-tab-btn';
    this.buttonEl.textContent = label;
  }

  public getLabel(): string {
    return this.label;
  }

  public setActive(active: boolean): void {
    if (active) {
      this.buttonEl.classList.add('relly-tab-active');
      this.contentEl.classList.add('relly-tab-content--active');
    } else {
      this.buttonEl.classList.remove('relly-tab-active');
      this.contentEl.classList.remove('relly-tab-content--active');
    }
  }

  public destroy(): void {
    this.destroyChildren();
    this.buttonEl.remove();
    this.contentEl.remove();
  }
}
