import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export class Slider extends BaseComponent<number> {
  private containerEl: HTMLElement;
  private rangeInput: HTMLInputElement;
  private numberInput: HTMLInputElement;
  private soundEngine?: SoundEngine;
  private lastSoundTime: number = 0;

  private min: number = 0;
  private max: number = 100;
  private step: number = 1;

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

    this.containerEl = document.createElement('div');
    this.containerEl.className = 'relly-slider-container';

    this.rangeInput = document.createElement('input');
    this.rangeInput.type = 'range';
    this.rangeInput.className = 'relly-slider-range';

    this.numberInput = document.createElement('input');
    this.numberInput.type = 'number';
    this.numberInput.className = 'relly-slider-number';
    this.numberInput.title = 'Drag horizontally to scrub value, or type directly';

    this.containerEl.appendChild(this.rangeInput);
    this.containerEl.appendChild(this.numberInput);
    this.controlEl.appendChild(this.containerEl);

    this.applyConstraints();

    // Range input change
    this.rangeInput.addEventListener('input', () => {
      const val = parseFloat(this.rangeInput.value);
      this.triggerSound();
      this.setValue(val);
    });

    // Number input change
    this.numberInput.addEventListener('change', () => {
      let val = parseFloat(this.numberInput.value);
      if (isNaN(val)) val = this.min;
      val = Math.max(this.min, Math.min(this.max, val));
      this.triggerSound();
      this.setValue(val);
    });

    // Virtual Jog-Dial / Drag Scrubbing on number input
    this.setupJogScrubbing();

    this.update();
  }

  private setupJogScrubbing(): void {
    let isScrubbing = false;
    let startX = 0;
    let startVal = 0;

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      if (!isScrubbing && Math.abs(dx) > 3) {
        isScrubbing = true;
        if (typeof document !== 'undefined') {
          document.body.classList.add('relly-jog-scrubbing');
        }
      }
      if (isScrubbing) {
        const stepMultiplier = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
        const stepDelta = this.step * stepMultiplier;
        const deltaVal = dx * stepDelta;
        let newVal = startVal + deltaVal;
        newVal = Math.max(this.min, Math.min(this.max, newVal));
        const decimals = (this.step.toString().split('.')[1] || '').length;
        newVal = parseFloat(newVal.toFixed(Math.max(decimals, 2)));
        this.triggerSound();
        this.setValue(newVal);
        ev.preventDefault();
      }
    };

    const onMouseUp = () => {
      if (isScrubbing && typeof document !== 'undefined') {
        document.body.classList.remove('relly-jog-scrubbing');
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
    };

    this.numberInput.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startVal = parseFloat(this.numberInput.value) || 0;
      isScrubbing = false;

      if (typeof window !== 'undefined') {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }
    });
  }

  private triggerSound(): void {
    const now = Date.now();
    if (now - this.lastSoundTime > 35) {
      this.lastSoundTime = now;
      this.soundEngine?.playTick();
    }
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public setMin(min: number): this {
    this.min = min;
    this.applyConstraints();
    return this;
  }

  public setMax(max: number): this {
    this.max = max;
    this.applyConstraints();
    return this;
  }

  public setStep(step: number): this {
    this.step = step;
    this.applyConstraints();
    return this;
  }

  private applyConstraints(): void {
    this.rangeInput.min = this.min.toString();
    this.rangeInput.max = this.max.toString();
    this.rangeInput.step = this.step.toString();

    this.numberInput.min = this.min.toString();
    this.numberInput.max = this.max.toString();
    this.numberInput.step = this.step.toString();
  }

  public update(): this {
    if (!this.rangeInput || !this.numberInput) return this;
    const val = Number(this.getValue()) || 0;
    this.rangeInput.value = val.toString();
    this.numberInput.value = val.toString();
    return this;
  }
}
