export class ImportModal {
  public element: HTMLElement;
  private textareaEl: HTMLTextAreaElement;
  private errorEl: HTMLElement;
  private dropzoneEl: HTMLElement;
  private fileInput: HTMLInputElement;

  constructor(
    private parentEl: HTMLElement,
    private onApply: (data: Record<string, any>) => void
  ) {
    this.element = document.createElement('div');
    this.element.className = 'relly-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'relly-modal';

    // Header
    const header = document.createElement('div');
    header.className = 'relly-modal-header';

    const title = document.createElement('span');
    title.className = 'relly-modal-title';
    title.textContent = 'Import JSON Config';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'relly-header-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.hide());

    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Dropzone
    this.dropzoneEl = document.createElement('div');
    this.dropzoneEl.className = 'relly-dropzone';
    this.dropzoneEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span>Drag & drop a <strong>.json</strong> file here, or click to browse</span>
    `;

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = '.json,application/json';
    this.fileInput.style.display = 'none';

    this.dropzoneEl.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    // Drag & Drop events
    this.dropzoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzoneEl.classList.add('relly-dropzone-drag');
    });
    this.dropzoneEl.addEventListener('dragleave', () => {
      this.dropzoneEl.classList.remove('relly-dropzone-drag');
    });
    this.dropzoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzoneEl.classList.remove('relly-dropzone-drag');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.readFile(e.dataTransfer.files[0]);
      }
    });

    modal.appendChild(this.dropzoneEl);
    modal.appendChild(this.fileInput);

    // Textarea
    this.textareaEl = document.createElement('textarea');
    this.textareaEl.className = 'relly-import-textarea';
    this.textareaEl.placeholder = 'Paste JSON configuration here...';
    modal.appendChild(this.textareaEl);

    // Error message
    this.errorEl = document.createElement('div');
    this.errorEl.className = 'relly-import-error';
    modal.appendChild(this.errorEl);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'relly-modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'relly-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.flex = '1';
    cancelBtn.addEventListener('click', () => this.hide());

    const applyBtn = document.createElement('button');
    applyBtn.className = 'relly-btn relly-btn-primary';
    applyBtn.textContent = 'Apply & Load';
    applyBtn.style.flex = '2';
    applyBtn.addEventListener('click', () => this.apply());

    actions.appendChild(cancelBtn);
    actions.appendChild(applyBtn);
    modal.appendChild(actions);

    this.element.appendChild(modal);

    // Close on clicking backdrop
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.hide();
      }
    });

    this.parentEl.appendChild(this.element);
  }

  private handleFileSelect(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.readFile(target.files[0]);
    }
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.textareaEl.value = reader.result;
        this.errorEl.textContent = '';
      }
    };
    reader.readAsText(file);
  }

  public show(): void {
    this.errorEl.textContent = '';
    this.element.classList.add('relly-modal-show');
    this.textareaEl.focus();
  }

  public hide(): void {
    this.element.classList.remove('relly-modal-show');
  }

  private apply(): void {
    const raw = this.textareaEl.value.trim();
    if (!raw) {
      this.errorEl.textContent = 'Please paste JSON or drop a file.';
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('JSON root must be an object.');
      }
      this.onApply(parsed);
      this.hide();
      this.textareaEl.value = '';
      this.errorEl.textContent = '';
    } catch (err: any) {
      this.errorEl.textContent = `Invalid JSON: ${err.message || 'Syntax error'}`;
    }
  }

  public destroy(): void {
    this.element.remove();
  }
}
