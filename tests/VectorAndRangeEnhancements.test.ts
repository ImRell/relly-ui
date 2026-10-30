import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RellyUI } from '../src/RellyUI';
import { Point2D } from '../src/components/Point2D/Point2D';
import { Point3D } from '../src/components/Point3D/Point3D';

describe('Vector and Range Enhancements', () => {
  let ui: RellyUI;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (ui) {
      ui.destroy();
    }
    vi.restoreAllMocks();
  });

  it('contains CSS rules for wider RangeSlider inputs and centered vector inputs', () => {
    const compCss = fs.readFileSync(path.resolve(__dirname, '../src/styles/components.css'), 'utf-8');

    // RangeSlider inputs wider and centered
    expect(compCss).toContain('.relly-range-input');
    expect(compCss).toMatch(/\.relly-range-input\s*\{[^}]*width:\s*48px;/);
    expect(compCss).toMatch(/\.relly-range-input\s*\{[^}]*min-width:\s*48px;/);
    expect(compCss).toMatch(/\.relly-range-input\s*\{[^}]*text-align:\s*center;/);

    // Suppress native spin buttons and globally center number inputs
    expect(compCss).toContain('input[type="number"]::-webkit-inner-spin-button');
    expect(compCss).toContain('-webkit-appearance: none !important');
    expect(compCss).toMatch(/input\[type="number"\]\s*\{[^}]*text-align:\s*center;/);

    // Vector inputs centered
    expect(compCss).toMatch(/\.relly-point2d-input\s*\{[^}]*text-align:\s*center;/);
    expect(compCss).toMatch(/\.relly-point3d-input\s*\{[^}]*text-align:\s*center;/);

    // All other component boxes centered
    expect(compCss).toMatch(/\.relly-slider-number\s*\{[^}]*text-align:\s*center;/);
    expect(compCss).toMatch(/\.relly-color-text\s*\{[^}]*text-align:\s*center;/);
    expect(compCss).toMatch(/\.relly-progress-text\s*\{[^}]*text-align:\s*center;/);
    expect(compCss).toMatch(/\.relly-dynamic-value\s*\{[^}]*text-align:\s*center;/);

    // Custom stepper arrows rules
    expect(compCss).toContain('.relly-vector-cell');
    expect(compCss).toContain('.relly-stepper-arrows');
    expect(compCss).toContain('.relly-stepper-btn');
  });

  it('renders custom stepper buttons on Point2D inputs with SVG icons', () => {
    const state = { position: { x: 10, y: 20 } };
    ui = new RellyUI();
    const p2d = ui.addPoint2D(state, 'position');

    const cells = p2d.element.querySelectorAll('.relly-vector-cell');
    expect(cells.length).toBe(2);

    const xUpBtn = cells[0].querySelector('.relly-stepper-btn--up') as HTMLButtonElement;
    const xDownBtn = cells[0].querySelector('.relly-stepper-btn--down') as HTMLButtonElement;

    expect(xUpBtn).toBeDefined();
    expect(xDownBtn).toBeDefined();
    expect(xUpBtn.querySelector('svg')).not.toBeNull();
    expect(xDownBtn.querySelector('svg')).not.toBeNull();
    expect(xUpBtn.getAttribute('aria-label')).toBe('Increase X');
    expect(xDownBtn.getAttribute('aria-label')).toBe('Decrease X');
  });

  it('increments and decrements Point2D values using stepper buttons and plays tick sound', () => {
    vi.useFakeTimers();
    try {
      const state = { position: { x: 10, y: 20 } };
      ui = new RellyUI();
      const soundEngine = ui.getSoundEngine();
      const tickSpy = vi.spyOn(soundEngine, 'playTick');

      const p2d = ui.addPoint2D(state, 'position').setStep(1);
      const cells = p2d.element.querySelectorAll('.relly-vector-cell');
      const xUpBtn = cells[0].querySelector('.relly-stepper-btn--up') as HTMLButtonElement;
      const xDownBtn = cells[0].querySelector('.relly-stepper-btn--down') as HTMLButtonElement;

      // Click UP on X
      xUpBtn.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      expect(state.position.x).toBe(11);
      expect(tickSpy).toHaveBeenCalledTimes(1);

      // Advance past 50ms cooldown
      vi.advanceTimersByTime(60);

      // Click DOWN on X
      xDownBtn.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      expect(state.position.x).toBe(10);
      expect(tickSpy).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('supports repeat-on-hold for vector stepper buttons', () => {
    vi.useFakeTimers();
    try {
      const state = { position: { x: 0, y: 0 } };
      ui = new RellyUI();
      const p2d = ui.addPoint2D(state, 'position').setStep(1);
      const cells = p2d.element.querySelectorAll('.relly-vector-cell');
      const xUpBtn = cells[0].querySelector('.relly-stepper-btn--up') as HTMLButtonElement;

      // Mouse down initiates hold
      xUpBtn.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
      expect(state.position.x).toBe(1);

      // Advance past delay (300ms) plus 2 repeats (2 * 70ms = 140ms)
      vi.advanceTimersByTime(450);
      expect(state.position.x).toBeGreaterThanOrEqual(3);

      // Mouse up stops repeating
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      const valAfterStop = state.position.x;

      vi.advanceTimersByTime(200);
      expect(state.position.x).toBe(valAfterStop);
    } finally {
      vi.useRealTimers();
    }
  });

  it('adjusts Point2D via mouse wheel and triggers tick sound', () => {
    vi.useFakeTimers();
    try {
      const state = { position: { x: 5, y: 15 } };
      ui = new RellyUI();
      const soundEngine = ui.getSoundEngine();
      const tickSpy = vi.spyOn(soundEngine, 'playTick');

      const p2d = ui.addPoint2D(state, 'position').setStep(1);
      const xInput = p2d.element.querySelectorAll<HTMLInputElement>('.relly-point2d-input')[0];

      // Wheel up on X (deltaY < 0 -> increments)
      const wheelUp = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
      xInput.dispatchEvent(wheelUp);

      expect(state.position.x).toBe(6);
      expect(tickSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(60);

      // Wheel down on X (deltaY > 0 -> decrements)
      const wheelDown = new WheelEvent('wheel', { deltaY: 100, bubbles: true });
      xInput.dispatchEvent(wheelDown);

      expect(state.position.x).toBe(5);
      expect(tickSpy).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(60);

      // Shift key multiplies step by 10
      const shiftWheelUp = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
      Object.defineProperty(shiftWheelUp, 'shiftKey', { value: true });
      xInput.dispatchEvent(shiftWheelUp);

      expect(state.position.x).toBe(15);
      expect(tickSpy).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('triggers tick sound on Point2D drag scrubbing', () => {
    const state = { position: { x: 0, y: 0 } };
    ui = new RellyUI();
    const soundEngine = ui.getSoundEngine();
    const tickSpy = vi.spyOn(soundEngine, 'playTick');

    const p2d = ui.addPoint2D(state, 'position');
    const xInput = p2d.element.querySelectorAll<HTMLInputElement>('.relly-point2d-input')[0];

    xInput.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, bubbles: true }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(state.position.x).not.toBe(0);
    expect(tickSpy).toHaveBeenCalled();
  });

  it('renders custom stepper buttons and handles wheel & clicks on Point3D', () => {
    vi.useFakeTimers();
    try {
      const state = { velocity: { x: 1, y: 2, z: 3 } };
      ui = new RellyUI();
      const soundEngine = ui.getSoundEngine();
      const tickSpy = vi.spyOn(soundEngine, 'playTick');

      const p3d = ui.addPoint3D(state, 'velocity').setStep(1);
      const cells = p3d.element.querySelectorAll('.relly-vector-cell');
      expect(cells.length).toBe(3);

      const zUpBtn = cells[2].querySelector('.relly-stepper-btn--up') as HTMLButtonElement;
      const zDownBtn = cells[2].querySelector('.relly-stepper-btn--down') as HTMLButtonElement;

      expect(zUpBtn.getAttribute('aria-label')).toBe('Increase Z');
      expect(zDownBtn.getAttribute('aria-label')).toBe('Decrease Z');

      // Click up on Z
      zUpBtn.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      expect(state.velocity.z).toBe(4);
      expect(tickSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(60);

      // Wheel on Y
      const yInput = cells[1].querySelector<HTMLInputElement>('.relly-point3d-input')!;
      yInput.dispatchEvent(new WheelEvent('wheel', { deltaY: -50, bubbles: true }));

      expect(state.velocity.y).toBe(3);
      expect(tickSpy).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('works with array representations for Point2D and Point3D', () => {
    const state2D = { coords: [10, 20] as [number, number] };
    const state3D = { coords3D: [5, 6, 7] as [number, number, number] };
    ui = new RellyUI();

    const p2d = ui.addPoint2D(state2D, 'coords').setStep(1);
    const p3d = ui.addPoint3D(state3D, 'coords3D').setStep(1);

    const p2dCells = p2d.element.querySelectorAll('.relly-vector-cell');
    const yUpBtn = p2dCells[1].querySelector('.relly-stepper-btn--up') as HTMLButtonElement;
    yUpBtn.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(state2D.coords[1]).toBe(21);

    const p3dCells = p3d.element.querySelectorAll('.relly-vector-cell');
    const zDownBtn = p3dCells[2].querySelector('.relly-stepper-btn--down') as HTMLButtonElement;
    zDownBtn.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(state3D.coords3D[2]).toBe(6);
  });

  it('adjusts Slider via mouse wheel on the number input box and triggers tick sound', () => {
    const state = { zoom: 50 };
    ui = new RellyUI();
    const soundEngine = ui.getSoundEngine();
    const tickSpy = vi.spyOn(soundEngine, 'playTick');

    const slider = ui.addSlider(state, 'zoom').setMin(0).setMax(100).setStep(1);
    const numInput = slider.element.querySelector('.relly-slider-number') as HTMLInputElement;

    // Wheel up (increments)
    numInput.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }));
    expect(state.zoom).toBe(51);
    expect(tickSpy).toHaveBeenCalledTimes(1);

    // Wheel down (decrements)
    numInput.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
    expect(state.zoom).toBe(50);
  });

  it('adjusts RangeSlider min and max inputs via mouse wheel and triggers tick sound', () => {
    vi.useFakeTimers();
    try {
      const state = { range: [20, 80] };
      ui = new RellyUI();
      const soundEngine = ui.getSoundEngine();
      const tickSpy = vi.spyOn(soundEngine, 'playTick');

      const range = ui.addRange(state, 'range', { min: 0, max: 100, step: 1 });
      const minInput = range.element.querySelector('.relly-range-input--min') as HTMLInputElement;
      const maxInput = range.element.querySelector('.relly-range-input--max') as HTMLInputElement;

      // Wheel on min input
      minInput.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }));
      expect(state.range[0]).toBe(21);
      expect(tickSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(70);

      // Wheel on max input
      maxInput.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
      expect(state.range[1]).toBe(79);
      expect(tickSpy).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('contains CSS keyframes and classes for header double-click minimization and expansion', () => {
    const panelCss = fs.readFileSync(path.resolve(__dirname, '../src/styles/panel.css'), 'utf-8');

    expect(panelCss).toContain('.relly-panel.relly-mini-hud');
    expect(panelCss).toContain('relly-minihud-shrink');
    expect(panelCss).toContain('.relly-panel.relly-minihud-expanding');
    expect(panelCss).toContain('relly-minihud-expand');
    expect(panelCss).toContain('@keyframes relly-minihud-shrink');
    expect(panelCss).toContain('@keyframes relly-minihud-expand');
    expect(panelCss).toContain('@keyframes relly-fade-slide-down');
  });

  it('toggles mini-hud on header double-click on mousedown (not mouseup) and maintains X position', () => {
    vi.useFakeTimers();
    try {
      ui = new RellyUI({ title: 'Anim Test', position: { top: 20, right: 20 } });
      const panel = ui.getElement();
      const header = panel.querySelector('.relly-header') as HTMLElement;

      const initialRight = panel.style.right;

      // First mousedown
      header.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, button: 0, bubbles: true }));
      vi.advanceTimersByTime(100);
      // Second mousedown immediately triggers minimization
      header.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, button: 0, bubbles: true }));
      expect(panel.classList.contains('relly-mini-hud')).toBe(true);

      // Releasing mouse does not trigger toggle
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      expect(panel.classList.contains('relly-mini-hud')).toBe(true);

      vi.advanceTimersByTime(150);

      // Double-click mousedown again expands back
      header.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, button: 0, bubbles: true }));
      vi.advanceTimersByTime(100);
      header.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, button: 0, bubbles: true }));

      expect(panel.classList.contains('relly-mini-hud')).toBe(false);
      expect(panel.classList.contains('relly-minihud-expanding')).toBe(true);

      // Verify X position did not shift to left or change unexpectedly
      expect(panel.style.right).toBe(initialRight);

      // After animation timeout (300ms), expanding class is removed
      vi.advanceTimersByTime(350);
      expect(panel.classList.contains('relly-minihud-expanding')).toBe(false);
      expect(panel.style.right).toBe(initialRight);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not minimize if user drags between clicks or on mouseup after drag', () => {
    vi.useFakeTimers();
    try {
      ui = new RellyUI({ title: 'Drag Test', position: { top: 50, left: 50 } });
      const panel = ui.getElement();
      const header = panel.querySelector('.relly-header') as HTMLElement;

      // Mouse down to start drag
      header.dispatchEvent(new MouseEvent('mousedown', { clientX: 60, clientY: 60, button: 0, bubbles: true }));

      // Move mouse significantly (drag gesture)
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 90, bubbles: true }));

      // Release mouse
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      // Browser might dispatch dblclick event on mouseup
      header.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

      // Should NOT be minimized!
      expect(panel.classList.contains('relly-mini-hud')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('applies collapse expanding animation class on setCollapsed(false)', () => {
    vi.useFakeTimers();
    try {
      ui = new RellyUI();
      const panel = ui.getElement();

      ui.setCollapsed(true);
      expect(panel.classList.contains('relly-collapsed')).toBe(true);

      ui.setCollapsed(false);
      expect(panel.classList.contains('relly-collapsed')).toBe(false);
      expect(panel.classList.contains('relly-collapse-expanding')).toBe(true);

      vi.advanceTimersByTime(350);
      expect(panel.classList.contains('relly-collapse-expanding')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
