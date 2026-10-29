import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export class ColorPicker extends BaseComponent<string> {
  private wrapperEl: HTMLElement;
  private previewEl: HTMLElement;
  private hexTextEl: HTMLElement;
  private nativeColorInput: HTMLInputElement;
  private eyeDropperBtn?: HTMLButtonElement;
  private swatchesContainer?: HTMLElement;
  private swatches: string[] = [];
  private swatchButtons: Map<string, HTMLElement> = new Map();
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
    this.wrapperEl.className = 'relly-color-wrapper';

    this.previewEl = document.createElement('div');
    this.previewEl.className = 'relly-color-preview';
    this.previewEl.title = 'Click to open color palette';

    this.hexTextEl = document.createElement('span');
    this.hexTextEl.className = 'relly-color-text';

    this.nativeColorInput = document.createElement('input');
    this.nativeColorInput.type = 'color';
    this.nativeColorInput.className = 'relly-color-native';

    this.wrapperEl.appendChild(this.previewEl);
    this.wrapperEl.appendChild(this.hexTextEl);
    this.wrapperEl.appendChild(this.nativeColorInput);

    // EyeDropper API (Pick color from screen)
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      this.eyeDropperBtn = document.createElement('button');
      this.eyeDropperBtn.type = 'button';
      this.eyeDropperBtn.className = 'relly-eyedropper-btn';
      this.eyeDropperBtn.title = 'Pick color from screen';
      this.eyeDropperBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m14 7 3 3m-1-5a2.83 2.83 0 0 1 4 4L7 22H3v-4L16 5Z"></path>
        </svg>
      `;
      this.eyeDropperBtn.addEventListener('click', async () => {
        try {
          const eyeDropper = new (window as any).EyeDropper();
          const result = await eyeDropper.open();
          if (result && result.sRGBHex) {
            this.setValue(result.sRGBHex);
          }
        } catch {
          // User cancelled picker
        }
      });
      this.wrapperEl.appendChild(this.eyeDropperBtn);
    }

    this.controlEl.appendChild(this.wrapperEl);

    this.previewEl.addEventListener('click', () => {
      this.nativeColorInput.click();
    });

    this.hexTextEl.addEventListener('click', () => {
      this.nativeColorInput.click();
    });

    this.nativeColorInput.addEventListener('input', () => {
      const color = this.nativeColorInput.value;
      this.setValue(color);
    });

    this.update();
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public setSwatches(swatches: string[]): this {
    this.swatches = swatches;
    if (!this.swatchesContainer) {
      this.swatchesContainer = document.createElement('div');
      this.swatchesContainer.className = 'relly-color-swatches';
      this.wrapperEl.insertBefore(this.swatchesContainer, this.previewEl);
    }

    this.swatchesContainer.innerHTML = '';
    this.swatchButtons.clear();

    for (const color of this.swatches) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'relly-color-swatch';
      btn.style.backgroundColor = color;
      btn.title = color.toUpperCase();
      btn.addEventListener('click', () => {
        this.setValue(color);
        this.soundEngine?.playClick();
      });
      this.swatchesContainer.appendChild(btn);
      this.swatchButtons.set(color.toLowerCase(), btn);
    }

    this.update();
    return this;
  }

  public getSwatches(): string[] {
    return [...this.swatches];
  }

  public update(): this {
    if (!this.previewEl || !this.hexTextEl) return this;
    const color = String(this.getValue() || '#000000');
    this.previewEl.style.backgroundColor = color;
    this.hexTextEl.textContent = color.toUpperCase();
    if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
      this.nativeColorInput.value =
        color.length === 4
          ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
          : color;
    }

    // Update active swatch highlighting
    const lower = color.toLowerCase();
    for (const [swatchColor, btn] of this.swatchButtons.entries()) {
      if (swatchColor === lower) {
        btn.classList.add('relly-swatch-active');
      } else {
        btn.classList.remove('relly-swatch-active');
      }
    }

    return this;
  }
}
