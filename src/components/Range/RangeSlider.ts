import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';
import { RangeVal } from '../../types';

export class RangeSlider extends BaseComponent<RangeVal> {
  private wrapperEl: HTMLElement;
  private trackEl: HTMLElement;
  private barEl: HTMLElement;
  private thumbMin: HTMLElement;
  private thumbMax: HTMLElement;
  private inputMin: HTMLInputElement;
  private inputMax: HTMLInputElement;

  private min: number = 0;
  private max: number = 100;
  private step: number = 1;
  private soundEngine?: SoundEngine;
  private lastSoundTime: number = 0;
  private formatter: (min: number, max: number) => string = (a, b) =>
    `[${a.toFixed(1)}, ${b.toFixed(1)}]`;

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
    this.wrapperEl.className = 'relly-range-wrapper';

    // Min input
    this.inputMin = document.createElement('input');
    this.inputMin.type = 'number';
    this.inputMin.className = 'relly-range-input relly-range-input--min';

    // Track
    this.trackEl = document.createElement('div');
    this.trackEl.className = 'relly-range-track';

    this.barEl = document.createElement('div');
    this.barEl.className = 'relly-range-bar';

    this.thumbMin = document.createElement('div');
    this.thumbMin.className = 'relly-range-thumb relly-range-thumb--min';
    this.thumbMin.title = 'Drag min';

    this.thumbMax = document.createElement('div');
    this.thumbMax.className = 'relly-range-thumb relly-range-thumb--max';
    this.thumbMax.title = 'Drag max';

    this.trackEl.appendChild(this.barEl);
    this.trackEl.appendChild(this.thumbMin);
    this.trackEl.appendChild(this.thumbMax);

    // Max input
    this.inputMax = document.createElement('input');
    this.inputMax.type = 'number';
    this.inputMax.className = 'relly-range-input relly-range-input--max';

    this.wrapperEl.appendChild(this.inputMin);
    this.wrapperEl.appendChild(this.trackEl);
    this.wrapperEl.appendChild(this.inputMax);
    this.controlEl.appendChild(this.wrapperEl);

