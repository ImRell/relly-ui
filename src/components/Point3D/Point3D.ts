import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { Point3DVal } from '../../types';

export class Point3D extends BaseComponent<Point3DVal> {
  private containerEl: HTMLElement;
  private xInput: HTMLInputElement;
  private yInput: HTMLInputElement;
  private zInput: HTMLInputElement;

  private min?: number;
  private max?: number;
  private step: number = 0.1;

  constructor(
    label: string,
    targetObject: any,
    property: string,
    bindingEngine?: BindingEngine,
    presetManager?: PresetManager
  ) {
    super(label, targetObject, property, bindingEngine, presetManager);

    this.containerEl = document.createElement('div');
    this.containerEl.className = 'relly-point3d-container';

    // X item
    const xItem = document.createElement('div');
    xItem.className = 'relly-point3d-item';
    const xTag = document.createElement('span');
    xTag.className = 'relly-point3d-tag relly-point3d-tag--x';
    xTag.textContent = 'X';
    this.xInput = document.createElement('input');
    this.xInput.type = 'number';
    this.xInput.className = 'relly-point3d-input';
    this.xInput.step = String(this.step);
    xItem.appendChild(xTag);
    xItem.appendChild(this.xInput);

    // Y item
    const yItem = document.createElement('div');
    yItem.className = 'relly-point3d-item';
    const yTag = document.createElement('span');
    yTag.className = 'relly-point3d-tag relly-point3d-tag--y';
    yTag.textContent = 'Y';
    this.yInput = document.createElement('input');
    this.yInput.type = 'number';
    this.yInput.className = 'relly-point3d-input';
    this.yInput.step = String(this.step);
    yItem.appendChild(yTag);
    yItem.appendChild(this.yInput);

    // Z item
    const zItem = document.createElement('div');
    zItem.className = 'relly-point3d-item';
    const zTag = document.createElement('span');
    zTag.className = 'relly-point3d-tag relly-point3d-tag--z';
    zTag.textContent = 'Z';
    this.zInput = document.createElement('input');
    this.zInput.type = 'number';
    this.zInput.className = 'relly-point3d-input';
    this.zInput.step = String(this.step);
    zItem.appendChild(zTag);
    zItem.appendChild(this.zInput);

    this.containerEl.appendChild(xItem);
    this.containerEl.appendChild(yItem);
    this.containerEl.appendChild(zItem);
    this.controlEl.appendChild(this.containerEl);

    this.xInput.addEventListener('change', () => this.handleInputChange());
    this.yInput.addEventListener('change', () => this.handleInputChange());
    this.zInput.addEventListener('change', () => this.handleInputChange());

    this.setupInputScrubbing(this.xInput, 'x');
    this.setupInputScrubbing(this.yInput, 'y');
    this.setupInputScrubbing(this.zInput, 'z');

    this.update();
  }

  private setupInputScrubbing(input: HTMLInputElement, axis: 'x' | 'y' | 'z'): void {
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
        if (Array.isArray(currentVal)) {
          const nextArr: [number, number, number] = [
            currentVal[0] ?? 0,
            currentVal[1] ?? 0,
            currentVal[2] ?? 0
          ];
          const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
          nextArr[idx] = newVal;
          this.setValue(nextArr);
        } else {
          this.setValue({ ...currentVal, [axis]: newVal });
        }
        ev.preventDefault();
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (isScrubbing) {
        isScrubbing = false;
        if (typeof document !== 'undefined') {
          document.body.classList.remove('relly-jog-scrubbing');
        }
      }
    };

    input.addEventListener('mousedown', (ev: MouseEvent) => {
      if (ev.button !== 0) return;
      startX = ev.clientX;
      startVal = parseFloat(input.value) || 0;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  private handleInputChange(): void {
    const x = parseFloat(this.xInput.value) || 0;
    const y = parseFloat(this.yInput.value) || 0;
    const z = parseFloat(this.zInput.value) || 0;

    const currentVal = this.getValue();
    if (Array.isArray(currentVal)) {
      this.setValue([x, y, z]);
    } else {
      this.setValue({
        ...(typeof currentVal === 'object' && currentVal !== null ? currentVal : {}),
        x,
        y,
        z
      });
    }
  }

  public setMin(min?: number): this {
    this.min = min;
    if (min !== undefined) {
      this.xInput.min = min.toString();
      this.yInput.min = min.toString();
      this.zInput.min = min.toString();
    } else {
      this.xInput.removeAttribute('min');
      this.yInput.removeAttribute('min');
      this.zInput.removeAttribute('min');
    }
    return this;
  }

  public setMax(max?: number): this {
    this.max = max;
    if (max !== undefined) {
      this.xInput.max = max.toString();
      this.yInput.max = max.toString();
      this.zInput.max = max.toString();
    } else {
      this.xInput.removeAttribute('max');
      this.yInput.removeAttribute('max');
      this.zInput.removeAttribute('max');
    }
    return this;
  }

  public setStep(step: number): this {
    this.step = step;
    this.xInput.step = step.toString();
    this.yInput.step = step.toString();
    this.zInput.step = step.toString();
    return this;
  }

  public update(): this {
    if (!this.xInput || !this.yInput || !this.zInput) return this;
    const val = this.getValue();
    let x = 0;
    let y = 0;
    let z = 0;

    if (Array.isArray(val)) {
      x = val[0] || 0;
      y = val[1] || 0;
      z = val[2] || 0;
    } else if (typeof val === 'object' && val !== null) {
      x = (val as any).x || 0;
      y = (val as any).y || 0;
      z = (val as any).z || 0;
    }

    this.xInput.value = String(x);
    this.yInput.value = String(y);
    this.zInput.value = String(z);
    return this;
  }
}
