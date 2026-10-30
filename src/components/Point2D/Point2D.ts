import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export type Point2DVal = { x: number; y: number } | [number, number];

export class Point2D extends BaseComponent<Point2DVal> {
  private containerEl: HTMLElement;
  private xInput: HTMLInputElement;
  private yInput: HTMLInputElement;
  private soundEngine?: SoundEngine;
  private lastSoundTime: number = 0;

  private min?: number;
  private max?: number;
  private step: number = 0.1;

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
    this.containerEl.className = 'relly-point2d-container';

    // X item
    const xItem = document.createElement('div');
    xItem.className = 'relly-point2d-item';
    const xTag = document.createElement('span');
    xTag.className = 'relly-point2d-tag';
    xTag.textContent = 'X';
    this.xInput = document.createElement('input');
    this.xInput.type = 'number';
    this.xInput.className = 'relly-point2d-input';
    this.xInput.step = String(this.step);
    const xCell = this.createCell(this.xInput, 'x');
    xItem.appendChild(xTag);
    xItem.appendChild(xCell);

    // Y item
    const yItem = document.createElement('div');
    yItem.className = 'relly-point2d-item';
    const yTag = document.createElement('span');
    yTag.className = 'relly-point2d-tag';
    yTag.textContent = 'Y';
    this.yInput = document.createElement('input');
    this.yInput.type = 'number';
    this.yInput.className = 'relly-point2d-input';
    this.yInput.step = String(this.step);
    const yCell = this.createCell(this.yInput, 'y');
    yItem.appendChild(yTag);
    yItem.appendChild(yCell);

    this.containerEl.appendChild(xItem);
    this.containerEl.appendChild(yItem);
    this.controlEl.appendChild(this.containerEl);

    this.xInput.addEventListener('change', () => this.handleInputChange());
    this.yInput.addEventListener('change', () => this.handleInputChange());

    this.setupInputScrubbing(this.xInput, 'x');
    this.setupInputScrubbing(this.yInput, 'y');

    this.update();
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  private triggerTick(): void {
    const now = Date.now();
    if (now - this.lastSoundTime >= 50) {
      this.lastSoundTime = now;
      this.soundEngine?.playTick();
    }
  }

  private createCell(input: HTMLInputElement, axis: 'x' | 'y'): HTMLElement {
    const cellWrap = document.createElement('div');
    cellWrap.className = 'relly-vector-cell';

    const arrows = document.createElement('div');
    arrows.className = 'relly-stepper-arrows';

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'relly-stepper-btn relly-stepper-btn--up';
    upBtn.setAttribute('aria-label', `Increase ${axis.toUpperCase()}`);
    upBtn.innerHTML = '<svg width="7" height="4" viewBox="0 0 7 4" fill="none"><path d="M1 3.2L3.5 0.8L6 3.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'relly-stepper-btn relly-stepper-btn--down';
    downBtn.setAttribute('aria-label', `Decrease ${axis.toUpperCase()}`);
    downBtn.innerHTML = '<svg width="7" height="4" viewBox="0 0 7 4" fill="none"><path d="M1 0.8L3.5 3.2L6 0.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    this.bindStepperEvents(upBtn, axis, 1);
    this.bindStepperEvents(downBtn, axis, -1);

    arrows.appendChild(upBtn);
    arrows.appendChild(downBtn);

    cellWrap.appendChild(input);
    cellWrap.appendChild(arrows);

    input.addEventListener(
      'wheel',
      (ev: WheelEvent) => {
        ev.preventDefault();
        const dir = ev.deltaY < 0 ? 1 : -1;
        const mult = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
        this.stepAxis(axis, dir, mult);
      },
      { passive: false }
    );

    return cellWrap;
  }

  private bindStepperEvents(btn: HTMLButtonElement, axis: 'x' | 'y', direction: 1 | -1): void {
    let timeoutId: any = null;
    let intervalId: any = null;

    const stop = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      window.removeEventListener('mouseup', stop);
    };

    btn.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      this.stepAxis(axis, direction);

      timeoutId = setTimeout(() => {
        intervalId = setInterval(() => {
          this.stepAxis(axis, direction);
        }, 70);
      }, 300);

