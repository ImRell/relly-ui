import { ContextMenuItem } from '../types';
import { BaseComponent } from './BaseComponent';
import { SoundEngine } from './SoundEngine';

export class ContextMenuManager {
  private menuEl: HTMLElement;
  private currentComponent?: BaseComponent;
  private onDocClickBound: (e: MouseEvent) => void;
  private onKeyDownBound: (e: KeyboardEvent) => void;

  constructor(
    private panelEl: HTMLElement,
    private soundEngine?: SoundEngine
  ) {
    this.menuEl = document.createElement('div');
    this.menuEl.className = 'relly-context-menu';
    this.menuEl.style.display = 'none';
    this.panelEl.appendChild(this.menuEl);

    this.onDocClickBound = (e: MouseEvent) => {
      if (!this.menuEl.contains(e.target as Node)) {
        this.hide();
      }
    };

    this.onKeyDownBound = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', this.onDocClickBound);
      window.addEventListener('keydown', this.onKeyDownBound);
    }

    this.panelEl.addEventListener('contextmenu', this.onContextMenu);
  }

  private onContextMenu = (e: MouseEvent): void => {
    // Find closest component element
    let target = e.target as HTMLElement | null;
    let componentEl = target?.closest('.relly-row, .relly-graph-row') as HTMLElement | null;
    if (!componentEl) return;

    const component = (componentEl as any).__rellyComponent as BaseComponent | undefined;
    const items = component?.getContextMenu();

    if (!items || items.length === 0) {
      return; // UI creator has not configured context menu for this control
    }

    e.preventDefault();
    e.stopPropagation();
    this.currentComponent = component;
    this.show(items, e.clientX, e.clientY);
  };

  public show(items: ContextMenuItem[], clientX: number, clientY: number): void {
    this.menuEl.innerHTML = '';

    for (const item of items) {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.className = 'relly-context-separator';
        this.menuEl.appendChild(sep);
        continue;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'relly-context-item';
      if (item.danger) btn.classList.add('relly-context-item--danger');
      if (item.disabled) btn.disabled = true;

      let iconHtml = '';
      if (item.icon) {
        iconHtml = `<span class="relly-context-icon">${item.icon}</span>`;
      }

      btn.innerHTML = `${iconHtml}<span class="relly-context-label">${item.label}</span>`;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.soundEngine?.playClick();
        const comp = this.currentComponent;
        this.hide();
        item.action(comp);
      });

      this.menuEl.appendChild(btn);
    }

    this.menuEl.style.display = 'flex';

    // Position relative to panel
    const panelRect = this.panelEl.getBoundingClientRect();
    let left = clientX - panelRect.left;
    let top = clientY - panelRect.top;

    const menuWidth = 160;
    const menuHeight = this.menuEl.offsetHeight || 120;

    if (left + menuWidth > panelRect.width) {
      left = Math.max(4, panelRect.width - menuWidth - 4);
    }
    if (top + menuHeight > panelRect.height) {
      top = Math.max(4, panelRect.height - menuHeight - 4);
    }

    this.menuEl.style.left = `${left}px`;
    this.menuEl.style.top = `${top}px`;
  }

  public hide(): void {
    this.menuEl.style.display = 'none';
    this.currentComponent = undefined;
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('click', this.onDocClickBound);
      window.removeEventListener('keydown', this.onKeyDownBound);
    }
    this.panelEl.removeEventListener('contextmenu', this.onContextMenu);
    if (this.menuEl.parentElement) {
      this.menuEl.parentElement.removeChild(this.menuEl);
    }
  }
}
