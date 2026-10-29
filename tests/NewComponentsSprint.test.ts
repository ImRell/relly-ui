import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RellyUI } from '../src/RellyUI';
import { Switch } from '../src/components/Switch/Switch';
import { ButtonGroup } from '../src/components/ButtonGroup/ButtonGroup';
import { TextInput } from '../src/components/TextInput/TextInput';
import { Progress } from '../src/components/Progress/Progress';
import { Separator } from '../src/components/Separator/Separator';
import { ColorPicker } from '../src/components/ColorPicker/ColorPicker';

describe('New Components Sprint (v1.1.0)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('1. Switch Component', () => {
    it('should toggle boolean property and update visual checked class', () => {
      const state = { bloom: false };
      const sw = new Switch('Bloom Effect', state, 'bloom', { onLabel: 'YES', offLabel: 'NO' });
      container.appendChild(sw.element);

      const track = sw.element.querySelector('.relly-switch-track')!;
      const nativeInput = sw.element.querySelector<HTMLInputElement>('.relly-switch-native')!;
      const text = sw.element.querySelector('.relly-switch-text')!;

      expect(track.classList.contains('relly-switch-track--checked')).toBe(false);
      expect(text.textContent).toBe('NO');

      // Toggle switch
      nativeInput.checked = true;
      nativeInput.dispatchEvent(new Event('change'));

      expect(state.bloom).toBe(true);
      expect(track.classList.contains('relly-switch-track--checked')).toBe(true);
      expect(text.textContent).toBe('YES');
    });

    it('should support fluent onToggle callback and disable', () => {
      const state = { active: true };
      const onToggle = vi.fn();
      const sw = new Switch('Active', state, 'active').onToggle(onToggle);

      sw.setDisabled(true);
      const nativeInput = sw.element.querySelector<HTMLInputElement>('.relly-switch-native')!;
      expect(nativeInput.disabled).toBe(true);

      sw.setValue(false);
      expect(onToggle).toHaveBeenCalledWith(false, true);
    });
  });

  describe('2. ButtonGroup Component', () => {
    it('should render inline buttons and trigger callbacks on click', () => {
      const onPlay = vi.fn();
      const onPause = vi.fn();
      const onReset = vi.fn();

      const group = new ButtonGroup([
        { label: 'Play', primary: true, onClick: () => onPlay() },
        { label: 'Pause', onClick: () => onPause() },
        { label: 'Reset', danger: true, onClick: () => onReset() }
      ]);
      container.appendChild(group.element);

      const btns = group.element.querySelectorAll<HTMLButtonElement>('.relly-btn--group');
      expect(btns.length).toBe(3);
      expect(btns[0].textContent).toBe('Play');
      expect(btns[0].classList.contains('relly-btn--primary')).toBe(true);
      expect(btns[2].classList.contains('relly-btn--danger')).toBe(true);

      btns[0].click();
      expect(onPlay).toHaveBeenCalled();

      btns[2].click();
      expect(onReset).toHaveBeenCalled();
    });

    it('should disable all buttons when setDisabled(true)', () => {
      const group = new ButtonGroup([{ label: 'Test', onClick: () => {} }]);
      group.setDisabled(true);
      const btn = group.element.querySelector<HTMLButtonElement>('.relly-btn--group')!;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('3. TextInput Component', () => {
    it('should bind text property, update on input and change', () => {
      const state = { title: 'Neon World' };
      const onChange = vi.fn();
      const text = new TextInput('Title', state, 'title', { clearable: true }).onChange(onChange);
      container.appendChild(text.element);

      const input = text.element.querySelector<HTMLInputElement>('.relly-text-input')!;
      const clearBtn = text.element.querySelector<HTMLButtonElement>('.relly-text-clear')!;

      expect(input.value).toBe('Neon World');
      expect(clearBtn.style.display).not.toBe('none');

      // Edit value
      input.value = 'Cyber Simulation';
      input.dispatchEvent(new Event('input'));
      expect(state.title).toBe('Cyber Simulation');

      // Clear value
      clearBtn.click();
      expect(state.title).toBe('');
      expect(input.value).toBe('');
      expect(clearBtn.style.display).toBe('none');
    });

    it('should respect maxLength and readOnly constraints', () => {
      const state = { code: 'ABC' };
      const text = new TextInput('Code', state, 'code', { maxLength: 5, readOnly: true });
      const input = text.element.querySelector<HTMLInputElement>('.relly-text-input')!;

      expect(input.maxLength).toBe(5);
      expect(input.readOnly).toBe(true);
    });
  });

  describe('4. Progress Component', () => {
    it('should compute percentage and update bar width and formatted text', () => {
      const state = { load: 45 };
      const prog = new Progress('Asset Loading', state, 'load', { min: 0, max: 100 });
      container.appendChild(prog.element);

      const bar = prog.element.querySelector<HTMLElement>('.relly-progress-bar')!;
      const label = prog.element.querySelector<HTMLElement>('.relly-progress-text')!;

      expect(bar.style.width).toBe('45%');
      expect(label.textContent).toBe('45%');

      // Update state
      state.load = 80;
      prog.update();

      expect(bar.style.width).toBe('80%');
      expect(label.textContent).toBe('80%');
    });

    it('should support custom format function and clamp out-of-range bounds', () => {
      const state = { memoryUsed: 120 };
      const prog = new Progress('RAM', state, 'memoryUsed', {
        min: 0,
        max: 100,
        format: (val) => `${val} MB`
      });

      const bar = prog.element.querySelector<HTMLElement>('.relly-progress-bar')!;
      const label = prog.element.querySelector<HTMLElement>('.relly-progress-text')!;

      expect(bar.style.width).toBe('100%');
      expect(label.textContent).toBe('120 MB');
    });
  });

  describe('5. Separator Component', () => {
    it('should render divider line and optional title', () => {
      const sepTitled = new Separator('Audio Settings');
      container.appendChild(sepTitled.element);

      expect(sepTitled.element.querySelector('.relly-separator--has-title')).toBeTruthy();
      expect(sepTitled.element.textContent).toContain('Audio Settings');

      const sepPlain = new Separator(undefined, true);
      container.appendChild(sepPlain.element);
      expect(sepPlain.element.querySelector('.relly-separator--dashed')).toBeTruthy();
    });
  });

  describe('6. ColorPicker Editable HEX Input', () => {
    it('should allow typing new hex value directly into text input and sync state', () => {
      const state = { color: '#38bdf8' };
      const picker = new ColorPicker('Accent', state, 'color');
      container.appendChild(picker.element);

      const input = picker.element.querySelector<HTMLInputElement>('.relly-color-text')!;
      expect(input.value).toBe('#38BDF8');

      // Type new color
      input.value = '#FF0055';
      input.dispatchEvent(new Event('input'));

      expect(state.color).toBe('#FF0055');
      const preview = picker.element.querySelector<HTMLElement>('.relly-color-preview')!;
      expect(preview.style.backgroundColor.toLowerCase()).toMatch(/#ff0055|rgb\(255,\s*0,\s*85\)/);
    });
  });

  describe('7. Integration via RellyUI Container', () => {
    it('should instantiate all new components via fluent RellyUI container methods', () => {
      const state = {
        glow: true,
        progressVal: 60,
        playerName: 'Hero',
        color: '#10b981'
      };

      const ui = new RellyUI({ container, shadowDOM: false });
      const sw = ui.addSwitch(state, 'glow');
      const grp = ui.addButtonGroup([{ label: 'Action', onClick: () => {} }]);
      const txt = ui.addText(state, 'playerName');
      const prg = ui.addProgress(state, 'progressVal');
      const sep = ui.addSeparator('Physics');

      expect(sw).toBeInstanceOf(Switch);
      expect(grp).toBeInstanceOf(ButtonGroup);
      expect(txt).toBeInstanceOf(TextInput);
      expect(prg).toBeInstanceOf(Progress);
      expect(sep).toBeInstanceOf(Separator);

      ui.destroy();
    });
  });
});
