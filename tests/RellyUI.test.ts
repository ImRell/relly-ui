import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RellyUI } from '../src/RellyUI';

describe('RellyUI Core Facade', () => {
  let ui: RellyUI;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (ui) {
      ui.destroy();
    }
  });

  it('should initialize and mount to document.body with default title', () => {
    ui = new RellyUI({ title: 'Test Panel' });
    const panelEl = ui.getElement();
    expect(panelEl).toBeDefined();
    expect(document.body.contains(ui.getHost() || panelEl)).toBe(true);

    const titleEl = panelEl.querySelector('.relly-header-title span');
    expect(titleEl?.textContent).toBe('Test Panel');
  });

  it('should support collapse and expand', () => {
    ui = new RellyUI({ title: 'Test Panel' });
    const panelEl = ui.getElement();

    expect(panelEl.classList.contains('relly-collapsed')).toBe(false);

    ui.setCollapsed(true);
    expect(panelEl.classList.contains('relly-collapsed')).toBe(true);

    ui.toggleCollapse();
    expect(panelEl.classList.contains('relly-collapsed')).toBe(false);
  });

  it('should support hide, show and toggle visibility', () => {
    ui = new RellyUI();
    const panelEl = ui.getElement();

    expect(panelEl.classList.contains('relly-hidden')).toBe(false);

    ui.hide();
    expect(panelEl.classList.contains('relly-hidden')).toBe(true);

    ui.show();
    expect(panelEl.classList.contains('relly-hidden')).toBe(false);

    ui.toggle();
    expect(panelEl.classList.contains('relly-hidden')).toBe(true);
  });

  it('should update title dynamically', () => {
    ui = new RellyUI({ title: 'Initial' });
    ui.setTitle('Updated Title');
    const titleEl = ui.getElement().querySelector('.relly-header-title span');
    expect(titleEl?.textContent).toBe('Updated Title');
  });

  it('should mount into a custom container element', () => {
    const customContainer = document.createElement('div');
    customContainer.id = 'custom-wrapper';
    document.body.appendChild(customContainer);

    ui = new RellyUI({ container: customContainer });
    expect(customContainer.contains(ui.getHost() || ui.getElement())).toBe(true);
  });

  it('should allow dynamically configuring hotkey even when initialized with null', () => {
    ui = new RellyUI({ hotkey: null });
    const panelEl = ui.getElement();
    expect(panelEl.classList.contains('relly-hidden')).toBe(false);

    ui.setHotkey('KeyK');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', bubbles: true }));
    expect(panelEl.classList.contains('relly-hidden')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', bubbles: true }));
    expect(panelEl.classList.contains('relly-hidden')).toBe(false);
  });

  it('should maintain integer precision on integer-stepped slider during scrubbing', () => {
    const state = { count: 10 };
    ui = new RellyUI();
    const slider = ui.addSlider(state, 'count').setMin(0).setMax(100).setStep(1);

    const input = slider.element.querySelector('.relly-slider-number') as HTMLInputElement;
    input.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 107, bubbles: true }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(Number.isInteger(state.count)).toBe(true);
    expect(state.count).toBe(17);
  });

  it('should respect graph sampleInterval and avoid over-sampling', () => {
    const state = { metric: 10 };
    ui = new RellyUI();
    const graph = ui.addGraph(state, 'metric').setSampleInterval(200);

    expect(graph.getSampleInterval()).toBe(200);
    expect(graph.getLatestValue()).toBe(10);
  });
});
