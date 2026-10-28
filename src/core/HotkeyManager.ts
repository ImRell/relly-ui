export class HotkeyManager {
  private onKeyDownBound: (e: KeyboardEvent) => void;

  constructor(
    private hotkey: string | null,
    private onToggle: () => void
  ) {
    this.onKeyDownBound = this.onKeyDown.bind(this);
    if (this.hotkey && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDownBound);
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.hotkey) return;

    // Check composedPath for any input/textarea/select/contenteditable
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    for (const target of path) {
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable ||
          target.classList.contains('relly-search-input')
        ) {
          return;
        }
      }
    }

    // Also check document.activeElement and any shadowRoot activeElement
    let activeEl: Element | null = document.activeElement;
    while (activeEl && activeEl.shadowRoot && activeEl.shadowRoot.activeElement) {
      activeEl = activeEl.shadowRoot.activeElement;
    }

    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        (activeEl as HTMLElement).isContentEditable ||
        (activeEl as HTMLElement)?.classList?.contains('relly-search-input'))
    ) {
      return;
    }

    if (e.code === this.hotkey || e.key.toLowerCase() === this.hotkey.toLowerCase()) {
      e.preventDefault();
      this.onToggle();
    }
  }

  public setHotkey(hotkey: string | null): void {
    this.hotkey = hotkey;
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDownBound);
    }
  }
}
