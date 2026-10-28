import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { StatusType } from '../../types';

export class StatusIndicator extends BaseComponent<string> {
  private wrapperEl: HTMLElement;
  private ledEl: HTMLElement;
  private badgeEl: HTMLElement;
  private detailEl: HTMLElement;

  private currentStatus: StatusType = 'online';
  private customBadge?: string;
  private customDetail?: string;

  constructor(
    label: string,
    targetObject?: any,
    property?: string,
    bindingEngine?: BindingEngine
  ) {
    super(label, targetObject, property, bindingEngine);

    this.wrapperEl = document.createElement('div');
    this.wrapperEl.className = 'relly-status-wrapper';

    // Pulsing LED
    this.ledEl = document.createElement('div');
    this.ledEl.className = 'relly-status-led relly-status-led--online';
    this.ledEl.innerHTML = `
      <span class="relly-status-pulse-ring"></span>
      <span class="relly-status-led-core"></span>
    `;

    // Status Badge
    this.badgeEl = document.createElement('span');
    this.badgeEl.className = 'relly-status-badge relly-status-badge--online';
    this.badgeEl.textContent = 'ONLINE';

    // Detail text
    this.detailEl = document.createElement('span');
    this.detailEl.className = 'relly-status-detail';

    this.wrapperEl.appendChild(this.ledEl);
    this.wrapperEl.appendChild(this.badgeEl);
    this.wrapperEl.appendChild(this.detailEl);
    this.controlEl.appendChild(this.wrapperEl);

    this.update();
  }

  public setStatus(status: StatusType, badge?: string, detail?: string): this {
    this.currentStatus = status;
    if (badge !== undefined) this.customBadge = badge;
    if (detail !== undefined) this.customDetail = detail;

    if (this.targetObject && this.property) {
      this.targetObject[this.property] = status;
    }
    this.update();
    return this;
  }

  public setBadge(badge: string): this {
    this.customBadge = badge;
    this.update();
    return this;
  }

  public setDetail(detail: string): this {
    this.customDetail = detail;
    this.update();
    return this;
  }

  public update(): this {
    if (!this.wrapperEl || !this.ledEl) return this;

    const rawVal = this.getValue();
    let status: StatusType = this.currentStatus;

    if (typeof rawVal === 'string' && rawVal) {
      const lower = rawVal.toLowerCase();
      if (['online', 'busy', 'offline', 'info', 'ready'].includes(lower)) {
        status = lower as StatusType;
      }
    }

    this.ledEl.className = `relly-status-led relly-status-led--${status}`;
    this.badgeEl.className = `relly-status-badge relly-status-badge--${status}`;

    this.badgeEl.textContent = this.customBadge || status.toUpperCase();

    if (this.customDetail) {
      this.detailEl.textContent = this.customDetail;
      this.detailEl.style.display = 'inline-block';
    } else {
      this.detailEl.style.display = 'none';
    }

    return this;
  }
}
