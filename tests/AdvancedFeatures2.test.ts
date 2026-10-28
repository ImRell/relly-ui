import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RellyUI } from '../src/RellyUI';
import { CYBERPUNK_THEME, NORD_THEME, DRACULA_THEME } from '../src/core/ThemeManager';

describe('RellyUI Pro Features (Resize, Import JSON, Themes, showIf, Row, Schema, Sound)', () => {
  let ui: RellyUI;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (ui) {
      ui.destroy();
    }
  });

  describe('Resizable Panel', () => {
    it('should create resize handle and support resizing', () => {
      ui = new RellyUI({ shadowDOM: false, resizable: true });
      const handle = ui.getElement().querySelector('.relly-resize-handle');
      expect(handle).toBeDefined();

      ui.getElement().style.width = '350px';
      ui.getElement().style.height = '400px';
      expect(ui.getElement().style.width).toBe('350px');
      expect(ui.getElement().style.height).toBe('400px');
    });
  });

  describe('Import JSON Config', () => {
    it('should import JSON object and update bound state', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { speed: 10, shadows: false };
      ui.addSlider(state, 'speed');
      ui.addCheckbox(state, 'shadows');

      ui.importJSON({ speed: 85, shadows: true });
      expect(state.speed).toBe(85);
      expect(state.shadows).toBe(true);
    });

    it('should import JSON string and update bound state', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { count: 5 };
      ui.addSlider(state, 'count');

      ui.importJSON('{"count": 99}');
      expect(state.count).toBe(99);
    });
  });

  describe('Theme Presets', () => {
    it('should apply cyberpunk, nord, and dracula themes', () => {
      ui = new RellyUI({ shadowDOM: false, theme: 'cyberpunk' });
      expect(ui.getElement().style.getPropertyValue('--relly-header-fg')).toBe(CYBERPUNK_THEME.headerFg);

      ui.setTheme('nord');
      expect(ui.getElement().style.getPropertyValue('--relly-header-fg')).toBe(NORD_THEME.headerFg);

      ui.setTheme('dracula');
      expect(ui.getElement().style.getPropertyValue('--relly-header-fg')).toBe(DRACULA_THEME.headerFg);
    });
  });

  describe('Conditional Visibility (showIf)', () => {
    it('should toggle component visibility when condition changes', () => {
      ui = new RellyUI({ shadowDOM: false });
      const flags = { isDev: false, debugValue: 42 };

      const devControl = ui.addSlider(flags, 'debugValue').showIf(() => flags.isDev);
      expect(devControl.element.style.display).toBe('none');

      flags.isDev = true;
      devControl.checkDirty();
      expect(devControl.element.style.display).toBe('');

      flags.isDev = false;
      devControl.checkDirty();
      expect(devControl.element.style.display).toBe('none');
    });

    it('should toggle section visibility using showIf', () => {
      ui = new RellyUI({ shadowDOM: false });
      const state = { showAdvanced: false };

      const section = ui.addSection('Advanced Settings').showIf(() => state.showAdvanced);
      expect(section.element.style.display).toBe('none');

      state.showAdvanced = true;
      section.checkDirty();
      expect(section.element.style.display).toBe('');
    });
  });

  describe('Multi-Column Row Layout', () => {
    it('should render items in a horizontal row', () => {
      ui = new RellyUI({ shadowDOM: false });
      const bounds = { min: 0, max: 100 };

      const row = ui.addRow();
      const minCtrl = row.addSlider(bounds, 'min');
      const maxCtrl = row.addSlider(bounds, 'max');

      expect(row.element.classList.contains('relly-multi-row')).toBe(true);
      expect(row.element.contains(minCtrl.element)).toBe(true);
      expect(row.element.contains(maxCtrl.element)).toBe(true);
    });
  });

  describe('Declarative Schema Loader', () => {
    it('should build interface from schema object', () => {
      ui = new RellyUI({ shadowDOM: false });
      const config = { volume: 50, muted: false, bass: 10 };

      ui.loadSchema({
        title: 'Audio Panel',
        target: config,
        controls: [
          { type: 'slider', property: 'volume', min: 0, max: 100 },
          { type: 'checkbox', property: 'muted' },
          {
            type: 'section',
            label: 'Equalizer',
            controls: [
              { type: 'slider', property: 'bass', min: -12, max: 12 }
            ]
          }
        ]
      });

      expect(ui.getElement().querySelector('.relly-header-title span')?.textContent).toBe('Audio Panel');
      expect(ui.export()).toEqual({
        volume: 50,
        muted: false,
        bass: 10
      });
    });
  });

  describe('Sound Engine', () => {
    it('should initialize and support muting', () => {
      ui = new RellyUI({ shadowDOM: false, sound: true });
      const sound = ui.getSoundEngine();
      expect(sound.isEnabled()).toBe(true);

      sound.playClick();
      sound.playToggle(true);
      sound.playNotify();

      sound.setEnabled(false);
      expect(sound.isEnabled()).toBe(false);
    });
  });
});
