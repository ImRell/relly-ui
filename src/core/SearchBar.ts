import { SearchOptions } from '../types';

export class SearchBar {
  public element: HTMLElement;
  private inputEl: HTMLInputElement;
  private clearBtn: HTMLButtonElement;
  private ignoreCase: boolean;
  private onGlobalKeyDownBound: (e: KeyboardEvent) => void;

  constructor(
    private bodyEl: HTMLElement,
    options: SearchOptions = {}
  ) {
    this.ignoreCase = options.ignoreCase !== false;

    this.element = document.createElement('div');
    this.element.className = 'relly-search-bar';

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.className = 'relly-search-input';
    this.inputEl.placeholder = options.placeholder || 'Filter settings... (Press "/" to focus)';

    this.clearBtn = document.createElement('button');
    this.clearBtn.className = 'relly-search-clear';
    this.clearBtn.textContent = '✕';
    this.clearBtn.title = 'Clear search';
    this.clearBtn.style.display = 'none';

    this.element.appendChild(this.inputEl);
    this.element.appendChild(this.clearBtn);

    this.inputEl.addEventListener('input', () => {
      this.filter(this.inputEl.value);
    });

    this.inputEl.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        this.clear();
        this.inputEl.blur();
      }
    });

    this.inputEl.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });

    this.inputEl.addEventListener('keypress', (e) => {
      e.stopPropagation();
    });

    this.clearBtn.addEventListener('click', () => {
      this.clear();
      this.inputEl.focus();
    });

    this.onGlobalKeyDownBound = this.onGlobalKeyDown.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onGlobalKeyDownBound);
    }
  }

  private onGlobalKeyDown(e: KeyboardEvent): void {
    if (e.key === '/') {
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

      let activeEl: Element | null = document.activeElement;
      while (activeEl && activeEl.shadowRoot && activeEl.shadowRoot.activeElement) {
        activeEl = activeEl.shadowRoot.activeElement;
      }

      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl as HTMLElement)?.isContentEditable ||
        (activeEl as HTMLElement)?.classList?.contains('relly-search-input');

      if (!isInput) {
        e.preventDefault();
        this.focus();
      }
    }
  }

  public focus(): this {
    this.inputEl.focus();
    this.inputEl.select();
    return this;
  }

  public getInput(): HTMLInputElement {
    return this.inputEl;
  }

  public filter(query: string): void {
    const rawQuery = query.trim();
    if (!rawQuery) {
      this.clearBtn.style.display = 'none';
      this.resetFilter();
      return;
    }

    this.clearBtn.style.display = 'block';
    const normalizedQuery = this.ignoreCase ? rawQuery.toLowerCase() : rawQuery;

    // Search in rows
    const rows = this.bodyEl.querySelectorAll<HTMLElement>('.relly-row, .relly-graph-row');
    rows.forEach((row) => {
      const labelEl = row.querySelector('.relly-row-label, .relly-graph-header span');
      const text = labelEl?.textContent || '';
      const targetText = this.ignoreCase ? text.toLowerCase() : text;
      const matches = targetText.includes(normalizedQuery);

      if (matches) {
        row.classList.remove('relly-search-hidden');
        // If parent is a section, make sure section is visible and expanded
        const parentSection = row.closest<HTMLElement>('.relly-section');
        if (parentSection) {
          parentSection.classList.remove('relly-section--collapsed');
          parentSection.classList.remove('relly-search-hidden');
        }
      } else {
        row.classList.add('relly-search-hidden');
      }
    });

    // Check sections: if section title itself matches query, show all its rows
    const sections = this.bodyEl.querySelectorAll<HTMLElement>('.relly-section');
    sections.forEach((sec) => {
      const titleEl = sec.querySelector('.relly-section-title-wrap span:last-child');
      const secTitle = titleEl?.textContent || '';
      const targetSecTitle = this.ignoreCase ? secTitle.toLowerCase() : secTitle;

      if (targetSecTitle.includes(normalizedQuery)) {
        sec.classList.remove('relly-search-hidden');
        sec.classList.remove('relly-section--collapsed');
        sec.querySelectorAll<HTMLElement>('.relly-row, .relly-graph-row').forEach((r) => {
          r.classList.remove('relly-search-hidden');
        });
      } else {
        // If none of the section's rows match, hide the section
        const visibleRows = sec.querySelectorAll<HTMLElement>(
          '.relly-row:not(.relly-search-hidden), .relly-graph-row:not(.relly-search-hidden)'
        );
        if (visibleRows.length === 0) {
          sec.classList.add('relly-search-hidden');
        }
      }
    });
  }

  public clear(): void {
    this.inputEl.value = '';
    this.clearBtn.style.display = 'none';
    this.resetFilter();
  }

  private resetFilter(): void {
    const hiddenEls = this.bodyEl.querySelectorAll<HTMLElement>('.relly-search-hidden');
    hiddenEls.forEach((el) => {
      el.classList.remove('relly-search-hidden');
    });
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onGlobalKeyDownBound);
    }
    this.element.remove();
  }
}
