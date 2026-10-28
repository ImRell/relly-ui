import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RellyUI } from '../src/RellyUI';

describe('PresetManager and State Serialization', () => {
  let ui: RellyUI;
  let config: { speed: number; shadows: boolean; mode: string };

  beforeEach(() => {
    document.body.innerHTML = '';
    config = { speed: 50, shadows: true, mode: 'high' };
    ui = new RellyUI();
  });

  afterEach(() => {
    ui.destroy();
  });

  it('should export all bound component values to a dictionary', () => {
    ui.addSlider(config, 'speed');
    ui.addCheckbox(config, 'shadows');
    ui.addSelect(config, 'mode', ['low', 'medium', 'high']);

    const exported = ui.export();
    expect(exported).toEqual({
      speed: 50,
      shadows: true,
      mode: 'high'
    });
  });

  it('should import new values and update properties', () => {
    ui.addSlider(config, 'speed');
    ui.addCheckbox(config, 'shadows');
    ui.addSelect(config, 'mode', ['low', 'medium', 'high']);

    ui.import({
      speed: 80,
      shadows: false,
      mode: 'low'
    });

    expect(config.speed).toBe(80);
    expect(config.shadows).toBe(false);
    expect(config.mode).toBe('low');
  });

  it('should save to and load from localStorage', () => {
    ui.addSlider(config, 'speed');
    ui.addCheckbox(config, 'shadows');

    ui.save('test-storage-key');
    const stored = window.localStorage.getItem('test-storage-key');
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toEqual({
      speed: 50,
      shadows: true
    });

    config.speed = 10;
    config.shadows = false;

    ui.load('test-storage-key');
    expect(config.speed).toBe(50);
    expect(config.shadows).toBe(true);
  });
});
