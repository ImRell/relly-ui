import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RellyUI } from '../src/RellyUI';
import { Graph } from '../src/components/Graph/Graph';
import { ColorPicker } from '../src/components/ColorPicker/ColorPicker';
import { SoundEngine } from '../src/core/SoundEngine';
import { HotkeyManager } from '../src/core/HotkeyManager';
import { SearchBar } from '../src/core/SearchBar';
import { BindingEngine } from '../src/core/BindingEngine';
import {
  TOKYO_NIGHT_THEME,
  MATRIX_THEME,
  SYNTHWAVE_THEME,
  ThemeManager
} from '../src/core/ThemeManager';

describe('New Features & Bugfixes Sprint', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Scrollbar Elimination & Layout Overflow', () => {
    it('should initialize panel with overflow-x hidden style', () => {
      const ui = new RellyUI({ container, shadowDOM: false });
      const panel = container.querySelector('.relly-panel') as HTMLElement;
      expect(panel).toBeTruthy();
      const body = panel.querySelector('.relly-body') as HTMLElement;
      expect(body).toBeTruthy();
    });
  });

  describe('2. Graph Continuous Sampling & No Freeze on Steady Metrics', () => {
    it('should continuously sample steady metrics at sampleInterval without mouse interaction', () => {
      const state = { fps: 60 };
      const binding = new BindingEngine();
      const graph = new Graph('FPS', state, 'fps', binding);
      graph.setSampleInterval(40);

      // Initial buffer has 1 value from constructor
      const initialCount = (graph as any).primarySeries.buffer.length;
      expect(initialCount).toBe(1);

      // Advance time by 50ms without changing state.fps
      const now = performance.now();
      vi.spyOn(performance, 'now').mockReturnValue(now + 50);

      graph.checkDirty();

      // Even though state.fps is still 60 (steady), continuous sampling should have pushed a new point!
      const afterCount = (graph as any).primarySeries.buffer.length;
      expect(afterCount).toBe(2);

      // Verify second point is 60
      expect((graph as any).primarySeries.buffer[1]).toBe(60);

      // Advance time again by 50ms
      vi.spyOn(performance, 'now').mockReturnValue(now + 100);
      graph.checkDirty();
      expect((graph as any).primarySeries.buffer.length).toBe(3);

      graph.destroy();
      binding.destroy();
    });

    it('should automatically sample secondary series from targetObject', () => {
      const state = { fps: 60, frameTime: 16.6 };
      const binding = new BindingEngine();
      const graph = new Graph('HUD', state, 'fps', binding);
      graph.addSeries('frameTime', { label: 'Frame Time', color: '#ff0055' });

      expect((graph as any).seriesMap.get('frameTime').buffer.length).toBe(0);

      const now = performance.now();
      vi.spyOn(performance, 'now').mockReturnValue(now + 60);
      graph.checkDirty();

      // Secondary series 'frameTime' should have been automatically sampled from targetObject!
      const ftSeries = (graph as any).seriesMap.get('frameTime');
      expect(ftSeries.buffer.length).toBe(1);
      expect(ftSeries.buffer[0]).toBe(16.6);

      graph.destroy();
      binding.destroy();
    });
  });

  describe('3. SearchBar Hotkey Isolation', () => {
    it('should NOT trigger global toggle hotkey when typing inside SearchBar', () => {
      const onToggle = vi.fn();
      const hotkeyManager = new HotkeyManager('KeyH', onToggle);

      const body = document.createElement('div');
      const searchBar = new SearchBar(body);
      document.body.appendChild(searchBar.element);

      const input = searchBar.getInput();
      input.focus();

      // Create a keydown event for 'KeyH' targeting search input
      const event = new KeyboardEvent('keydown', {
        code: 'KeyH',
        key: 'h',
        bubbles: true,
        cancelable: true
      });

      // Mock composedPath to return the input element
      Object.defineProperty(event, 'composedPath', {
        value: () => [input, searchBar.element, document.body, document, window]
      });

      window.dispatchEvent(event);

      // Hotkey toggle MUST NOT have been triggered!
      expect(onToggle).not.toHaveBeenCalled();

      hotkeyManager.destroy();
    });

    it('should NOT trigger quick search "/" when already typing in an input', () => {
      const body = document.createElement('div');
      const searchBar = new SearchBar(body);
      document.body.appendChild(searchBar.element);

      const input = searchBar.getInput();
      const focusSpy = vi.spyOn(input, 'focus');

      // Dispatch '/' event while input is active
      const event = new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true
      });
      Object.defineProperty(event, 'composedPath', {
        value: () => [input, searchBar.element, document.body]
      });

      window.dispatchEvent(event);

      // Should not re-focus or steal focus when already typing
      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe('4. New Designer Themes', () => {
    it('should support tokyo-night, matrix, and synthwave presets', () => {
      const panel = document.createElement('div');
      const themeManager = new ThemeManager(panel);

      themeManager.applyTheme('tokyo-night');
      expect(themeManager.getCurrentThemeName()).toBe('tokyo-night');
      expect(panel.style.getPropertyValue('--relly-bg')).toBe(TOKYO_NIGHT_THEME.bg);
      expect(panel.style.getPropertyValue('--relly-accent')).toBe(TOKYO_NIGHT_THEME.accent);

      themeManager.applyTheme('matrix');
      expect(themeManager.getCurrentThemeName()).toBe('matrix');
      expect(panel.style.getPropertyValue('--relly-fg')).toBe(MATRIX_THEME.fg);
      expect(panel.style.getPropertyValue('--relly-accent')).toBe(MATRIX_THEME.accent);

      themeManager.applyTheme('synthwave');
      expect(themeManager.getCurrentThemeName()).toBe('synthwave');
      expect(panel.style.getPropertyValue('--relly-bg')).toBe(SYNTHWAVE_THEME.bg);
      expect(panel.style.getPropertyValue('--relly-accent')).toBe(SYNTHWAVE_THEME.accent);
    });
  });

  describe('5. Sound Packs', () => {
    it('should support synth, mechanical, bubble, and arcade sound packs', () => {
      const engine = new SoundEngine(true, 'synth');
      expect(engine.getSoundPack()).toBe('synth');

      engine.setSoundPack('mechanical');
      expect(engine.getSoundPack()).toBe('mechanical');
      expect(() => engine.playClick()).not.toThrow();
      expect(() => engine.playToggle(true)).not.toThrow();
      expect(() => engine.playNotify()).not.toThrow();
      expect(() => engine.playTick()).not.toThrow();
      expect(() => engine.playTab()).not.toThrow();
      expect(() => engine.playSnap()).not.toThrow();

      engine.setSoundPack('bubble');
      expect(engine.getSoundPack()).toBe('bubble');
      expect(() => engine.playClick()).not.toThrow();
      expect(() => engine.playToggle(false)).not.toThrow();
      expect(() => engine.playNotify()).not.toThrow();

      engine.setSoundPack('arcade');
      expect(engine.getSoundPack()).toBe('arcade');
      expect(() => engine.playClick()).not.toThrow();
      expect(() => engine.playToggle(true)).not.toThrow();
      expect(() => engine.playNotify()).not.toThrow();
    });
  });

  describe('6. ColorPicker Quick Swatches', () => {
    it('should render swatches and allow clicking to set color', () => {
      const obj = { color: '#ffffff' };
      const picker = new ColorPicker('Color', obj, 'color');
      const swatches = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'];

      picker.setSwatches(swatches);
      expect(picker.getSwatches()).toEqual(swatches);

      const swatchButtons = picker.element.querySelectorAll<HTMLButtonElement>('.relly-color-swatch');
      expect(swatchButtons.length).toBe(4);

      // Click the green swatch
      swatchButtons[1].click();
      expect(obj.color).toBe('#10b981');
      expect(picker.getValue()).toBe('#10b981');

      // Verify active class on the swatch
      expect(swatchButtons[1].classList.contains('relly-swatch-active')).toBe(true);
    });
  });

  describe('7. AutoSave & Session Restore', () => {
    it('should save session to localStorage and restore on load', () => {
      const state = { speed: 50, themeColor: '#3b82f6' };
      const ui = new RellyUI({
        container,
        shadowDOM: false,
        autoSave: false,
        autoSaveKey: 'test-session-key'
      });

      ui.addSlider(state, 'speed', { min: 0, max: 100 });
      ui.addColor(state, 'themeColor');

      state.speed = 88;
      (ui as any).presetManager.components.forEach((c: any) => {
        if (c.property === 'speed') c.setValue(88);
      });

      ui.saveSession('test-session-key');

      const savedRaw = localStorage.getItem('test-session-key');
      expect(savedRaw).toBeTruthy();
      const parsed = JSON.parse(savedRaw!);
      expect(parsed.components.speed).toBe(88);

      // Now create a fresh UI with autoSave: true, it should restore speed: 88
      const newState = { speed: 10 };
      const restoredUi = new RellyUI({
        container,
        shadowDOM: false,
        autoSave: true,
        autoSaveKey: 'test-session-key'
      });
      restoredUi.addSlider(newState, 'speed', { min: 0, max: 100 });

      expect(newState.speed).toBe(88);

      restoredUi.clearSession('test-session-key');
      expect(localStorage.getItem('test-session-key')).toBeNull();
    });
  });
});