    this.setupListeners();
    this.update();
  }

  private setupListeners(): void {
    // Manual input typing
    this.inputMin.addEventListener('change', () => {
      const vMin = parseFloat(this.inputMin.value) || this.min;
      const [_, curMax] = this.getCurrentRange();
      this.setRangeValue(Math.min(vMin, curMax), curMax);
    });

    this.inputMax.addEventListener('change', () => {
      const vMax = parseFloat(this.inputMax.value) || this.max;
      const [curMin, _] = this.getCurrentRange();
      this.setRangeValue(curMin, Math.max(vMax, curMin));
    });

    // Mouse wheel adjustments on input boxes
    const bindWheel = (input: HTMLInputElement, isMin: boolean) => {
      input.addEventListener(
        'wheel',
        (ev: WheelEvent) => {
          ev.preventDefault();
          const dir = ev.deltaY < 0 ? 1 : -1;
          const stepMultiplier = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
          const delta = this.step * dir * stepMultiplier;
          const [curMin, curMax] = this.getCurrentRange();
          if (isMin) {
            let nextMin = curMin + delta;
            nextMin = Math.max(this.min, Math.min(curMax, nextMin));
            const decimals = (this.step.toString().split('.')[1] || '').length;
            const invStep = 1 / this.step;
            nextMin = Math.round(nextMin * invStep) / invStep;
            nextMin = parseFloat(nextMin.toFixed(Math.min(decimals, 4)));
            if (nextMin !== curMin) {
              this.triggerTick();
              this.setRangeValue(nextMin, curMax);
            }
          } else {
            let nextMax = curMax + delta;
            nextMax = Math.max(curMin, Math.min(this.max, nextMax));
            const decimals = (this.step.toString().split('.')[1] || '').length;
            const invStep = 1 / this.step;
            nextMax = Math.round(nextMax * invStep) / invStep;
            nextMax = parseFloat(nextMax.toFixed(Math.min(decimals, 4)));
            if (nextMax !== curMax) {
              this.triggerTick();
              this.setRangeValue(curMin, nextMax);
            }
          }
        },
        { passive: false }
      );
    };
    bindWheel(this.inputMin, true);
    bindWheel(this.inputMax, false);

    // Dragging thumb min
    this.setupThumbDrag(this.thumbMin, 'min');

    // Dragging thumb max
    this.setupThumbDrag(this.thumbMax, 'max');

    // Dragging range bar (shifts whole interval)
    this.setupBarDrag();
  }

  private setupThumbDrag(thumb: HTMLElement, type: 'min' | 'max'): void {
    let isDragging = false;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging) return;
      const rect = this.trackEl.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const rawVal = this.min + pct * (this.max - this.min);
      const steppedVal = this.applyStep(rawVal);
      const [curMin, curMax] = this.getCurrentRange();

      if (type === 'min') {
        const nextMin = Math.min(steppedVal, curMax);
        if (nextMin !== curMin) {
          this.triggerTick();
          this.setRangeValue(nextMin, curMax);
        }
      } else {
        const nextMax = Math.max(steppedVal, curMin);
        if (nextMax !== curMax) {
          this.triggerTick();
          this.setRangeValue(curMin, nextMax);
        }
      }
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
    };

    thumb.addEventListener('mousedown', (ev) => {
      if (ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      isDragging = true;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  private setupBarDrag(): void {
    let isDragging = false;
    let startX = 0;
    let startMin = 0;
    let startMax = 0;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging) return;
      const rect = this.trackEl.getBoundingClientRect();
      const dxPct = (ev.clientX - startX) / rect.width;
      const deltaVal = dxPct * (this.max - this.min);
      const span = startMax - startMin;

      let newMin = Math.max(this.min, Math.min(this.max - span, startMin + deltaVal));
      newMin = this.applyStep(newMin);
      const newMax = this.applyStep(newMin + span);

      const [curMin, curMax] = this.getCurrentRange();
      if (newMin !== curMin || newMax !== curMax) {
        this.triggerTick();
        this.setRangeValue(newMin, newMax);
      }
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
    };

    this.barEl.addEventListener('mousedown', (ev) => {
      if (ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      isDragging = true;
      startX = ev.clientX;
      const [curMin, curMax] = this.getCurrentRange();
      startMin = curMin;
      startMax = curMax;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  private applyStep(val: number): number {
    const stepped = Math.round(val / this.step) * this.step;
    const decimals = (this.step.toString().split('.')[1] || '').length;
    return parseFloat(stepped.toFixed(decimals));
  }

  private triggerTick(): void {
    const now = Date.now();
    if (now - this.lastSoundTime >= 60) {
      this.lastSoundTime = now;
      this.soundEngine?.playTick();
    }
  }

  private getCurrentRange(): [number, number] {
    const val = this.getValue();
    if (Array.isArray(val)) {
      return [val[0] ?? this.min, val[1] ?? this.max];
    } else if (typeof val === 'object' && val !== null) {
      return [(val as any).min ?? this.min, (val as any).max ?? this.max];
    }
    return [this.min, this.max];
  }

  private setRangeValue(vMin: number, vMax: number): void {
    const clampedMin = Math.max(this.min, Math.min(vMin, this.max));
    const clampedMax = Math.max(this.min, Math.min(vMax, this.max));

    const cur = this.getValue();
    if (Array.isArray(cur)) {
      this.setValue([clampedMin, clampedMax]);
    } else {
      this.setValue({
        ...(typeof cur === 'object' && cur !== null ? cur : {}),
        min: clampedMin,
        max: clampedMax
      });
    }
  }

  public setMin(min: number): this {
    this.min = min;
    this.update();
    return this;
  }

  public setMax(max: number): this {
    this.max = max;
    this.update();
    return this;
  }

  public setStep(step: number): this {
    this.step = step;
    this.inputMin.step = step.toString();
    this.inputMax.step = step.toString();
    return this;
  }

  public setFormat(fn: (min: number, max: number) => string): this {
    this.formatter = fn;
    this.update();
    return this;
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public update(): this {
    if (!this.trackEl || !this.thumbMin || !this.thumbMax) return this;
    const [vMin, vMax] = this.getCurrentRange();
    const range = this.max - this.min || 1;

    const minPct = Math.max(0, Math.min(100, ((vMin - this.min) / range) * 100));
    const maxPct = Math.max(0, Math.min(100, ((vMax - this.min) / range) * 100));

    this.thumbMin.style.left = `${minPct}%`;
    this.thumbMax.style.left = `${maxPct}%`;

    this.barEl.style.left = `${minPct}%`;
    this.barEl.style.width = `${Math.max(0, maxPct - minPct)}%`;
    this.barEl.title = this.formatter(vMin, vMax);

    this.inputMin.value = String(vMin);
    this.inputMax.value = String(vMax);

    return this;
  }
}
