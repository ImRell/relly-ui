import { RellyTheme, ThemeInput } from '../types';

export const DARK_THEME: RellyTheme = {
  bg: '#1c1d22',
  fg: '#d1d5db',
  headerBg: '#141518',
  headerFg: '#f3f4f6',
  accent: '#6366f1',
  accentHover: '#4f46e5',
  border: 'rgba(255, 255, 255, 0.08)',
  inputBg: '#26272e',
  inputHover: '#2f3039',
  radius: '6px',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: '11px',
  rowHeight: '26px'
};

export const LIGHT_THEME: RellyTheme = {
  bg: '#ffffff',
  fg: '#374151',
  headerBg: '#f3f4f6',
  headerFg: '#111827',
  accent: '#4f46e5',
  accentHover: '#4338ca',
  border: '#e5e7eb',
  inputBg: '#f9fafb',
  inputHover: '#f3f4f6',
  radius: '6px',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: '11px',
  rowHeight: '26px'
};

export const CYBERPUNK_THEME: RellyTheme = {
  bg: '#0f051d',
  fg: '#e0f2fe',
  headerBg: '#180a33',
  headerFg: '#00f0ff',
  accent: '#00f0ff',
  accentHover: '#ff007f',
  border: 'rgba(0, 240, 255, 0.25)',
  inputBg: '#1e0d3d',
  inputHover: '#2d145c',
  radius: '4px',
  font: '"JetBrains Mono", Consolas, monospace',
  fontSize: '11px',
  rowHeight: '26px'
};

export const NORD_THEME: RellyTheme = {
  bg: '#2e3440',
  fg: '#d8dee9',
  headerBg: '#242933',
  headerFg: '#eceff4',
  accent: '#88c0d0',
  accentHover: '#81a1c1',
  border: '#3b4252',
  inputBg: '#3b4252',
  inputHover: '#434c5e',
  radius: '6px',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '11px',
  rowHeight: '26px'
};

export const DRACULA_THEME: RellyTheme = {
  bg: '#282a36',
  fg: '#f8f8f2',
  headerBg: '#1e1f29',
  headerFg: '#bd93f9',
  accent: '#bd93f9',
  accentHover: '#ff79c6',
  border: '#44475a',
  inputBg: '#44475a',
  inputHover: '#6272a4',
  radius: '6px',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '11px',
  rowHeight: '26px'
};

export const TOKYO_NIGHT_THEME: RellyTheme = {
  bg: '#1a1b26',
  fg: '#a9b1d6',
  headerBg: '#16161e',
  headerFg: '#7aa2f7',
  accent: '#7aa2f7',
  accentHover: '#bb9af7',
  border: 'rgba(122, 162, 247, 0.18)',
  inputBg: '#24283b',
  inputHover: '#2f3549',
  radius: '6px',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '11px',
  rowHeight: '26px'
};

export const MATRIX_THEME: RellyTheme = {
  bg: '#0a0f0d',
  fg: '#00ff66',
  headerBg: '#050a08',
  headerFg: '#00ff66',
  accent: '#00ff66',
  accentHover: '#33ff88',
  border: 'rgba(0, 255, 102, 0.25)',
  inputBg: '#0d1812',
  inputHover: '#13241b',
  radius: '3px',
  font: '"JetBrains Mono", Consolas, monospace',
  fontSize: '11px',
  rowHeight: '26px'
};

export const SYNTHWAVE_THEME: RellyTheme = {
  bg: '#241b2f',
  fg: '#f8f8f2',
  headerBg: '#191322',
  headerFg: '#ff71ce',
  accent: '#ff71ce',
  accentHover: '#01cdfe',
  border: 'rgba(255, 113, 206, 0.25)',
  inputBg: '#2f233f',
  inputHover: '#3c2c51',
  radius: '6px',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '11px',
  rowHeight: '26px'
};

export class ThemeManager {
  private currentTheme: RellyTheme;
  private currentThemeName?: string;

  constructor(
    private panelElement: HTMLElement,
    themeInput?: ThemeInput
  ) {
    this.currentTheme = { ...DARK_THEME };
    this.currentThemeName = 'dark';
    if (themeInput) {
      this.applyTheme(themeInput);
    } else {
      this.applyToDOM(this.currentTheme);
    }
  }

  public applyTheme(themeInput: ThemeInput): void {
    if (typeof themeInput === 'string') {
      this.currentThemeName = themeInput;
    }

    if (themeInput === 'light') {
      this.currentTheme = { ...LIGHT_THEME };
    } else if (themeInput === 'dark') {
      this.currentTheme = { ...DARK_THEME };
    } else if (themeInput === 'cyberpunk') {
      this.currentTheme = { ...CYBERPUNK_THEME };
    } else if (themeInput === 'nord') {
      this.currentTheme = { ...NORD_THEME };
    } else if (themeInput === 'dracula') {
      this.currentTheme = { ...DRACULA_THEME };
    } else if (themeInput === 'tokyo-night') {
      this.currentTheme = { ...TOKYO_NIGHT_THEME };
    } else if (themeInput === 'matrix') {
      this.currentTheme = { ...MATRIX_THEME };
    } else if (themeInput === 'synthwave') {
      this.currentTheme = { ...SYNTHWAVE_THEME };
    } else if (typeof themeInput === 'object') {
      this.currentTheme = { ...this.currentTheme, ...themeInput };
      this.currentThemeName = 'custom';
    }
    this.applyToDOM(this.currentTheme);
  }

  public getCurrentThemeName(): string | undefined {
    return this.currentThemeName;
  }

  private applyToDOM(theme: RellyTheme): void {
    const el = this.panelElement;
    el.style.setProperty('--relly-bg', theme.bg);
    el.style.setProperty('--relly-fg', theme.fg);
    el.style.setProperty('--relly-header-bg', theme.headerBg);
    el.style.setProperty('--relly-header-fg', theme.headerFg);
    el.style.setProperty('--relly-accent', theme.accent);
    el.style.setProperty('--relly-accent-hover', theme.accentHover);
    el.style.setProperty('--relly-border', theme.border);
    el.style.setProperty('--relly-input-bg', theme.inputBg);
    el.style.setProperty('--relly-input-hover', theme.inputHover);
    el.style.setProperty('--relly-radius', theme.radius);
    el.style.setProperty('--relly-font', theme.font);
    el.style.setProperty('--relly-font-size', theme.fontSize);
    el.style.setProperty('--relly-row-height', theme.rowHeight);
  }

  public getTheme(): RellyTheme {
    return { ...this.currentTheme };
  }
}
