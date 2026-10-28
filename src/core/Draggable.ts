import { SoundEngine } from './SoundEngine';

export class Draggable {
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialLeft = 0;
  private initialTop = 0;
  private wasSnapped = false;

  public snapThreshold = 18;
  public magneticSnap = true;

  private onMouseDownBound: (e: MouseEvent) => void;
  private onMouseMoveBound: (e: MouseEvent) => void;
  private onMouseUpBound: (e: MouseEvent) => void;
  private onResizeBound: () => void;

  constructor(
    private handle: HTMLElement,
    private panel: HTMLElement,
    private soundEngine?: SoundEngine
  ) {
    this.onMouseDownBound = this.onMouseDown.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onMouseUpBound = this.onMouseUp.bind(this);
    this.onResizeBound = this.onResize.bind(this);

    this.handle.addEventListener('mousedown', this.onMouseDownBound);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResizeBound);
    }
  }

  public clampToViewport(): void {
    if (typeof window === 'undefined') return;

    const rect = this.panel.getBoundingClientRect();
    const panelWidth = rect.width;
    const panelHeight = rect.height;
    const maxLeft = Math.max(0, window.innerWidth - panelWidth);
    const maxTop = Math.max(0, window.innerHeight - panelHeight);

    let newLeft = rect.left;
    let newTop = rect.top;

    if (newLeft > maxLeft) newLeft = maxLeft;
    if (newLeft < 0) newLeft = 0;
    if (newTop > maxTop) newTop = maxTop;
    if (newTop < 0) newTop = 0;

    this.panel.style.left = `${Math.round(newLeft)}px`;
    this.panel.style.top = `${Math.round(newTop)}px`;
    this.panel.style.right = 'auto';
    this.panel.style.bottom = 'auto';
  }

  private onResize(): void {
    this.clampToViewport();
  }

  private onMouseDown(e: MouseEvent): void {
    // Only drag with left mouse button, and ignore if clicking an action button inside the header
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.relly-header-btn')) return;

    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const rect = this.panel.getBoundingClientRect();
    this.initialLeft = rect.left;
    this.initialTop = rect.top;

    // Remove right/bottom constraints to avoid layout conflicts when setting left/top
    this.panel.style.right = 'auto';
    this.panel.style.bottom = 'auto';
    this.panel.style.left = `${this.initialLeft}px`;
    this.panel.style.top = `${this.initialTop}px`;

    window.addEventListener('mousemove', this.onMouseMoveBound);
    window.addEventListener('mouseup', this.onMouseUpBound);
    e.preventDefault();
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    let newLeft = this.initialLeft + dx;
    let newTop = this.initialTop + dy;

    // Viewport clamping & magnetic edge snapping
    const rect = this.panel.getBoundingClientRect();
    const panelWidth = rect.width;
    const panelHeight = rect.height;
    const maxLeft = Math.max(0, window.innerWidth - panelWidth);
    const maxTop = Math.max(0, window.innerHeight - panelHeight);

    let snapped = false;

    if (this.magneticSnap) {
      if (Math.abs(newLeft) < this.snapThreshold) {
        newLeft = 0;
        snapped = true;
      } else if (Math.abs(newLeft - maxLeft) < this.snapThreshold) {
        newLeft = maxLeft;
        snapped = true;
      }

      if (Math.abs(newTop) < this.snapThreshold) {
        newTop = 0;
        snapped = true;
      } else if (Math.abs(newTop - maxTop) < this.snapThreshold) {
        newTop = maxTop;
        snapped = true;
      }

      if (snapped && !this.wasSnapped) {
        this.soundEngine?.playSnap();
      }
      this.wasSnapped = snapped;
    }

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    this.panel.style.left = `${newLeft}px`;
    this.panel.style.top = `${newTop}px`;
  }

  private onMouseUp(): void {
    this.isDragging = false;
    this.wasSnapped = false;
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('mouseup', this.onMouseUpBound);
  }

  public destroy(): void {
    this.handle.removeEventListener('mousedown', this.onMouseDownBound);
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.onMouseMoveBound);
      window.removeEventListener('mouseup', this.onMouseUpBound);
      window.removeEventListener('resize', this.onResizeBound);
    }
  }
}
