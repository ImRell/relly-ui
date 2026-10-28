import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RellyUI } from '../src/RellyUI';

describe('BindingEngine and Reactivity', () => {
  let ui: RellyUI;
  let testObj: { score: number; flag: boolean };

  beforeEach(() => {
    document.body.innerHTML = '';
    testObj = { score: 10, flag: false };
    ui = new RellyUI();
  });

  afterEach(() => {
    ui.destroy();
  });

  it('should detect dirty changes when listen() is activated', () => {
    const fn = vi.fn();
    const slider = ui.addSlider(testObj, 'score').listen().onChange(fn);

    expect(slider.getValue()).toBe(10);

    // External change
    testObj.score = 42;
    slider.checkDirty();

    expect(slider.getValue()).toBe(42);
    expect(fn).toHaveBeenCalledWith(42, 10);
  });

  it('should not fire onChange if value has not changed', () => {
    const fn = vi.fn();
    const checkbox = ui.addCheckbox(testObj, 'flag').listen().onChange(fn);

    checkbox.checkDirty();
    expect(fn).not.toHaveBeenCalled();
  });
});
