import { BaseComponent } from '../../core/BaseComponent';

export class Separator extends BaseComponent<void> {
  private titleEl?: HTMLElement;
  private lineLeftEl: HTMLElement;
  private lineRightEl?: HTMLElement;

  constructor(title?: string, dashed: boolean = false) {
    super('');

    this.element.className = 'relly-separator-row';
    this.element.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'relly-separator';
    if (dashed) wrap.classList.add('relly-separator--dashed');

    this.lineLeftEl = document.createElement('span');
    this.lineLeftEl.className = 'relly-separator-line';
    wrap.appendChild(this.lineLeftEl);

    if (title) {
      wrap.classList.add('relly-separator--has-title');
      this.titleEl = document.createElement('span');
      this.titleEl.className = 'relly-separator-title';
      this.titleEl.textContent = title;
      wrap.appendChild(this.titleEl);

      this.lineRightEl = document.createElement('span');
      this.lineRightEl.className = 'relly-separator-line';
      wrap.appendChild(this.lineRightEl);
    }

    this.element.appendChild(wrap);
  }

  public setTitle(title: string): this {
    if (!this.titleEl) {
      this.titleEl = document.createElement('span');
      this.titleEl.className = 'relly-separator-title';
      const wrap = this.element.querySelector('.relly-separator')!;
      wrap.classList.add('relly-separator--has-title');
      wrap.appendChild(this.titleEl);

      this.lineRightEl = document.createElement('span');
      this.lineRightEl.className = 'relly-separator-line';
      wrap.appendChild(this.lineRightEl);
    }
    this.titleEl.textContent = title;
    return this;
  }

  public update(): this {
    return this;
  }
}
