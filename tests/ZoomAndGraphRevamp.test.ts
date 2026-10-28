import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RellyUI } from '../src/RellyUI';

describe('Zoom Viewport Protection, Mini-HUD & Next-Gen Graph Revamp', () => {
  let ui: RellyUI;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (ui) {
      ui.destroy();
    }
  });

  describe('Viewport Clamping & Screen Edge Protection', () => {
    it('should clamp panel coordinates within visible viewport', () => {
      ui = new RellyUI({
        shadowDOM: false,
        position: { left: 5000, top: 4000 }
      });

      const panel = ui.getElement();
      ui.clampToViewport();

      const left = parseFloat(panel.style.left || '0');
      const top = parseFloat(panel.style.top || '0');

      expect(left).toBeLessThanOrEqual(window.innerWidth);
      expect(top).toBeLessThanOrEqual(window.innerHeight);
      expect(left).toBeGreaterThanOrEqual(0);
      expect(top).toBeGreaterThanOrEqual(0);
    });

    it('should respond to window resize and keep panel inside viewport', () => {
      ui = new RellyUI({
        shadowDOM: false,
        position: { left: 100, top: 100 }
      });

      const panel = ui.getElement();
      panel.style.left = '2000px';

      // Simulate window resize
      window.dispatchEvent(new Event('resize'));

      const left = parseFloat(panel.style.left);
      expect(left).toBeLessThanOrEqual(Math.max(0, window.innerWidth - panel.offsetWidth));
    });
  });

  describe('Mini-HUD (Floating Pill Mode)', () => {
    it('should toggle Mini-HUD pill mode and play sound', () => {
      ui = new RellyUI({ shadowDOM: false });
      const soundEngine = ui.getSoundEngine();
      const soundSpy = vi.spyOn(soundEngine, 'playMiniHud');

      expect(ui.isMiniHudMode()).toBe(false);
      expect(ui.getElement().classList.contains('relly-mini-hud')).toBe(false);

      ui.toggleMiniHud();
      expect(ui.isMiniHudMode()).toBe(true);
      expect(ui.getElement().classList.contains('relly-mini-hud')).toBe(true);
      expect(soundSpy).toHaveBeenCalledWith(true);

      ui.toggleMiniHud();
      expect(ui.isMiniHudMode()).toBe(false);
      expect(ui.getElement().classList.contains('relly-mini-hud')).toBe(false);
      expect(soundSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('Next-Gen Graph Component', () => {
    it('should support multi-series data and custom formats', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { fps: 60 };

      const graph = ui
        .addGraph(state, 'fps')
        .setLabel('GPU Telemetry')
        .setRange(0, 144)
        .setFormat((v) => `${v.toFixed(1)} fps`);

      // Add secondary series
      graph.addSeries('frametime', {
        label: 'Frame Time',
        color: '#f43f5e',
        fillColor: 'rgba(244, 63, 94, 0.2)'
      });

      // Push multi-series values
      graph.pushSeries('frametime', 16.6);
      graph.push(62.4);

      const valBadge = graph.element.querySelector('.relly-graph-val');
      expect(valBadge?.textContent).toBe('62.4 fps');

      const legend = graph.element.querySelector('.relly-graph-legend');
      expect(legend?.textContent).toContain('Frame Time');
    });

    it('should handle interactive hover inspector quietly and pause/freeze on click', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { ping: 25 };
      const soundEngine = ui.getSoundEngine();
      const tickSpy = vi.spyOn(soundEngine, 'playTick');
      const clickSpy = vi.spyOn(soundEngine, 'playClick');

      const graph = ui
        .addGraph(state, 'ping')
        .setBufferSize(20)
        .setFormat((v) => `${Math.round(v)} ms`);

      for (let i = 0; i < 20; i++) {
        graph.push(20 + i * 2);
      }

      const canvas = graph.element.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).toBeDefined();

      // Simulate mouse move over canvas (silent, no tick)
      const mouseMoveEv = new MouseEvent('mousemove', {
        clientX: 140,
        clientY: 25,
        bubbles: true
      });
      canvas.dispatchEvent(mouseMoveEv);

      const tooltip = graph.element.querySelector('.relly-graph-tooltip') as HTMLElement;
      expect(tooltip).toBeDefined();
      expect(tooltip.classList.contains('relly-tooltip-show')).toBe(true);
      expect(tooltip.textContent).toContain('ms');
      expect(tickSpy).not.toHaveBeenCalled();

      // Simulate mouse leave
      canvas.dispatchEvent(new MouseEvent('mouseleave'));
      expect(tooltip.classList.contains('relly-tooltip-show')).toBe(false);

      // Click on canvas toggles pause and plays click sound
      expect(graph.isGraphPaused()).toBe(false);
      canvas.click();
      expect(clickSpy).toHaveBeenCalled();
      expect(graph.isGraphPaused()).toBe(true);
      expect(graph.element.querySelector('.relly-graph-badge--paused')).toBeDefined();

      canvas.click();
      expect(graph.isGraphPaused()).toBe(false);
    });

    it('should safely handle zero data, empty buffers, and NaN without throwing', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { value: NaN };

      const graph = ui.addGraph(state, 'value');
      expect(() => {
        graph.push(NaN);
        graph.push(Infinity);
        graph.push(-Infinity);
        graph.update();
      }).not.toThrow();
    });

    it('should create built-in FPS and Memory graphs', () => {
      ui = new RellyUI({ shadowDOM: false });

      const fpsGraph = ui.addFPSGraph('Real-time FPS');
      expect(fpsGraph).toBeDefined();
      expect(fpsGraph.getLabel()).toBe('Real-time FPS');

      const memGraph = ui.addMemoryGraph('RAM Allocation');
      expect(memGraph).toBeDefined();
      expect(memGraph.getLabel()).toBe('RAM Allocation');

      fpsGraph.destroy();
      memGraph.destroy();
    });
  });

  describe('Pro Features: Jog-Dial Scrubbing, Ghost Mode, Accordion & Disabled State', () => {
    it('should support Virtual Jog-Dial scrubbing on slider number inputs', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { volume: 50 };
      const slider = ui.addSlider(state, 'volume').setMin(0).setMax(100).setStep(1);

      const numberInput = slider.element.querySelector('.relly-slider-number') as HTMLInputElement;
      expect(numberInput).toBeDefined();
      expect(slider.getValue()).toBe(50);

      // Simulate drag scrubbing
      numberInput.dispatchEvent(new MouseEvent('mousedown', { clientX: 100 }));
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120 }));
      window.dispatchEvent(new MouseEvent('mouseup'));

      expect(slider.getValue()).toBe(70);
      expect(state.volume).toBe(70);
    });

    it('should toggle ghost mode and sound volume', () => {
      ui = new RellyUI({ shadowDOM: false, ghostOnIdle: true, idleOpacity: 0.35 });
      expect(ui.isGhostMode()).toBe(true);
      expect(ui.getElement().style.opacity).toBe('0.35');

      ui.setGhostMode(false);
      expect(ui.isGhostMode()).toBe(false);
      expect(ui.getElement().style.opacity).toBe('1');

      ui.setSoundVolume(0.5);
      expect(ui.getSoundVolume()).toBe(0.5);
    });

    it('should enforce accordion mode across sections', () => {
      ui = new RellyUI({ shadowDOM: false, accordion: true });
      const sec1 = ui.addSection('Section 1');
      const sec2 = ui.addSection('Section 2', true);

      expect(sec1.element.classList.contains('relly-section--collapsed')).toBe(false);
      expect(sec2.element.classList.contains('relly-section--collapsed')).toBe(true);

      // Expanding sec2 should collapse sec1 in accordion mode
      sec2.setCollapsed(false);
      expect(sec2.element.classList.contains('relly-section--collapsed')).toBe(false);
      expect(sec1.element.classList.contains('relly-section--collapsed')).toBe(true);
    });

    it('should support disabling components and sections', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { enabled: true };
      const cb = ui.addCheckbox(state, 'enabled');

      expect(cb.isDisabled()).toBe(false);
      cb.setDisabled(true);
      expect(cb.isDisabled()).toBe(true);
      expect(cb.element.classList.contains('relly-disabled')).toBe(true);

      const sec = ui.addSection('Restricted');
      sec.setDisabled(true);
      expect(sec.isDisabled()).toBe(true);
      expect(sec.element.classList.contains('relly-disabled')).toBe(true);
    });

    it('should focus search bar on pressing "/"', () => {
      ui = new RellyUI({ shadowDOM: false, searchBar: true });
      const searchInput = ui.getElement().querySelector('.relly-search-input') as HTMLInputElement;
      expect(searchInput).toBeDefined();

      const focusSpy = vi.spyOn(searchInput, 'focus');
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(focusSpy).toHaveBeenCalled();
    });
  });
});
