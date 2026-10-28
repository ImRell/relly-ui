import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RellyUI } from '../src/RellyUI';
import { Point3D } from '../src/components/Point3D/Point3D';
import { RangeSlider } from '../src/components/Range/RangeSlider';
import { Segmented } from '../src/components/Segmented/Segmented';
import { StatusIndicator } from '../src/components/Status/StatusIndicator';
import { ToastManager } from '../src/core/ToastManager';
import { ContextMenuManager } from '../src/core/ContextMenuManager';

describe('Sprint Controls & Features', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('1. Point3D / Vector3 Component', () => {
    it('should initialize with object coordinates and update via inputs', () => {
      const pos = { x: 5, y: 15, z: 25 };
      const comp = new Point3D('Position', pos, 'pos');
      comp.setValue({ x: 5, y: 15, z: 25 });

      expect(comp.getValue()).toEqual({ x: 5, y: 15, z: 25 });

      const inputs = comp.element.querySelectorAll<HTMLInputElement>('.relly-point3d-input');
      expect(inputs.length).toBe(3);
      expect(inputs[0].value).toBe('5');
      expect(inputs[1].value).toBe('15');
      expect(inputs[2].value).toBe('25');

      // Change Z value manually
      inputs[2].value = '42';
      inputs[2].dispatchEvent(new Event('change'));

      expect(comp.getValue().z).toBe(42);
    });

    it('should support array coordinates [x, y, z]', () => {
      const rot = { rotation: [0, 90, 180] as [number, number, number] };
      const comp = new Point3D('Rotation', rot, 'rotation');

      expect(comp.getValue()).toEqual([0, 90, 180]);

      const inputs = comp.element.querySelectorAll<HTMLInputElement>('.relly-point3d-input');
      inputs[1].value = '45';
      inputs[1].dispatchEvent(new Event('change'));

      expect(rot.rotation).toEqual([0, 45, 180]);
    });
  });

  describe('2. Dual-Handle Range Slider', () => {
    it('should initialize and display range bounds', () => {
      const state = { range: [10, 80] as [number, number] };
      const range = new RangeSlider('Cutoff', state, 'range');
      range.setMin(0).setMax(100).setStep(1);

      expect(range.getValue()).toEqual([10, 80]);

      const minInput = range.element.querySelector<HTMLInputElement>('.relly-range-input--min')!;
      const maxInput = range.element.querySelector<HTMLInputElement>('.relly-range-input--max')!;
      expect(minInput.value).toBe('10');
      expect(maxInput.value).toBe('80');

      // Update min input
      minInput.value = '25';
      minInput.dispatchEvent(new Event('change'));

      expect(state.range).toEqual([25, 80]);
    });

    it('should clamp min so it never exceeds max', () => {
      const state = { range: [10, 50] as [number, number] };
      const range = new RangeSlider('Limits', state, 'range');
      range.setMin(0).setMax(100);

      const minInput = range.element.querySelector<HTMLInputElement>('.relly-range-input--min')!;
      minInput.value = '90'; // Exceeds current max of 50
      minInput.dispatchEvent(new Event('change'));

      expect(state.range[0]).toBe(50);
    });
  });

  describe('3. Segmented Control', () => {
    it('should switch options and highlight active segment', () => {
      const state = { mode: 'solid' };
      const seg = new Segmented('Render Mode', state, 'mode', ['wire', 'solid', 'points']);

      const buttons = seg.element.querySelectorAll<HTMLButtonElement>('.relly-segmented-btn');
      expect(buttons.length).toBe(3);
      expect(buttons[1].classList.contains('relly-segmented-btn--active')).toBe(true);

      // Click 'points'
      buttons[2].click();

      expect(state.mode).toBe('points');
      expect(buttons[2].classList.contains('relly-segmented-btn--active')).toBe(true);
      expect(buttons[1].classList.contains('relly-segmented-btn--active')).toBe(false);
    });
  });

  describe('4. Status Indicator', () => {
    it('should display status LED and badge with live updates', () => {
      const state = { serverStatus: 'online' };
      const status = new StatusIndicator('Server', state, 'serverStatus');

      const led = status.element.querySelector('.relly-status-led')!;
      const badge = status.element.querySelector('.relly-status-badge')!;

      expect(led.classList.contains('relly-status-led--online')).toBe(true);
      expect(badge.textContent).toBe('ONLINE');

      // Update status
      status.setStatus('busy', 'SYNCING', '98% complete');
      expect(led.classList.contains('relly-status-led--busy')).toBe(true);
      expect(badge.textContent).toBe('SYNCING');

      const detail = status.element.querySelector('.relly-status-detail')!;
      expect(detail.textContent).toBe('98% complete');
    });
  });

  describe('5. In-Panel Toast Notifications', () => {
    it('should render toast notification and auto-dismiss', () => {
      const panel = document.createElement('div');
      panel.className = 'relly-panel';
      container.appendChild(panel);

      const toastManager = new ToastManager(panel);
      const toast = toastManager.notify('Operation completed', 'success', 500);

      expect(panel.querySelector('.relly-toast-container')).toBeTruthy();
      expect(toast.classList.contains('relly-toast--success')).toBe(true);
      expect(toast.textContent).toContain('Operation completed');

      // Dismiss immediately via close button
      const closeBtn = toast.querySelector<HTMLButtonElement>('.relly-toast-close')!;
      closeBtn.click();
      expect(toast.classList.contains('relly-toast-leave')).toBe(true);

      toastManager.destroy();
    });
  });

  describe('6. Custom Context Menu on Controls', () => {
    it('should open context menu with creator-defined options on right-click', () => {
      const state = { value: 100 };
      const ui = new RellyUI({ container, shadowDOM: false });
      const slider = ui.addSlider(state, 'value', { min: 0, max: 200 });

      const onReset = vi.fn();
      slider.setContextMenu([
        { label: 'Reset to 0', action: () => onReset() },
        { separator: true, label: '' },
        { label: 'Danger Action', danger: true, action: () => {} }
      ]);

      // Trigger contextmenu on slider element
      const evt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      });
      slider.element.dispatchEvent(evt);

      const menu = ui.getElement().querySelector('.relly-context-menu') as HTMLElement;
      expect(menu).toBeTruthy();
      expect(menu.style.display).not.toBe('none');

      const items = menu.querySelectorAll<HTMLButtonElement>('.relly-context-item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('Reset to 0');
      expect(items[1].classList.contains('relly-context-item--danger')).toBe(true);

      // Click first action
      items[0].click();
      expect(onReset).toHaveBeenCalled();
      expect(menu.style.display).toBe('none');

      ui.destroy();
    });
  });
});
