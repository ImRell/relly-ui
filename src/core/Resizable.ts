export class Resizable {
  public handleEl: HTMLElement;
  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private initialWidth = 0;
  private initialHeight = 0;

  private onMouseDownBound: (e: MouseEvent) => void;
  private onMouseMoveBound: (e: MouseEvent) => void;
  private onMouseUpBound: (e: MouseEvent) => void;
  private onResizeBound: () => void;

  constructor(
    private panel: HTMLElement,
    private minWidth: number = 240,
    private minHeight: number = 120
  ) {
    this.handleEl = document.createElement('div');
    this.handleEl.className = 'relly-resize-handle';
    this.handleEl.title = 'Drag to resize panel';
    this.handleEl.innerHTML = `
      <svg viewBox="0 0 10 10">
        <line x1="8" y1="2" x2="2" y2="8"></line>
        <line x1="8" y1="5" x2="5" y2="8"></line>
        <line x1="8" y1="8" x2="8" y2="8"></line>
      </svg>
    `;

    this.panel.appendChild(this.handleEl);

    this.onMouseDownBound = this.onMouseDown.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onMouseUpBound = this.onMouseUp.bind(this);
    this.onResizeBound = this.onWindowResize.bind(this);

    this.handleEl.addEventListener('mousedown', this.onMouseDownBound);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResizeBound);
    }
  }

  public clampToViewport(): void {
    if (typeof window === 'undefined') return;

    const rect = this.panel.getBoundingClientRect();
    const maxWidth = Math.max(this.minWidth, window.innerWidth - 16);
    const maxHeight = Math.max(this.minHeight, window.innerHeight - 16);

    let newWidth = rect.width;
    let newHeight = rect.height;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      this.panel.style.width = `${Math.round(newWidth)}px`;
    }
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      this.panel.style.height = `${Math.round(newHeight)}px`;
    }
  }

  private onWindowResize(): void {
    this.clampToViewport();
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    this.isResizing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const rect = this.panel.getBoundingClientRect();
    this.initialWidth = rect.width;
    this.initialHeight = rect.height;

    window.addEventListener('mousemove', this.onMouseMoveBound);
    window.addEventListener('mouseup', this.onMouseUpBound);
    e.preventDefault();
    e.stopPropagation();
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isResizing) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    const rect = this.panel.getBoundingClientRect();
    const maxAllowedWidth = Math.max(this.minWidth, window.innerWidth - rect.left - 8);
    const maxAllowedHeight = Math.max(this.minHeight, window.innerHeight - rect.top - 8);

    const newWidth = Math.max(this.minWidth, Math.min(maxAllowedWidth, this.initialWidth + dx));
    const newHeight = Math.max(
      this.minHeight,
      Math.min(maxAllowedHeight, this.initialHeight + dy)
    );

    this.panel.style.width = `${Math.round(newWidth)}px`;
    this.panel.style.height = `${Math.round(newHeight)}px`;

    // Make body take remaining height
    const bodyEl = this.panel.querySelector<HTMLElement>('.relly-body');
    if (bodyEl) {
      bodyEl.style.maxHeight = 'none';
      bodyEl.style.flex = '1';
    }
  }

  private onMouseUp(): void {
    this.isResizing = false;
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('mouseup', this.onMouseUpBound);
  }

  public destroy(): void {
    this.handleEl.removeEventListener('mousedown', this.onMouseDownBound);
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.onMouseMoveBound);
      window.removeEventListener('mouseup', this.onMouseUpBound);
      window.removeEventListener('resize', this.onResizeBound);
    }
    this.handleEl.remove();
  }
}
