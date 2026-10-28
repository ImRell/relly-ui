import { BaseComponent } from '../../core/BaseComponent';
import { BindingEngine } from '../../core/BindingEngine';
import { SoundEngine } from '../../core/SoundEngine';
import { GraphSeriesOptions } from '../../types';

export interface GraphSeries {
  id: string;
  label: string;
  color: string;
  fillColor?: string;
  buffer: number[];
}

export class Graph extends BaseComponent<number | Record<string, number>> {
  private canvasContainer: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private statsEl: HTMLElement;
  private graphTooltipEl: HTMLElement;
  private legendEl: HTMLElement;

  private primarySeries: GraphSeries;
  private seriesList: GraphSeries[] = [];
  private seriesMap: Map<string, GraphSeries> = new Map();

  private bufferSize: number = 60;
  private min: number = 0;
  private max: number = 100;
  private autoRange: boolean = true;
  private smoothCurves: boolean = true;
  private isPaused: boolean = false;
  private formatter: (val: number) => string = (v) =>
    typeof v === 'number' && !isNaN(v) ? v.toFixed(1) : '0';

  private cssWidth: number = 280;
  private cssHeight: number = 90;

  private sampleInterval: number = 50;
  private lastSampleTime: number = 0;

  private hoverIndex: number | null = null;

  private resizeObserver: ResizeObserver | null = null;
  private mediaQueryList: MediaQueryList | null = null;
  private soundEngine?: SoundEngine;

