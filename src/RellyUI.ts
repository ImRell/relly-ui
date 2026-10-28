import { ContainerHelper } from './core/ComponentContainer';
import { BindingEngine } from './core/BindingEngine';
import { PresetManager } from './core/PresetManager';
import { ThemeManager } from './core/ThemeManager';
import { Draggable } from './core/Draggable';
import { Resizable } from './core/Resizable';
import { HotkeyManager } from './core/HotkeyManager';
import { SearchBar } from './core/SearchBar';
import { SoundEngine } from './core/SoundEngine';
import { ImportModal } from './core/ImportModal';
import { SchemaLoader } from './core/SchemaLoader';
import { ToastManager } from './core/ToastManager';
import { ContextMenuManager } from './core/ContextMenuManager';
import { Tab } from './components/Tabs/Tab';
import { TabsManager } from './components/Tabs/TabsManager';
import { RellyUIOptions, ThemeInput, SchemaDefinition, SoundPack, ToastType } from './types';
import { injectStyles } from './styles/injector';

export class RellyUI extends ContainerHelper {
  public static version: string = '1.0.0';

  private hostEl?: HTMLElement;
  private shadowRoot: ShadowRoot | null = null;
  private panelEl: HTMLElement;
  private headerEl: HTMLElement;
  private titleEl: HTMLElement;
  private collapseBtn: HTMLButtonElement;
  private copyToastEl: HTMLElement;

  private themeManager: ThemeManager;
  protected override soundEngine: SoundEngine;
  private draggableInstance?: Draggable;
  private resizableInstance?: Resizable;
  private hotkeyInstance?: HotkeyManager;
  private searchBarInstance?: SearchBar;
  private tabsManagerInstance?: TabsManager;
  private importModalInstance?: ImportModal;
  private toastManager: ToastManager;
  private contextMenuManager: ContextMenuManager;

  private isPanelCollapsed: boolean = false;
  private isPanelHidden: boolean = false;
  private isMiniHud: boolean = false;
  private ghostOnIdle: boolean = false;
  private idleOpacity: number = 0.38;
  private onResizeBound: () => void;

  private autoSave: boolean = false;
  private autoSaveKey: string = 'relly-ui-session';
  private autoSaveTimeout: any = null;

  private sparklineCtx?: CanvasRenderingContext2D | null;
  private sparklineData: number[] = [12, 14, 15, 18, 16, 20, 22, 21, 24, 25, 28, 30];
  private sparklineAnimId?: number;

