import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RellyUI } from '../src/RellyUI';
import { SoundEngine } from '../src/core/SoundEngine';

describe('Audio and Close Header Enhancements', () => {
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

  it('renders X close button in header and clicking it hides the panel', () => {
    ui = new RellyUI({ title: 'Test Window' });
    const panelEl = ui.getElement();
    const closeBtn = panelEl.querySelector('.relly-close-btn') as HTMLButtonElement;

    expect(closeBtn).toBeDefined();
    expect(closeBtn.getAttribute('aria-label')).toBe('Close panel');
    expect(panelEl.classList.contains('relly-hidden')).toBe(false);

    const soundEngine = ui.getSoundEngine();
    const clickSpy = vi.spyOn(soundEngine, 'playClick');

    closeBtn.click();

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(panelEl.classList.contains('relly-hidden')).toBe(true);
  });

  it('allows reopening the panel with hotkey after closing with X button', () => {
    ui = new RellyUI({ hotkey: 'KeyH' });
    const panelEl = ui.getElement();
    const closeBtn = panelEl.querySelector('.relly-close-btn') as HTMLButtonElement;

    closeBtn.click();
    expect(panelEl.classList.contains('relly-hidden')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH', bubbles: true }));
    expect(panelEl.classList.contains('relly-hidden')).toBe(false);
  });

  it('triggers playPanelOpen when opening a previously hidden panel', () => {
    ui = new RellyUI();
    const soundEngine = ui.getSoundEngine();
    const openSpy = vi.spyOn(soundEngine, 'playPanelOpen');

    ui.hide();
    expect(openSpy).not.toHaveBeenCalled();

    ui.show();
    expect(openSpy).toHaveBeenCalledTimes(1);

    // Calling show again while already open should not trigger sound again
    ui.show();
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers playSelect when selecting an option in Select component', () => {
    const state = { theme: 'dark' };
    ui = new RellyUI();
    const soundEngine = ui.getSoundEngine();
    const selectSpy = vi.spyOn(soundEngine, 'playSelect');

    const select = ui.addSelect(state, 'theme', ['dark', 'light', 'cyberpunk']);
    const selectEl = select.element.querySelector('select') as HTMLSelectElement;

    selectEl.value = 'cyberpunk';
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));

    expect(state.theme).toBe('cyberpunk');
    expect(selectSpy).toHaveBeenCalledTimes(1);
  });

  it('throttles ticks on RangeSlider during rapid dragging to prevent sound spam', () => {
    const state = { bounds: [10, 80] };
    ui = new RellyUI();
    const soundEngine = ui.getSoundEngine();
    const tickSpy = vi.spyOn(soundEngine, 'playTick');

    const range = ui.addRange(state, 'bounds', { min: 0, max: 100, step: 1 });
    const thumbMin = range.element.querySelector('.relly-range-thumb--min') as HTMLElement;
    const track = range.element.querySelector('.relly-range-track') as HTMLElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 20,
      right: 200,
      bottom: 20,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    thumbMin.dispatchEvent(new MouseEvent('mousedown', { clientX: 20, button: 0, bubbles: true }));

    // Rapid mouse moves (e.g. 10 rapid events within 10ms)
    for (let i = 21; i <= 30; i++) {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: i * 2, bubbles: true }));
    }
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    // Should only have ticked once or very few times due to 60ms throttle, instead of 10 times
    expect(tickSpy.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('throttles ticks on Slider during input and scrubbing', () => {
    const state = { volume: 50 };
    ui = new RellyUI();
    const soundEngine = ui.getSoundEngine();
    const tickSpy = vi.spyOn(soundEngine, 'playTick');

    const slider = ui.addSlider(state, 'volume').setMin(0).setMax(100).setStep(1);
    const rangeInput = slider.element.querySelector('.relly-slider-range') as HTMLInputElement;

    // Simulate rapid input events
    for (let i = 51; i <= 60; i++) {
      rangeInput.value = i.toString();
      rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Should be throttled
    expect(tickSpy.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('supports SoundEngine sound packs without errors', () => {
    const se = new SoundEngine(true, 'synth');
    expect(() => {
      se.playTick();
      se.playSelect();
      se.playPanelOpen();
    }).not.toThrow();

    se.setSoundPack('mechanical');
    expect(() => {
      se.playTick();
      se.playSelect();
      se.playPanelOpen();
    }).not.toThrow();

    se.setSoundPack('bubble');
    expect(() => {
      se.playTick();
      se.playSelect();
      se.playPanelOpen();
    }).not.toThrow();

    se.setSoundPack('arcade');
    expect(() => {
      se.playTick();
      se.playSelect();
      se.playPanelOpen();
    }).not.toThrow();
  });

  it('removes outlines across UI elements via stylesheet rules', () => {
    const panelCss = fs.readFileSync(path.resolve(__dirname, '../src/styles/panel.css'), 'utf-8');
    const compCss = fs.readFileSync(path.resolve(__dirname, '../src/styles/components.css'), 'utf-8');

    expect(panelCss).toContain('outline: none !important');
    expect(panelCss).toContain('.relly-header-btn');
    expect(compCss).toContain('outline: none !important');
    expect(compCss).toContain('.relly-btn');
  });
});
