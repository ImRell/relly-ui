import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RellyUI } from '../src/RellyUI';

describe('RellyUI Components and Fluent API', () => {
  let ui: RellyUI;
  let testObj: {
    enabled: boolean;
    speed: number;
    mode: string;
    color: string;
    fps: number;
    status: string;
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    testObj = {
      enabled: false,
      speed: 25,
      mode: 'solid',
      color: '#ff0000',
      fps: 60,
      status: 'idle'
    };
    ui = new RellyUI();
  });

  afterEach(() => {
    ui.destroy();
  });

  describe('Checkbox', () => {
    it('should bind to boolean property and toggle on click', () => {
      const fn = vi.fn();
      const checkbox = ui
        .addCheckbox(testObj, 'enabled')
        .setLabel('Enable Effects')
        .onChange(fn);

      expect(checkbox.getLabel()).toBe('Enable Effects');
      expect(testObj.enabled).toBe(false);

      const wrapper = checkbox.element.querySelector('.relly-checkbox-wrapper') as HTMLElement;
      wrapper.click();

      expect(testObj.enabled).toBe(true);
      expect(fn).toHaveBeenCalledWith(true, false);
      expect(wrapper.classList.contains('relly-checked')).toBe(true);
    });
  });

  describe('Slider', () => {
    it('should bind to number property and support constraints', () => {
      const fn = vi.fn();
      const slider = ui
        .addSlider(testObj, 'speed')
        .setLabel('Animation Speed')
        .setMin(0)
        .setMax(100)
        .setStep(5)
        .onChange(fn);

      expect(slider.getLabel()).toBe('Animation Speed');
      expect(slider.getValue()).toBe(25);

      slider.setValue(75);
      expect(testObj.speed).toBe(75);
      expect(fn).toHaveBeenCalledWith(75, 25);
    });
  });

  describe('Button', () => {
    it('should execute onClick callback when clicked', () => {
      const fn = vi.fn();
      const btn = ui.addButton('Reset Parameters').onClick(fn);

      const btnEl = btn.element.querySelector('button') as HTMLButtonElement;
      expect(btnEl.textContent).toBe('Reset Parameters');

      btnEl.click();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Select', () => {
    it('should bind to property and handle options array and map', () => {
      const fn = vi.fn();
      const select = ui
        .addSelect(testObj, 'mode', ['wireframe', 'solid', 'textured'])
        .setLabel('Shading')
        .onChange(fn);

      expect(select.getValue()).toBe('solid');

      select.setValue('textured');
      expect(testObj.mode).toBe('textured');
      expect(fn).toHaveBeenCalledWith('textured', 'solid');
    });
  });

  describe('DynamicLabel', () => {
    it('should render formatted value of property', () => {
      const label = ui
        .addDynamicLabel(testObj, 'status')
        .setLabel('Status')
        .setFormat((v) => `[${v.toUpperCase()}]`);

      const badge = label.element.querySelector('.relly-dynamic-value');
      expect(badge?.textContent).toBe('[IDLE]');

      testObj.status = 'running';
      label.update();
      expect(badge?.textContent).toBe('[RUNNING]');
    });
  });

  describe('Graph', () => {
    it('should push values and draw into canvas', () => {
      const graph = ui
        .addGraph(testObj, 'fps')
        .setLabel('Frame Rate')
        .setRange(0, 120)
        .setBufferSize(30);

      expect(graph.getLabel()).toBe('Frame Rate');
      graph.push(60);
      graph.push(75);
      const valDisplay = graph.element.querySelector('.relly-graph-val');
      expect(valDisplay?.textContent).toBe('75.0');
    });
  });

  describe('ColorPicker', () => {
    it('should bind to color string and update preview', () => {
      const fn = vi.fn();
      const colorPicker = ui
        .addColor(testObj, 'color')
        .setLabel('Primary Color')
        .onChange(fn);

      expect(colorPicker.getValue()).toBe('#ff0000');

      colorPicker.setValue('#00ff00');
      expect(testObj.color).toBe('#00ff00');
      expect(fn).toHaveBeenCalledWith('#00ff00', '#ff0000');
    });
  });

  describe('Section', () => {
    it('should hold children and support collapsing', () => {
      const section = ui.addSection('Graphics Settings');
      expect(section.getLabel()).toBe('Graphics Settings');

      const checkbox = section.addCheckbox(testObj, 'enabled');
      expect(section.element.contains(checkbox.element)).toBe(true);

      section.setCollapsed(true);
      expect(section.element.classList.contains('relly-section--collapsed')).toBe(true);

      section.toggle();
      expect(section.element.classList.contains('relly-section--collapsed')).toBe(false);
    });
  });

  describe('createComponent factory', () => {
    it('should create components via universal options object', () => {
      const fn = vi.fn();
      const comp = ui.createComponent({
        type: 'slider',
        label: 'Volume',
        object: testObj,
        property: 'speed',
        min: 0,
        max: 100,
        step: 1,
        onChange: fn
      });

      expect(comp.getLabel()).toBe('Volume');
      comp.setValue(50);
      expect(testObj.speed).toBe(50);
      expect(fn).toHaveBeenCalledWith(50, 25);
    });
  });
});
