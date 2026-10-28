import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RellyUI } from '../src/RellyUI';

describe('RellyUI Advanced Features (Shadow DOM, SearchBar, Point2D, Tabs, Tooltip, CopyJSON)', () => {
  let ui: RellyUI;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (ui) {
      ui.destroy();
    }
  });

  describe('Shadow DOM Encapsulation', () => {
    it('should mount into a ShadowRoot when shadowDOM is true', () => {
      ui = new RellyUI({ shadowDOM: true });
      const shadowRoot = ui.getShadowRoot();
      expect(shadowRoot).toBeDefined();
      expect(shadowRoot).not.toBeNull();

      const host = ui.getHost();
      expect(host).toBeDefined();
      expect(document.body.contains(host!)).toBe(true);

      // Panel is inside ShadowRoot, not direct child of body
      expect(shadowRoot!.contains(ui.getElement())).toBe(true);
      expect(document.body.contains(ui.getElement())).toBe(false);

      // Stylesheet is inside ShadowRoot
      const styleEl = shadowRoot!.querySelector('#relly-ui-stylesheet');
      expect(styleEl).toBeDefined();
    });

    it('should mount directly into document.body when shadowDOM is false', () => {
      ui = new RellyUI({ shadowDOM: false });
      expect(ui.getShadowRoot()).toBeNull();
      expect(document.body.contains(ui.getElement())).toBe(true);
    });
  });

  describe('Point2D Component', () => {
    it('should bind to { x, y } object and handle updates', () => {
      const pos = { x: 10, y: 25 };
      const fn = vi.fn();

      ui = new RellyUI({ shadowDOM: false });
      const point = ui
        .addPoint2D(pos, 'pos')
        .setLabel('Position')
        .setMin(0)
        .setMax(100)
        .setStep(1)
        .onChange(fn);

      expect(point.getLabel()).toBe('Position');

      point.setValue({ x: 50, y: 75 });
      expect(pos.x).toBe(50);
      expect(pos.y).toBe(75);
      expect(fn).toHaveBeenCalledWith({ x: 50, y: 75 }, { x: 10, y: 25 });
    });
  });

  describe('Tabs System', () => {
    it('should create tabs and switch active content', () => {
      ui = new RellyUI({ shadowDOM: false });

      const tab1 = ui.addTab('Graphics');
      const tab2 = ui.addTab('Physics');

      expect(tab1.getLabel()).toBe('Graphics');
      expect(tab2.getLabel()).toBe('Physics');

      // First tab active by default
      expect(tab1.buttonEl.classList.contains('relly-tab-active')).toBe(true);
      expect(tab1.contentEl.classList.contains('relly-tab-content--active')).toBe(true);

      // Switch to tab 2
      tab2.buttonEl.click();
      expect(tab1.buttonEl.classList.contains('relly-tab-active')).toBe(false);
      expect(tab2.buttonEl.classList.contains('relly-tab-active')).toBe(true);
      expect(tab2.contentEl.classList.contains('relly-tab-content--active')).toBe(true);
    });

    it('should support adding sections, rows, and components inside a tab', () => {
      ui = new RellyUI({ shadowDOM: false });
      const devTab = ui.addTab('Dev & JSON');
      const state = { isDevMode: true, count: 5 };

      // Verify devTab has addSection and addRow
      const section = devTab.addSection('Secret DEV Metrics');
      expect(section).toBeDefined();
      expect(section.getLabel()).toBe('Secret DEV Metrics');
      expect(devTab.contentEl.contains(section.element)).toBe(true);

      // Verify nested components inside section
      const btn = section.addButton('Benchmark');
      expect(section.contentEl.contains(btn.element)).toBe(true);

      // Verify devTab.addRow and createCheckbox/createFolder aliases
      const row = devTab.addRow();
      expect(devTab.contentEl.contains(row.element)).toBe(true);

      const folder = devTab.addFolder('Nested Folder');
      expect(folder).toBeDefined();
      expect(folder.getLabel()).toBe('Nested Folder');

      // Verify options object style
      const cb = devTab.createCheckbox({
        label: 'Custom CB',
        object: state,
        property: 'isDevMode',
        tooltip: 'My tooltip'
      });
      expect(cb.getLabel()).toBe('Custom CB');
      expect(cb.getTooltip()).toBe('My tooltip');
    });
  });

  describe('SearchBar Filtering', () => {
    it('should filter components when typing in search input', () => {
      ui = new RellyUI({ shadowDOM: false, searchBar: true });

      const state = { speed: 10, bloom: true, gravity: -9.8 };
      const slider = ui.addSlider(state, 'speed').setLabel('Speed Factor');
      const checkbox = ui.addCheckbox(state, 'bloom').setLabel('Bloom Glow');

      const searchInput = ui.getElement().querySelector('.relly-search-input') as HTMLInputElement;
      expect(searchInput).toBeDefined();

      // Search for "bloom"
      searchInput.value = 'bloom';
      searchInput.dispatchEvent(new Event('input'));

      expect(slider.element.classList.contains('relly-search-hidden')).toBe(true);
      expect(checkbox.element.classList.contains('relly-search-hidden')).toBe(false);

      // Clear search
      const clearBtn = ui.getElement().querySelector('.relly-search-clear') as HTMLButtonElement;
      clearBtn.click();

      expect(slider.element.classList.contains('relly-search-hidden')).toBe(false);
      expect(checkbox.element.classList.contains('relly-search-hidden')).toBe(false);
    });
  });

  describe('Tooltips', () => {
    it('should create tooltip element on component', () => {
      ui = new RellyUI({ shadowDOM: false });
      const obj = { enabled: true };
      const comp = ui.addCheckbox(obj, 'enabled').setTooltip('Toggles post-processing effects');

      expect(comp.getTooltip()).toBe('Toggles post-processing effects');
      const tooltipEl = comp.element.querySelector('.relly-tooltip');
      expect(tooltipEl?.textContent).toBe('Toggles post-processing effects');
    });
  });

  describe('Copy as JSON', () => {
    it('should serialize state to JSON string', () => {
      ui = new RellyUI({ shadowDOM: false });
      const obj = { count: 42, active: true };
      ui.addSlider(obj, 'count');
      ui.addCheckbox(obj, 'active');

      const jsonStr = ui.copyJSON();
      expect(JSON.parse(jsonStr)).toEqual({ count: 42, active: true });
    });
  });
});