      window.addEventListener('mouseup', stop);
    });
  }

  private stepAxis(axis: 'x' | 'y', direction: 1 | -1, multiplier: number = 1): void {
    const currentVal = this.getValue();
    let val: number;
    if (Array.isArray(currentVal)) {
      val = currentVal[axis === 'x' ? 0 : 1] ?? 0;
    } else {
      val = currentVal[axis] ?? 0;
    }

    const stepDelta = this.step * direction * multiplier;
    let newVal = val + stepDelta;
    if (this.min !== undefined) newVal = Math.max(this.min, newVal);
    if (this.max !== undefined) newVal = Math.min(this.max, newVal);

    const decimals = (this.step.toString().split('.')[1] || '').length;
    const invStep = 1 / this.step;
    newVal = Math.round(newVal * invStep) / invStep;
    newVal = parseFloat(newVal.toFixed(Math.min(decimals, 4)));

    if (newVal !== val) {
      if (Array.isArray(currentVal)) {
        const nextArr: [number, number] = [currentVal[0], currentVal[1]];
        nextArr[axis === 'x' ? 0 : 1] = newVal;
        this.setValue(nextArr);
      } else {
        this.setValue({ ...currentVal, [axis]: newVal });
      }
      this.triggerTick();
    }
  }

  private setupInputScrubbing(input: HTMLInputElement, axis: 'x' | 'y'): void {
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
        let newVal = startVal + dx * stepDelta;
        if (this.min !== undefined) newVal = Math.max(this.min, newVal);
        if (this.max !== undefined) newVal = Math.min(this.max, newVal);
        const decimals = (stepDelta.toString().split('.')[1] || '').length;
        const invStep = 1 / stepDelta;
        newVal = Math.round(newVal * invStep) / invStep;
        newVal = parseFloat(newVal.toFixed(Math.min(decimals, 4)));

        const currentVal = this.getValue();
        let prevAxisVal: number;
        if (Array.isArray(currentVal)) {
          prevAxisVal = currentVal[axis === 'x' ? 0 : 1] ?? 0;
        } else {
          prevAxisVal = currentVal[axis] ?? 0;
        }

        if (newVal !== prevAxisVal) {
          if (Array.isArray(currentVal)) {
            const nextArr: [number, number] = [currentVal[0], currentVal[1]];
            nextArr[axis === 'x' ? 0 : 1] = newVal;
            this.setValue(nextArr);
          } else {
            this.setValue({ ...currentVal, [axis]: newVal });
          }
          this.triggerTick();
        }
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

    input.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startVal = parseFloat(input.value) || 0;
      isScrubbing = false;

      if (typeof window !== 'undefined') {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }
    });
  }

  public setMin(min: number): this {
    this.min = min;
    this.xInput.min = String(min);
    this.yInput.min = String(min);
    return this;
  }

  public setMax(max: number): this {
    this.max = max;
    this.xInput.max = String(max);
    this.yInput.max = String(max);
    return this;
  }

  public setStep(step: number): this {
    this.step = step;
    this.xInput.step = String(step);
    this.yInput.step = String(step);
    return this;
  }

  public override getValue(): Point2DVal {
    if (this.targetObject && this.property && this.targetObject[this.property] !== undefined) {
      return this.targetObject[this.property];
    }
    if (this.targetObject && 'x' in this.targetObject && 'y' in this.targetObject) {
      return this.targetObject;
    }
    return (this.prevValue as Point2DVal) || { x: 0, y: 0 };
  }

  public override setValue(value: Point2DVal): this {
    const rawPrev = this.getValue();
    const prev = Array.isArray(rawPrev)
      ? [...rawPrev]
      : typeof rawPrev === 'object' && rawPrev !== null
        ? { ...rawPrev }
        : rawPrev;

    if (this.targetObject && this.property && this.targetObject[this.property] !== undefined) {
      this.targetObject[this.property] = value;
    } else if (
      this.targetObject &&
      'x' in this.targetObject &&
      'y' in this.targetObject &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      this.targetObject.x = value.x;
      this.targetObject.y = value.y;
    }
    this.prevValue = value;
    this.update();
    this.triggerChange(value, prev as Point2DVal);
    return this;
  }

  private handleInputChange(): void {
    let x = parseFloat(this.xInput.value) || 0;
    let y = parseFloat(this.yInput.value) || 0;

    if (this.min !== undefined) {
      x = Math.max(this.min, x);
      y = Math.max(this.min, y);
    }
    if (this.max !== undefined) {
      x = Math.min(this.max, x);
      y = Math.min(this.max, y);
    }

    const currentVal = this.getValue();
    if (Array.isArray(currentVal)) {
      this.setValue([x, y]);
    } else {
      this.setValue({ ...currentVal, x, y });
    }
  }

  public update(): this {
    if (!this.xInput || !this.yInput) return this;
    const val = this.getValue();
    let x = 0;
    let y = 0;

    if (Array.isArray(val)) {
      x = val[0] || 0;
      y = val[1] || 0;
    } else if (typeof val === 'object' && val !== null) {
      x = (val as any).x || 0;
      y = (val as any).y || 0;
    }

    this.xInput.value = String(x);
    this.yInput.value = String(y);
    return this;
  }
}
