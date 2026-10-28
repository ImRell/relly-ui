import { ToastType } from '../types';
import { SoundEngine } from './SoundEngine';

export class ToastManager {
  private containerEl: HTMLElement;

  constructor(
    private parentEl: HTMLElement,
    private soundEngine?: SoundEngine
  ) {
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'relly-toast-container';
    this.parentEl.appendChild(this.containerEl);
  }

  public notify(
    message: string,
    type: ToastType = 'info',
    duration: number = 2600
  ): HTMLElement {
    this.soundEngine?.playNotify();

    const toast = document.createElement('div');
    toast.className = `relly-toast relly-toast--${type}`;

    const iconEl = document.createElement('span');
    iconEl.className = 'relly-toast-icon';
    iconEl.innerHTML = this.getIconSvg(type);

    const msgEl = document.createElement('span');
    msgEl.className = 'relly-toast-msg';
    msgEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'relly-toast-close';
    closeBtn.innerHTML = '✕';
    closeBtn.title = 'Dismiss';

    toast.appendChild(iconEl);
    toast.appendChild(msgEl);
    toast.appendChild(closeBtn);

    const dismiss = () => {
      if (toast.classList.contains('relly-toast-leave')) return;
      toast.classList.add('relly-toast-leave');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 200);
    };

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });

    toast.addEventListener('click', dismiss);

    this.containerEl.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('relly-toast-enter');
    });

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }

    return toast;
  }

  private getIconSvg(type: ToastType): string {
    switch (type) {
      case 'success':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      case 'warning':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case 'error':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      case 'info':
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
  }

  public destroy(): void {
    if (this.containerEl.parentElement) {
      this.containerEl.parentElement.removeChild(this.containerEl);
    }
  }
}