  constructor(
    label: string,
    targetObject?: any,
    property?: string,
    bindingEngine?: BindingEngine,
    soundEngine?: SoundEngine
  ) {
    super(label, targetObject, property, bindingEngine);
    this.soundEngine = soundEngine;

    // Graph row layout
    this.element.className = 'relly-graph-row';
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'relly-graph-header';

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'relly-graph-label';
    this.labelEl.textContent = label;

    this.statsEl = document.createElement('div');
    this.statsEl.className = 'relly-graph-stats';
    this.statsEl.innerHTML = `<span class="relly-graph-val">0</span>`;

    header.appendChild(this.labelEl);
    header.appendChild(this.statsEl);
    this.element.appendChild(header);

    // Multi-series legend (initially empty)
    this.legendEl = document.createElement('div');
    this.legendEl.className = 'relly-graph-legend';
    this.element.appendChild(this.legendEl);

    // Canvas container
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'relly-graph-canvas-container';
    this.canvasContainer.title = 'Click to pause/freeze data stream for inspection';

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'relly-graph-canvas';
    this.canvasContainer.appendChild(this.canvas);

    // Interactive tooltip overlay
    this.graphTooltipEl = document.createElement('div');
    this.graphTooltipEl.className = 'relly-graph-tooltip';
    this.canvasContainer.appendChild(this.graphTooltipEl);

    this.element.appendChild(this.canvasContainer);

    this.ctx = this.canvas.getContext('2d');

    // Initialize primary series
    this.primarySeries = {
      id: 'default',
      label: label,
      color: '#38bdf8',
      fillColor: 'rgba(56, 189, 248, 0.25)',
      buffer: []
    };
    this.seriesList.push(this.primarySeries);
    this.seriesMap.set('default', this.primarySeries);

    this.initCanvasSize();
    this.setupListeners();
    this.update();

    if (this.bindingEngine && this.targetObject && this.property) {
      this.listen();
    }
  }

  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    // ResizeObserver on canvasContainer for crisp 1:1 pixel rendering
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
        this.draw();
      });
      this.resizeObserver.observe(this.canvasContainer);
    }

    // MatchMedia listener to handle zoom changes
    this.updateDPRListener();

    // Hover inspector events (silent, no tick sound on move)
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);

    // Click event on canvas: plays click sound and toggles pause/freeze
    this.canvas.addEventListener('click', this.onCanvasClick);
  }

  private updateDPRListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const dpr = window.devicePixelRatio || 1;
    this.mediaQueryList?.removeEventListener('change', this.onResolutionChange);
    this.mediaQueryList = window.matchMedia(`(resolution: ${dpr}dppx)`);
    this.mediaQueryList.addEventListener('change', this.onResolutionChange);
  }

  private onResolutionChange = (): void => {
    this.updateDPRListener();
    this.resizeCanvas();
    this.draw();
  };

  private initCanvasSize(): void {
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.canvasContainer) return;
    const rect = this.canvasContainer.getBoundingClientRect();
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = Math.max(10, Math.floor(rect.width || 280));
    const h = Math.max(10, Math.floor(rect.height || 80));

    this.cssWidth = w;
    this.cssHeight = h;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);

    if (this.ctx) {
      if (typeof this.ctx.resetTransform === 'function') {
        this.ctx.resetTransform();
      } else {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      this.ctx.scale(dpr, dpr);
    }
  }

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = this.cssWidth;

    if (width <= 0) return;

    const step = width / Math.max(1, this.bufferSize - 1);
    const index = Math.round(x / step);
    const clampedIndex = Math.max(0, Math.min(this.bufferSize - 1, index));

    if (clampedIndex !== this.hoverIndex) {
      this.hoverIndex = clampedIndex;
      this.updateTooltip(x);
      this.draw();
    }
  };

  private onMouseLeave = (): void => {
    this.hoverIndex = null;
    this.graphTooltipEl.classList.remove('relly-tooltip-show');
    this.draw();
  };

  private onCanvasClick = (): void => {
    this.soundEngine?.playClick();
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.canvasContainer.classList.add('relly-graph-paused');
    } else {
      this.canvasContainer.classList.remove('relly-graph-paused');
    }
    this.updateStats();
    this.draw();
  };

  private updateTooltip(crosshairX: number): void {
    if (this.hoverIndex === null) return;

    let html = '';
    for (const series of this.seriesList) {
      const startIndex = this.bufferSize - series.buffer.length;
      const bufIdx = this.hoverIndex - startIndex;
      if (bufIdx >= 0 && bufIdx < series.buffer.length) {
        const val = series.buffer[bufIdx];
        html += `<div><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${series.color};margin-right:4px;"></span>${series.label}: <b>${this.formatter(val)}</b></div>`;
      }
    }

    if (!html) {
      this.graphTooltipEl.classList.remove('relly-tooltip-show');
      return;
    }

    this.graphTooltipEl.innerHTML = html;
    this.graphTooltipEl.classList.add('relly-tooltip-show');

    // Position tooltip clamping inside container
    const tooltipWidth = this.graphTooltipEl.offsetWidth || 80;
    let leftPos = crosshairX;
    if (leftPos - tooltipWidth / 2 < 4) {
      leftPos = 4 + tooltipWidth / 2;
    } else if (leftPos + tooltipWidth / 2 > this.cssWidth - 4) {
      leftPos = this.cssWidth - 4 - tooltipWidth / 2;
    }

    this.graphTooltipEl.style.left = `${leftPos}px`;
    this.graphTooltipEl.style.top = '14px';
  }

  public setSoundEngine(soundEngine: SoundEngine): this {
    this.soundEngine = soundEngine;
    return this;
  }

  public togglePause(): this {
    this.onCanvasClick();
    return this;
  }

  public setPaused(paused: boolean): this {
    if (this.isPaused !== paused) {
      this.onCanvasClick();
    }
    return this;
  }

  public isGraphPaused(): boolean {
    return this.isPaused;
  }

  public setSampleInterval(ms: number): this {
    this.sampleInterval = Math.max(10, ms);
    return this;
  }

  public getSampleInterval(): number {
    return this.sampleInterval;
  }

  public override checkDirty(): void {
    this.checkVisibility();
    if (!this.targetObject || !this.property || this.isPaused) return;

    const current = this.targetObject[this.property];
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (now - this.lastSampleTime >= this.sampleInterval || current !== this.prevValue) {
      this.lastSampleTime = now;
      this.prevValue = current;
      this.update();
      this.triggerChange(current, this.prevValue as any);
    }
  }

  public setSmooth(smooth: boolean): this {
    this.smoothCurves = smooth;
    this.draw();
    return this;
  }

  public setFormat(fn: (val: number) => string): this {
    this.formatter = fn;
    this.updateStats();
    return this;
  }

  public setRange(min: number, max: number): this {
    this.min = min;
    this.max = max;
    this.autoRange = false;
    this.draw();
    return this;
  }

  public setAutoRange(enabled: boolean): this {
    this.autoRange = enabled;
    this.draw();
    return this;
  }

  public setColor(lineColor: string, fillColor?: string): this {
    this.primarySeries.color = lineColor;
    this.primarySeries.fillColor = fillColor || `${lineColor}33`;
    this.draw();
    return this;
  }

  public setBufferSize(size: number): this {
    this.bufferSize = Math.max(10, size);
    for (const s of this.seriesList) {
      while (s.buffer.length > this.bufferSize) {
        s.buffer.shift();
      }
    }
    this.draw();
    return this;
  }

  public setHeight(height: number): this {
    this.cssHeight = height;
    this.canvasContainer.style.height = `${height}px`;
    this.resizeCanvas();
    this.draw();
    return this;
  }

  public addSeries(id: string, options: GraphSeriesOptions): this {
    const series: GraphSeries = {
      id,
      label: options.label || id,
      color: options.color,
      fillColor: options.fillColor || `${options.color}33`,
      buffer: []
    };
    this.seriesList.push(series);
    this.seriesMap.set(id, series);

    this.updateLegend();
    this.draw();
    return this;
  }

  private updateLegend(): void {
    if (this.seriesList.length <= 1) {
      this.legendEl.style.display = 'none';
      return;
    }

    this.legendEl.style.display = 'flex';
    this.legendEl.innerHTML = '';

    for (const series of this.seriesList) {
      const item = document.createElement('div');
      item.className = 'relly-graph-legend-item';
      item.innerHTML = `
        <span class="relly-graph-legend-dot" style="background-color: ${series.color}"></span>
        <span class="relly-graph-legend-label">${series.label}</span>
      `;
      this.legendEl.appendChild(item);
    }
  }

  public push(val: number | Record<string, number>): this {
    if (this.isPaused) return this;

    if (typeof val === 'number') {
      if (isNaN(val) || !isFinite(val)) return this;
      this.primarySeries.buffer.push(val);
      if (this.primarySeries.buffer.length > this.bufferSize) {
        this.primarySeries.buffer.shift();
      }
    } else if (typeof val === 'object' && val !== null) {
      for (const [key, numVal] of Object.entries(val)) {
        if (typeof numVal === 'number' && !isNaN(numVal) && isFinite(numVal)) {
          this.pushSeries(key, numVal);
        }
      }
    }

    this.updateStats();
    this.draw();
    return this;
  }

  public pushSeries(id: string, val: number): this {
    if (this.isPaused) return this;
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return this;
    const series = this.seriesMap.get(id);
    if (!series) {
      this.addSeries(id, { color: '#ec4899', label: id });
      return this.pushSeries(id, val);
    }

    series.buffer.push(val);
    if (series.buffer.length > this.bufferSize) {
      series.buffer.shift();
    }
    return this;
  }

  private updateStats(): void {
    const latestVal =
      this.primarySeries.buffer.length > 0
        ? this.primarySeries.buffer[this.primarySeries.buffer.length - 1]
        : 0;

    let min = this.min;
    let max = this.max;

    let allVals: number[] = [];
    for (const s of this.seriesList) {
      allVals = allVals.concat(s.buffer);
    }

    if (allVals.length > 0) {
      min = Math.min(...allVals);
      max = Math.max(...allVals);
    }

    const pausedBadge = this.isPaused
      ? `<span class="relly-graph-badge relly-graph-badge--paused">PAUSED</span>`
      : '';

    this.statsEl.innerHTML = `
      ${pausedBadge}
      <span class="relly-graph-badge relly-graph-badge--min">min: ${this.formatter(min)}</span>
      <span class="relly-graph-badge relly-graph-badge--max">max: ${this.formatter(max)}</span>
      <span class="relly-graph-val">${this.formatter(latestVal)}</span>
    `;
  }

  public update(): this {
    const val = this.getValue();
    if (typeof val === 'number') {
      this.push(val);
    } else if (typeof val === 'object' && val !== null) {
      this.push(val as Record<string, number>);
    }

    // Auto-sample registered series from targetObject if available
    if (this.targetObject) {
      for (const series of this.seriesList) {
        if (series.id !== 'default' && typeof this.targetObject[series.id] === 'number') {
          this.pushSeries(series.id, this.targetObject[series.id]);
        }
      }
    }
    return this;
  }

  private draw(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const width = this.cssWidth;
    const height = this.cssHeight;

    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines (25%, 50%, 75%)
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let p of [0.25, 0.5, 0.75]) {
      const y = Math.round(height * p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Collect all values to calculate global bounds with generous headroom
    let allVals: number[] = [];
    for (const s of this.seriesList) {
      allVals = allVals.concat(s.buffer);
    }

    if (allVals.length === 0) return;

    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);

    let min = this.autoRange ? minVal : this.min;
    let max = this.autoRange ? maxVal : this.max;

    // Headroom protection: if actual values exceed max or min, expand range so it NEVER clips or flies off
    if (maxVal > max) max = maxVal;
    if (minVal < min) min = minVal;

    if (min === max) {
      min -= 1;
      max += 1;
    }

    // 16% top/bottom headroom padding so peak values don't touch the canvas ceiling
    const pad = (max - min) * 0.16 || 1;
    min -= pad;
    max += pad;

    const range = max - min || 1;
    const step = width / Math.max(1, this.bufferSize - 1);

    // Draw each series
    for (const series of this.seriesList) {
      if (series.buffer.length === 0) continue;

      const bufferToRender =
        series.buffer.length === 1 ? [series.buffer[0], series.buffer[0]] : series.buffer;
      const startIndex = this.bufferSize - bufferToRender.length;
      const points: Array<{ x: number; y: number }> = [];

      for (let i = 0; i < bufferToRender.length; i++) {
        const x = (startIndex + i) * step;
        const normalized = Math.max(0, Math.min(1, (bufferToRender[i] - min) / range));
        // Clamped y coordinate strictly between 4px and height - 4px
        const y = Math.max(4, Math.min(height - 4, height - 6 - normalized * (height - 12)));
        points.push({ x, y });
      }

      // Draw Gradient Area Fill
      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      ctx.lineTo(points[0].x, points[0].y);

      if (this.smoothCurves && points.length > 2) {
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const midX = (p0.x + p1.x) / 2;
          ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
        }
      } else {
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }

      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, series.fillColor || `${series.color}40`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Glowing Stroke Line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      if (this.smoothCurves && points.length > 2) {
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const midX = (p0.x + p1.x) / 2;
          ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
        }
      } else {
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }

      ctx.save();
      ctx.strokeStyle = series.color;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = series.color;
      ctx.shadowBlur = 5;
      ctx.stroke();
      ctx.restore();

      // Live Pulse Dot on the newest (rightmost) value
      const lastPoint = points[points.length - 1];
      if (lastPoint) {
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = series.color;
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    // Interactive Hover Crosshair
    if (this.hoverIndex !== null) {
      const crosshairX = Math.round(this.hoverIndex * step);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(crosshairX, 0);
      ctx.lineTo(crosshairX, height);
      ctx.stroke();
      ctx.restore();

      // Highlight point for each series at hover position
      for (const series of this.seriesList) {
        const startIndex = this.bufferSize - series.buffer.length;
        const bufIdx = this.hoverIndex - startIndex;
        if (bufIdx >= 0 && bufIdx < series.buffer.length) {
          const val = series.buffer[bufIdx];
          const normalized = Math.max(0, Math.min(1, (val - min) / range));
          const y = Math.max(4, Math.min(height - 4, height - 6 - normalized * (height - 12)));

          ctx.beginPath();
          ctx.arc(crosshairX, y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = series.color;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(crosshairX, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
    }
  }

  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.mediaQueryList) {
      this.mediaQueryList.removeEventListener('change', this.onResolutionChange);
      this.mediaQueryList = null;
    }
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    super.destroy();
  }
}