  constructor(options: RellyUIOptions = {}) {
    const useShadow = options.shadowDOM !== false;
    const bindingEngine = new BindingEngine();
    const presetManager = new PresetManager();

    // Sound engine
    const soundEngine = new SoundEngine(options.sound !== false, options.soundPack || 'synth');

    // Create Panel Element
    const panel = document.createElement('div');
    panel.className = 'relly-panel';

    const width = options.width ?? 280;
    panel.style.width = typeof width === 'number' ? `${width}px` : width;

    if (options.height) {
      const height = options.height;
      panel.style.height = typeof height === 'number' ? `${height}px` : height;
    }

    // Header Element
    const header = document.createElement('div');
    header.className = 'relly-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'relly-header-title';
    titleWrap.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    `;

    const title = document.createElement('span');
    title.textContent = options.title || 'RellyUI';
    titleWrap.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'relly-header-actions';

    // Copy JSON button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'relly-header-btn';
    copyBtn.title = 'Copy settings as JSON';
    copyBtn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;
    actions.appendChild(copyBtn);

    // Import JSON button
    const importBtn = document.createElement('button');
    importBtn.className = 'relly-header-btn';
    importBtn.title = 'Import settings from JSON';
    importBtn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
    actions.appendChild(importBtn);

    // Mini-HUD button
    const miniHudBtn = document.createElement('button');
    miniHudBtn.className = 'relly-header-btn relly-minihud-btn';
    miniHudBtn.title = 'Toggle Mini-HUD pill (or double-click header)';
    miniHudBtn.textContent = '⤢';
    actions.appendChild(miniHudBtn);

    // Collapse button
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'relly-header-btn';
    collapseBtn.title = 'Collapse/Expand';
    collapseBtn.textContent = '_';
    actions.appendChild(collapseBtn);

    header.appendChild(titleWrap);
    header.appendChild(actions);
    panel.appendChild(header);

    // Copy Toast Notification
    const copyToast = document.createElement('div');
    copyToast.className = 'relly-copy-toast';
    copyToast.textContent = 'JSON Copied!';
    panel.appendChild(copyToast);

    // Body container for rows and sections
    const body = document.createElement('div');
    body.className = 'relly-body';
    if (options.height) {
      body.style.maxHeight = 'none';
      body.style.flex = '1';
    }
    panel.appendChild(body);

    super(body, bindingEngine, presetManager, soundEngine);

    this.panelEl = panel;
    this.headerEl = header;
    this.titleEl = title;
    this.collapseBtn = collapseBtn;
    this.copyToastEl = copyToast;
    this.soundEngine = soundEngine;
    this.onResizeBound = () => this.clampToViewport();

    // Search Bar
    if (options.searchBar) {
      this.searchBarInstance = new SearchBar(body, options.searchOptions);
      header.insertAdjacentElement('afterend', this.searchBarInstance.element);
    }

    // Initialize Theme
    this.themeManager = new ThemeManager(this.panelEl, options.theme);

    // Mount to DOM (Shadow DOM or direct)
    this.mount(options, useShadow);

    // Auto-inject styles
    if (options.autoInjectStyles !== false) {
      if (this.shadowRoot) {
        injectStyles(this.shadowRoot);
      } else {
        injectStyles();
      }
    }

    // Draggable
    if (options.draggable !== false) {
      this.draggableInstance = new Draggable(this.headerEl, this.panelEl, this.soundEngine);
    }

    // Resizable
    if (options.resizable !== false) {
      this.resizableInstance = new Resizable(this.panelEl);
    }

    // Toast & Context Menu Managers
    this.toastManager = new ToastManager(this.panelEl, this.soundEngine);
    this.contextMenuManager = new ContextMenuManager(this.panelEl, this.soundEngine);

    // Import Modal
    this.importModalInstance = new ImportModal(this.panelEl, (data) => {
      this.importJSON(data);
    });

    // Hotkey toggle
    const hotkey = options.hotkey === undefined ? 'KeyH' : options.hotkey;
    if (hotkey) {
      this.hotkeyInstance = new HotkeyManager(hotkey, () => {
        this.toggle();
      });
    }

    // Mini-HUD toggle button
    miniHudBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMiniHud();
    });

    // Double-click header to toggle Mini-HUD
    this.headerEl.addEventListener('dblclick', (e) => {
      if ((e.target as HTMLElement).closest('.relly-header-btn')) return;
      this.toggleMiniHud();
    });

    // Collapse toggle button
    this.collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.soundEngine.playClick();
      this.toggleCollapse();
    });

    // Copy button
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.soundEngine.playClick();
      this.copyJSON();
    });

    // Import button
    importBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.soundEngine.playClick();
      this.importModalInstance?.show();
    });

    if (options.soundVolume !== undefined) {
      this.soundEngine.setVolume(options.soundVolume);
    }

    if (options.accordion) {
      this.setAccordion(true);
    }

    if (options.ghostOnIdle) {
      this.setGhostMode(true, options.idleOpacity);
    }

    this.initSparkline(titleWrap);

    // Ghost mode hover listeners
    this.panelEl.addEventListener('mouseenter', () => {
      if (this.ghostOnIdle) {
        this.panelEl.style.opacity = '1';
      }
    });

    this.panelEl.addEventListener('mouseleave', () => {
      if (this.ghostOnIdle) {
        this.panelEl.style.opacity = `${this.idleOpacity}`;
      }
    });

    if (options.collapsed) {
      this.setCollapsed(true);
    }

    // Auto-Save setup
    this.autoSave = options.autoSave ?? false;
    this.autoSaveKey = options.autoSaveKey ?? 'relly-ui-session';

    this.presetManager.setOnChange(() => {
      if (this.autoSave) {
        this.queueAutoSave();
      }
    });

    this.panelEl.addEventListener('mouseup', () => {
      if (this.autoSave) {
        this.queueAutoSave();
      }
    });

    if (this.autoSave) {
      this.loadSession();
    }
  }

  private mount(options: RellyUIOptions, useShadow: boolean): void {
    if (typeof document === 'undefined') return;

    const pos = options.position || {};
    this.panelEl.style.top = pos.top !== undefined ? `${pos.top}px` : '20px';
    if (pos.left !== undefined) {
      this.panelEl.style.left = `${pos.left}px`;
    } else {
      this.panelEl.style.right = pos.right !== undefined ? `${pos.right}px` : '20px';
    }
    if (pos.bottom !== undefined) {
      this.panelEl.style.bottom = `${pos.bottom}px`;
    }

    const container = options.container
      ? typeof options.container === 'string'
        ? document.querySelector<HTMLElement>(options.container)
        : options.container
      : document.body;

    if (!container) return;

    if (useShadow && typeof container.attachShadow === 'function') {
      const host = document.createElement('div');
      host.className = 'relly-host';
      this.hostEl = host;
      this.shadowRoot = host.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(this.panelEl);
      container.appendChild(host);
    } else {
      container.appendChild(this.panelEl);
      if (options.container) {
        this.panelEl.style.position = 'relative';
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResizeBound);
      setTimeout(() => {
        this.clampToViewport();
      }, 0);
    }
  }

  public addTab(label: string): Tab {
    if (!this.tabsManagerInstance) {
      this.tabsManagerInstance = new TabsManager(
        this.headerEl,
        this.contentEl,
        this.bindingEngine,
        this.presetManager,
        this.soundEngine
      );
    }
    return this.tabsManagerInstance.addTab(label);
  }

  public createTab(label: string): Tab {
    return this.addTab(label);
  }

  public copyJSON(): string {
    const data = this.export();
    const jsonStr = JSON.stringify(data, null, 2);

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr).catch(() => {});
    }

    // Flash toast notification
    this.copyToastEl.textContent = 'JSON Copied!';
    this.copyToastEl.classList.add('relly-toast-show');
    this.soundEngine.playNotify();
    setTimeout(() => {
      this.copyToastEl.classList.remove('relly-toast-show');
    }, 1500);

    return jsonStr;
  }

  public notify(message: string, type: ToastType = 'info', duration: number = 2600): HTMLElement {
    return this.toastManager.notify(message, type, duration);
  }

  public getToastManager(): ToastManager {
    return this.toastManager;
  }

  public getContextMenuManager(): ContextMenuManager {
    return this.contextMenuManager;
  }

  public importJSON(json: string | Record<string, any>): this {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      this.import(data);
      this.copyToastEl.textContent = 'JSON Loaded!';
      this.copyToastEl.classList.add('relly-toast-show');
      this.soundEngine.playNotify();
      setTimeout(() => {
        this.copyToastEl.classList.remove('relly-toast-show');
      }, 1500);
    } catch (err) {
      console.warn('[RellyUI] Failed to import JSON', err);
    }
    return this;
  }

  public loadSchema(schema: SchemaDefinition): this {
    if (schema.title) {
      this.setTitle(schema.title);
    }
    SchemaLoader.load(this, schema);
    return this;
  }

  public setTitle(title: string): this {
    this.titleEl.textContent = title;
    return this;
  }

  public setTheme(theme: ThemeInput): this {
    this.themeManager.applyTheme(theme);
    if (this.autoSave) this.queueAutoSave();
    return this;
  }

  public setSoundPack(pack: SoundPack): this {
    this.soundEngine.setSoundPack(pack);
    return this;
  }

  public getSoundPack(): SoundPack {
    return this.soundEngine.getSoundPack();
  }

  public getSoundEngine(): SoundEngine {
    return this.soundEngine;
  }

  public toggleMiniHud(): this {
    return this.setMiniHud(!this.isMiniHud);
  }

  public setMiniHud(mini: boolean): this {
    this.isMiniHud = mini;
    if (this.isMiniHud) {
      this.panelEl.classList.add('relly-mini-hud');
      this.soundEngine.playMiniHud(true);
    } else {
      this.panelEl.classList.remove('relly-mini-hud');
      this.soundEngine.playMiniHud(false);
      this.clampToViewport();
    }
    if (this.autoSave) this.queueAutoSave();
    return this;
  }

  public isMiniHudMode(): boolean {
    return this.isMiniHud;
  }

  public setGhostMode(enabled: boolean, idleOpacity: number = 0.38): this {
    this.ghostOnIdle = enabled;
    this.idleOpacity = Math.max(0.05, Math.min(1.0, idleOpacity));
    this.panelEl.style.opacity = enabled ? `${this.idleOpacity}` : '1';
    return this;
  }

  public isGhostMode(): boolean {
    return this.ghostOnIdle;
  }

  public setSoundVolume(volume: number): this {
    this.soundEngine.setVolume(volume);
    return this;
  }

  public getSoundVolume(): number {
    return this.soundEngine.getVolume();
  }

  private initSparkline(titleWrap: HTMLElement): void {
    const canvas = document.createElement('canvas');
    canvas.className = 'relly-mini-sparkline';
    canvas.width = 48;
    canvas.height = 16;
    titleWrap.appendChild(canvas);

    this.sparklineCtx = canvas.getContext('2d');

    const animateSparkline = () => {
      if (this.isMiniHud && this.sparklineCtx) {
        this.drawSparkline();
      }
      if (typeof requestAnimationFrame !== 'undefined') {
        this.sparklineAnimId = requestAnimationFrame(animateSparkline);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      this.sparklineAnimId = requestAnimationFrame(animateSparkline);
    }
  }

  private drawSparkline(): void {
    const ctx = this.sparklineCtx;
    if (!ctx) return;
    const w = 48;
    const h = 16;
    ctx.clearRect(0, 0, w, h);

    const last = this.sparklineData[this.sparklineData.length - 1];
    const next = Math.max(8, Math.min(26, last + (Math.random() - 0.48) * 3));
    this.sparklineData.push(next);
    if (this.sparklineData.length > 14) this.sparklineData.shift();

    const min = Math.min(...this.sparklineData) - 1;
    const max = Math.max(...this.sparklineData) + 1;
    const range = max - min || 1;
    const step = w / (this.sparklineData.length - 1);

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < this.sparklineData.length; i++) {
      const x = i * step;
      const y = h - ((this.sparklineData[i] - min) / range) * (h - 2) - 1;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < this.sparklineData.length; i++) {
      const x = i * step;
      const y = h - ((this.sparklineData[i] - min) / range) * (h - 2) - 1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  public clampToViewport(): this {
    this.draggableInstance?.clampToViewport();
    this.resizableInstance?.clampToViewport();
    return this;
  }

  public toggleCollapse(): this {
    return this.setCollapsed(!this.isPanelCollapsed);
  }

  public setCollapsed(collapsed: boolean): this {
    this.isPanelCollapsed = collapsed;
    if (this.isPanelCollapsed) {
      this.panelEl.classList.add('relly-collapsed');
      this.collapseBtn.textContent = '+';
      this.bindingEngine.pause();
    } else {
      this.panelEl.classList.remove('relly-collapsed');
      this.collapseBtn.textContent = '_';
      this.bindingEngine.resume();
    }
    if (this.autoSave) this.queueAutoSave();
    return this;
  }

  public queueAutoSave(): void {
    if (!this.autoSave) return;
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    this.autoSaveTimeout = setTimeout(() => {
      this.saveSession();
    }, 250);
  }

  public saveSession(key?: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const storageKey = key || this.autoSaveKey;
    try {
      const pos = {
        left: this.panelEl.style.left ? parseFloat(this.panelEl.style.left) : undefined,
        top: this.panelEl.style.top ? parseFloat(this.panelEl.style.top) : undefined,
        right: this.panelEl.style.right ? parseFloat(this.panelEl.style.right) : undefined,
        bottom: this.panelEl.style.bottom ? parseFloat(this.panelEl.style.bottom) : undefined
      };

      const sessionData = {
        version: RellyUI.version,
        timestamp: Date.now(),
        isCollapsed: this.isPanelCollapsed,
        isMiniHud: this.isMiniHud,
        theme: this.themeManager.getCurrentThemeName(),
        position: pos,
        width: this.panelEl.style.width,
        height: this.panelEl.style.height,
        components: this.presetManager.export()
      };

      window.localStorage.setItem(storageKey, JSON.stringify(sessionData));
    } catch (err) {
      console.warn('[RellyUI] Failed to save session', err);
    }
  }

  public loadSession(key?: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const storageKey = key || this.autoSaveKey;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return false;

      // Restore position
      if (data.position) {
        if (data.position.left !== undefined) {
          this.panelEl.style.left = `${data.position.left}px`;
          this.panelEl.style.right = '';
        } else if (data.position.right !== undefined) {
          this.panelEl.style.right = `${data.position.right}px`;
          this.panelEl.style.left = '';
        }
        if (data.position.top !== undefined) {
          this.panelEl.style.top = `${data.position.top}px`;
          this.panelEl.style.bottom = '';
        } else if (data.position.bottom !== undefined) {
          this.panelEl.style.bottom = `${data.position.bottom}px`;
          this.panelEl.style.top = '';
        }
      }

      // Restore size
      if (data.width) this.panelEl.style.width = data.width;
      if (data.height) this.panelEl.style.height = data.height;

      // Restore theme
      if (data.theme && data.theme !== 'custom') {
        this.setTheme(data.theme);
      }

      // Restore collapsed state
      if (data.isCollapsed !== undefined && data.isCollapsed !== this.isPanelCollapsed) {
        this.setCollapsed(data.isCollapsed);
      }

      // Restore Mini-HUD state
      if (data.isMiniHud !== undefined && data.isMiniHud !== this.isMiniHud) {
        this.setMiniHud(data.isMiniHud);
      }

      // Restore component states via PresetManager
      if (data.components) {
        this.presetManager.import(data.components);
      }

      return true;
    } catch (err) {
      console.warn('[RellyUI] Failed to load session', err);
      return false;
    }
  }

  public clearSession(key?: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const storageKey = key || this.autoSaveKey;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {}
  }

  public setAutoSave(enabled: boolean, key?: string): this {
    this.autoSave = enabled;
    if (key) this.autoSaveKey = key;
    if (this.autoSave) {
      this.loadSession();
    }
    return this;
  }

  public toggle(): this {
    return this.isPanelHidden ? this.show() : this.hide();
  }

  public show(): this {
    this.isPanelHidden = false;
    this.panelEl.classList.remove('relly-hidden');
    if (!this.isPanelCollapsed) {
      this.bindingEngine.resume();
    }
    return this;
  }

  public hide(): this {
    this.isPanelHidden = true;
    this.panelEl.classList.add('relly-hidden');
    this.bindingEngine.pause();
    return this;
  }

  public save(storageKey?: string): this {
    this.presetManager.save(storageKey);
    return this;
  }

  public load(storageKey?: string): this {
    this.presetManager.load(storageKey);
    return this;
  }

  public export(): Record<string, any> {
    return this.presetManager.export();
  }

  public import(data: Record<string, any>): this {
    this.presetManager.import(data);
    return this;
  }

  public getElement(): HTMLElement {
    return this.panelEl;
  }

  public getShadowRoot(): ShadowRoot | null {
    return this.shadowRoot;
  }

  public getHost(): HTMLElement | null {
    return this.hostEl || null;
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResizeBound);
      if (this.sparklineAnimId) {
        cancelAnimationFrame(this.sparklineAnimId);
      }
    }
    if (this.draggableInstance) {
      this.draggableInstance.destroy();
    }
    if (this.resizableInstance) {
      this.resizableInstance.destroy();
    }
    if (this.hotkeyInstance) {
      this.hotkeyInstance.destroy();
    }
    if (this.searchBarInstance) {
      this.searchBarInstance.destroy();
    }
    if (this.tabsManagerInstance) {
      this.tabsManagerInstance.destroy();
    }
    if (this.importModalInstance) {
      this.importModalInstance.destroy();
    }
    this.toastManager.destroy();
    this.contextMenuManager.destroy();
    this.bindingEngine.destroy();
    this.destroyChildren();

    if (this.hostEl) {
      this.hostEl.remove();
    } else {
      this.panelEl.remove();
    }
  }
}
