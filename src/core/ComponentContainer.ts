import { Checkbox } from '../components/Checkbox/Checkbox';
import { Slider } from '../components/Slider/Slider';
import { Button } from '../components/Button/Button';
import { Select } from '../components/Select/Select';
import { DynamicLabel } from '../components/DynamicLabel/DynamicLabel';
import { Graph } from '../components/Graph/Graph';
import { ColorPicker } from '../components/ColorPicker/ColorPicker';
import { Point2D } from '../components/Point2D/Point2D';
import { Point3D } from '../components/Point3D/Point3D';
import { RangeSlider } from '../components/Range/RangeSlider';
import { Segmented } from '../components/Segmented/Segmented';
import { StatusIndicator } from '../components/Status/StatusIndicator';
import { BindingEngine, Listenable } from './BindingEngine';
import { PresetManager } from './PresetManager';
import { SoundEngine } from './SoundEngine';
import {
  ComponentFactoryOptions,
  ConditionPredicate,
  OnClickCallback,
  Point2DOptions,
  Point3DOptions,
  RangeOptions,
  StatusType
} from '../types';
import { BaseComponent } from './BaseComponent';

export interface IComponentContainer {
  getContentElement(): HTMLElement;
  getBindingEngine(): BindingEngine;
  getPresetManager(): PresetManager;
}

export abstract class ContainerHelper {
  protected children: Array<BaseComponent | { destroy(): void }> = [];
  protected accordion: boolean = false;

  constructor(
    protected contentEl: HTMLElement,
    protected bindingEngine: BindingEngine,
    protected presetManager: PresetManager,
    protected soundEngine?: SoundEngine
  ) {}

  public setAccordion(enabled: boolean): this {
    this.accordion = enabled;
    return this;
  }

  public isAccordion(): boolean {
    return this.accordion;
  }

  public onSectionExpanded(expandedSection: Section): void {
    if (!this.accordion) return;
    for (const child of this.children) {
      if (child instanceof Section && child !== expandedSection) {
        child.setCollapsed(true);
      }
    }
  }

  public addCheckbox(targetOrOptions: any, property?: string): Checkbox {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new Checkbox(
        label,
        opts.object,
        opts.property,
        this.bindingEngine,
        this.presetManager,
        this.soundEngine
      );
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.onChange || opts.onToggle) comp.onChange(opts.onChange || opts.onToggle);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new Checkbox(
      label,
      targetOrOptions,
      property!,
      this.bindingEngine,
      this.presetManager,
      this.soundEngine
    );
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createCheckbox(targetOrOptions: any, property?: string): Checkbox {
    return this.addCheckbox(targetOrOptions, property);
  }

  public addSlider(targetOrOptions: any, property?: string): Slider {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new Slider(
        label,
        opts.object,
        opts.property,
        this.bindingEngine,
        this.presetManager,
        this.soundEngine
      );
      if (opts.min !== undefined) comp.setMin(opts.min);
      if (opts.max !== undefined) comp.setMax(opts.max);
      if (opts.step !== undefined) comp.setStep(opts.step);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.onChange) comp.onChange(opts.onChange);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new Slider(
      label,
      targetOrOptions,
      property!,
      this.bindingEngine,
      this.presetManager,
      this.soundEngine
    );
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createSlider(targetOrOptions: any, property?: string): Slider {
    return this.addSlider(targetOrOptions, property);
  }

  public addButton(
    labelOrOptions: string | { label?: string; onClick?: OnClickCallback; tooltip?: string; showIf?: ConditionPredicate },
    onClick?: OnClickCallback
  ): Button {
    if (typeof labelOrOptions === 'object' && labelOrOptions !== null) {
      const opts = labelOrOptions;
      const label = opts.label || 'Button';
      const comp = new Button(label, opts.onClick || onClick, this.soundEngine);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const comp = new Button(labelOrOptions, onClick, this.soundEngine);
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createButton(
    labelOrOptions: string | { label?: string; onClick?: OnClickCallback; tooltip?: string; showIf?: ConditionPredicate },
    onClick?: OnClickCallback
  ): Button {
    return this.addButton(labelOrOptions, onClick);
  }

  public addSelect(targetOrOptions: any, property?: string, options?: any): Select {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new Select(label, opts.object, opts.property, opts.options, this.bindingEngine, this.presetManager);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.onChange) comp.onChange(opts.onChange);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new Select(
      label,
      targetOrOptions,
      property!,
      options,
      this.bindingEngine,
      this.presetManager
    );
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createSelect(targetOrOptions: any, property?: string, options?: any): Select {
    return this.addSelect(targetOrOptions, property, options);
  }

  public addDynamicLabel(targetOrOptions: any, property?: string): DynamicLabel {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new DynamicLabel(label, opts.object, opts.property, this.bindingEngine);
      if (opts.format) comp.setFormat(opts.format);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new DynamicLabel(label, targetOrOptions, property!, this.bindingEngine);
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createDynamicLabel(targetOrOptions: any, property?: string): DynamicLabel {
    return this.addDynamicLabel(targetOrOptions, property);
  }

  public addGraph(targetOrOptions: any, property?: string): Graph {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new Graph(label, opts.object, opts.property, this.bindingEngine, this.soundEngine);
      if (opts.range) comp.setRange(opts.range[0], opts.range[1]);
      if (opts.color) comp.setColor(opts.color, opts.fillColor);
      if (opts.bufferSize) comp.setBufferSize(opts.bufferSize);
      if (opts.smooth !== undefined) comp.setSmooth(opts.smooth);
      if (opts.height) comp.setHeight(opts.height);
      if (opts.format) comp.setFormat(opts.format);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new Graph(label, targetOrOptions, property!, this.bindingEngine, this.soundEngine);
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createGraph(targetOrOptions: any, property?: string): Graph {
    return this.addGraph(targetOrOptions, property);
  }

  public addFPSGraph(label: string = 'FPS'): Graph {
    const tracker = { fps: 60 };
    let frames = 0;
    let prevTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let animId: number;

    const loop = (now: number) => {
      frames++;
      if (now >= prevTime + 1000) {
        tracker.fps = Math.round((frames * 1000) / (now - prevTime));
        frames = 0;
        prevTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      animId = requestAnimationFrame(loop);
    }

    const graph = this.addGraph(tracker, 'fps')
      .setLabel(label)
      .setRange(0, 120)
      .setColor('#22c55e', 'rgba(34, 197, 94, 0.25)')
      .setFormat((v) => `${Math.round(v)} FPS`);

    const origDestroy = graph.destroy.bind(graph);
    graph.destroy = () => {
      if (typeof cancelAnimationFrame !== 'undefined' && animId) {
        cancelAnimationFrame(animId);
      }
      origDestroy();
    };

    return graph;
  }

  public createFPSGraph(label: string = 'FPS'): Graph {
    return this.addFPSGraph(label);
  }

  public addMemoryGraph(label: string = 'Memory'): Graph {
    const tracker = { mem: 0 };
    let intervalId: any;

    const updateMem = () => {
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const used = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
        tracker.mem = Number(used.toFixed(1));
      } else {
        // Fallback smooth representation
        tracker.mem = Number((Math.sin(Date.now() / 2500) * 8 + 48).toFixed(1));
      }
    };

    updateMem();
    if (typeof setInterval !== 'undefined') {
      intervalId = setInterval(updateMem, 1000);
    }

    const graph = this.addGraph(tracker, 'mem')
      .setLabel(label)
      .setAutoRange(true)
      .setColor('#a855f7', 'rgba(168, 85, 247, 0.25)')
      .setFormat((v) => `${v.toFixed(1)} MB`);

    const origDestroy = graph.destroy.bind(graph);
    graph.destroy = () => {
      if (intervalId) clearInterval(intervalId);
      origDestroy();
    };

    return graph;
  }

  public createMemoryGraph(label: string = 'Memory'): Graph {
    return this.addMemoryGraph(label);
  }

  public addColor(targetOrOptions: any, property?: string): ColorPicker {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new ColorPicker(
        label,
        opts.object,
        opts.property,
        this.bindingEngine,
        this.presetManager,
        this.soundEngine
      );
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.swatches) comp.setSwatches(opts.swatches);
      if (opts.onChange) comp.onChange(opts.onChange);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new ColorPicker(
      label,
      targetOrOptions,
      property!,
      this.bindingEngine,
      this.presetManager,
      this.soundEngine
    );
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createColor(targetOrOptions: any, property?: string): ColorPicker {
    return this.addColor(targetOrOptions, property);
  }

  public addPoint2D(targetOrOptions: any, property?: string, options?: Point2DOptions): Point2D {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new Point2D(label, opts.object, opts.property, this.bindingEngine, this.presetManager);
      if (opts.min !== undefined) comp.setMin(opts.min);
      if (opts.max !== undefined) comp.setMax(opts.max);
      if (opts.step !== undefined) comp.setStep(opts.step);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.onChange) comp.onChange(opts.onChange);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new Point2D(label, targetOrOptions, property!, this.bindingEngine, this.presetManager);
    if (options?.min !== undefined) comp.setMin(options.min);
    if (options?.max !== undefined) comp.setMax(options.max);
    if (options?.step !== undefined) comp.setStep(options.step);
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createPoint2D(targetOrOptions: any, property?: string, options?: Point2DOptions): Point2D {
    return this.addPoint2D(targetOrOptions, property, options);
  }

  public addPoint3D(targetOrOptions: any, property?: string, options?: Point3DOptions): Point3D {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new Point3D(label, opts.object, opts.property, this.bindingEngine, this.presetManager);
      if (opts.min !== undefined) comp.setMin(opts.min);
      if (opts.max !== undefined) comp.setMax(opts.max);
      if (opts.step !== undefined) comp.setStep(opts.step);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.contextMenu) comp.setContextMenu(opts.contextMenu);
      if (opts.onChange) comp.onChange(opts.onChange);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new Point3D(label, targetOrOptions, property!, this.bindingEngine, this.presetManager);
    if (options?.min !== undefined) comp.setMin(options.min);
    if (options?.max !== undefined) comp.setMax(options.max);
    if (options?.step !== undefined) comp.setStep(options.step);
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createPoint3D(targetOrOptions: any, property?: string, options?: Point3DOptions): Point3D {
    return this.addPoint3D(targetOrOptions, property, options);
  }

  public addVector3(targetOrOptions: any, property?: string, options?: Point3DOptions): Point3D {
    return this.addPoint3D(targetOrOptions, property, options);
  }

  public createVector3(targetOrOptions: any, property?: string, options?: Point3DOptions): Point3D {
    return this.addPoint3D(targetOrOptions, property, options);
  }

  public addRange(targetOrOptions: any, property?: string, options?: RangeOptions): RangeSlider {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new RangeSlider(
        label,
        opts.object,
        opts.property,
        this.bindingEngine,
        this.presetManager,
        this.soundEngine
      );
      if (opts.min !== undefined) comp.setMin(opts.min);
      if (opts.max !== undefined) comp.setMax(opts.max);
      if (opts.step !== undefined) comp.setStep(opts.step);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.contextMenu) comp.setContextMenu(opts.contextMenu);
      if (opts.onChange) comp.onChange(opts.onChange);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new RangeSlider(
      label,
      targetOrOptions,
      property!,
      this.bindingEngine,
      this.presetManager,
      this.soundEngine
    );
    if (options?.min !== undefined) comp.setMin(options.min);
    if (options?.max !== undefined) comp.setMax(options.max);
    if (options?.step !== undefined) comp.setStep(options.step);
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createRange(targetOrOptions: any, property?: string, options?: RangeOptions): RangeSlider {
    return this.addRange(targetOrOptions, property, options);
  }

  public addSegmented(
    targetOrOptions: any,
    property?: string,
    options?: string[] | number[] | Record<string, any>
  ): Segmented {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new Segmented(
        label,
        opts.object,
        opts.property,
        opts.options || [],
        this.bindingEngine,
        this.presetManager,
        this.soundEngine
      );
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.contextMenu) comp.setContextMenu(opts.contextMenu);
      if (opts.onChange) comp.onChange(opts.onChange);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property ? (property.charAt(0).toUpperCase() + property.slice(1)) : '';
    const comp = new Segmented(
      label,
      targetOrOptions,
      property!,
      options || [],
      this.bindingEngine,
      this.presetManager,
      this.soundEngine
    );
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createSegmented(
    targetOrOptions: any,
    property?: string,
    options?: string[] | number[] | Record<string, any>
  ): Segmented {
    return this.addSegmented(targetOrOptions, property, options);
  }

  public addStatus(
    targetOrOptions: any,
    property?: string,
    initialStatus: StatusType = 'online',
    badge?: string,
    detail?: string
  ): StatusIndicator {
    if (
      typeof targetOrOptions === 'object' &&
      targetOrOptions !== null &&
      property === undefined &&
      'object' in targetOrOptions &&
      'property' in targetOrOptions
    ) {
      const opts = targetOrOptions;
      const label = opts.label || (opts.property.charAt(0).toUpperCase() + opts.property.slice(1));
      const comp = new StatusIndicator(
        label,
        opts.object,
        opts.property,
        this.bindingEngine
      );
      if (opts.status) comp.setStatus(opts.status, opts.badge, opts.detail);
      if (opts.badge) comp.setBadge(opts.badge);
      if (opts.detail) comp.setDetail(opts.detail);
      if (opts.tooltip) comp.setTooltip(opts.tooltip);
      if (opts.contextMenu) comp.setContextMenu(opts.contextMenu);
      if (opts.listen) comp.listen();
      if (opts.showIf) comp.showIf(opts.showIf);
      this.contentEl.appendChild(comp.element);
      this.children.push(comp);
      return comp;
    }

    const label = property
      ? (property.charAt(0).toUpperCase() + property.slice(1))
      : (typeof targetOrOptions === 'string' ? targetOrOptions : 'Status');

    const targetObj = typeof targetOrOptions === 'string' ? undefined : targetOrOptions;
    const propName = typeof targetOrOptions === 'string' ? undefined : property;

    const comp = new StatusIndicator(
      label,
      targetObj,
      propName,
      this.bindingEngine
    );
    comp.setStatus(initialStatus, badge, detail);
    this.contentEl.appendChild(comp.element);
    this.children.push(comp);
    return comp;
  }

  public createStatus(
    targetOrOptions: any,
    property?: string,
    initialStatus: StatusType = 'online',
    badge?: string,
    detail?: string
  ): StatusIndicator {
    return this.addStatus(targetOrOptions, property, initialStatus, badge, detail);
  }

  public addRow(): Row {
    const row = new Row(this.bindingEngine, this.presetManager, this.soundEngine);
    this.contentEl.appendChild(row.element);
    this.children.push(row);
    return row;
  }

  public createRow(): Row {
    return this.addRow();
  }

  public addSection(
    labelOrOptions: string | { label?: string; title?: string; collapsed?: boolean } = 'Section',
    collapsed: boolean = false
  ): Section {
    let label = '';
    let isCollapsed = collapsed;
    if (typeof labelOrOptions === 'object' && labelOrOptions !== null) {
      label = labelOrOptions.label || labelOrOptions.title || 'Section';
      if (labelOrOptions.collapsed !== undefined) {
        isCollapsed = labelOrOptions.collapsed;
      }
    } else {
      label = labelOrOptions || 'Section';
    }
    const section = new Section(label, this.bindingEngine, this.presetManager, isCollapsed, this.soundEngine);
    section.setParentContainer(this);
    this.contentEl.appendChild(section.element);
    this.children.push(section);
    return section;
  }

  public addFolder(
    labelOrOptions: string | { label?: string; title?: string; collapsed?: boolean } = 'Folder',
    collapsed: boolean = false
  ): Section {
    return this.addSection(labelOrOptions, collapsed);
  }

  public createSection(
    labelOrOptions: string | { label?: string; title?: string; collapsed?: boolean } = 'Section',
    collapsed: boolean = false
  ): Section {
    return this.addSection(labelOrOptions, collapsed);
  }

  public createFolder(
    labelOrOptions: string | { label?: string; title?: string; collapsed?: boolean } = 'Folder',
    collapsed: boolean = false
  ): Section {
    return this.addSection(labelOrOptions, collapsed);
  }

  public createComponent(options: ComponentFactoryOptions): any {
    let comp: any;
    const label = options.label || (options.property ? options.property : options.type);

    switch (options.type) {
      case 'checkbox':
        comp = this.addCheckbox(options.object, options.property!);
        break;
      case 'slider': {
        const slider = this.addSlider(options.object, options.property!);
        if (options.min !== undefined) slider.setMin(options.min);
        if (options.max !== undefined) slider.setMax(options.max);
        if (options.step !== undefined) slider.setStep(options.step);
        comp = slider;
        break;
      }
      case 'button':
        comp = this.addButton(label, options.onClick);
        break;
      case 'select':
        comp = this.addSelect(options.object, options.property!, options.options);
        break;
      case 'dynamicLabel': {
        const dyn = this.addDynamicLabel(options.object, options.property!);
        if (options.format) dyn.setFormat(options.format);
        comp = dyn;
        break;
      }
      case 'graph': {
        const graph = this.addGraph(options.object, options.property!);
        if (options.range) graph.setRange(options.range[0], options.range[1]);
        if (options.color) graph.setColor(options.color, options.fillColor);
        if (options.bufferSize) graph.setBufferSize(options.bufferSize);
        comp = graph;
        break;
      }
      case 'color': {
        const colorComp = this.addColor(options.object, options.property!);
        if (options.swatches) colorComp.setSwatches(options.swatches);
        comp = colorComp;
        break;
      }
      case 'point2d': {
        const p2d = this.addPoint2D(options.object, options.property!);
        if (options.min !== undefined) p2d.setMin(options.min);
        if (options.max !== undefined) p2d.setMax(options.max);
        if (options.step !== undefined) p2d.setStep(options.step);
        comp = p2d;
        break;
      }
      case 'point3d':
      case 'vector3': {
        const p3d = this.addPoint3D(options.object, options.property!);
        if (options.min !== undefined) p3d.setMin(options.min);
        if (options.max !== undefined) p3d.setMax(options.max);
        if (options.step !== undefined) p3d.setStep(options.step);
        comp = p3d;
        break;
      }
      case 'range': {
        const range = this.addRange(options.object, options.property!);
        if (options.min !== undefined) range.setMin(options.min);
        if (options.max !== undefined) range.setMax(options.max);
        if (options.step !== undefined) range.setStep(options.step);
        comp = range;
        break;
      }
      case 'segmented': {
        const seg = this.addSegmented(options.object, options.property!, options.options);
        comp = seg;
        break;
      }
      case 'status': {
        const stat = this.addStatus(options.object, options.property!, options.status, options.badge, options.detail);
        comp = stat;
        break;
      }
      case 'section':
      case 'folder': {
        comp = this.addSection(label, options.collapsed || false);
        break;
      }
      default:
        throw new Error(`[RellyUI] Unknown component type: ${(options as any).type}`);
    }

    if (label && comp.setLabel) {
      comp.setLabel(label);
    }
    if (options.tooltip && comp.setTooltip) {
      comp.setTooltip(options.tooltip);
    }
    if (options.contextMenu && comp.setContextMenu) {
      comp.setContextMenu(options.contextMenu);
    }
    if ((options.onChange || options.onToggle) && comp.onChange) {
      comp.onChange(options.onChange || options.onToggle);
    }
    if (options.listen && comp.listen) {
      comp.listen();
    }
    if (options.showIf && comp.showIf) {
      comp.showIf(options.showIf);
    }
    if (options.disabled && comp.setDisabled) {
      comp.setDisabled(true);
    }

    return comp;
  }

  public destroyChildren(): void {
    for (const child of this.children) {
      child.destroy();
    }
    this.children = [];
  }
}

export class Row extends ContainerHelper {
  public element: HTMLElement;
  protected disabled: boolean = false;

  constructor(bindingEngine: BindingEngine, presetManager: PresetManager, soundEngine?: SoundEngine) {
    const rowEl = document.createElement('div');
    rowEl.className = 'relly-multi-row';
    super(rowEl, bindingEngine, presetManager, soundEngine);
    this.element = rowEl;
  }

  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    if (this.disabled) {
      this.element.classList.add('relly-disabled');
    } else {
      this.element.classList.remove('relly-disabled');
    }
    return this;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  public destroy(): void {
    this.destroyChildren();
    this.element.remove();
  }
}

export class Section extends ContainerHelper implements Listenable {
  public element: HTMLElement;
  private headerEl: HTMLElement;
  private titleEl: HTMLElement;
  private arrowEl: HTMLElement;
  private isCollapsed: boolean = false;
  private conditionPredicate?: ConditionPredicate;
  protected parentContainer?: ContainerHelper;
  protected disabled: boolean = false;

  constructor(
    private label: string,
    bindingEngine: BindingEngine,
    presetManager: PresetManager,
    initialCollapsed: boolean = false,
    soundEngine?: SoundEngine
  ) {
    const content = document.createElement('div');
    content.className = 'relly-section-content';
    super(content, bindingEngine, presetManager, soundEngine);

    this.element = document.createElement('div');
    this.element.className = 'relly-section';

    this.headerEl = document.createElement('div');
    this.headerEl.className = 'relly-section-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'relly-section-title-wrap';

    this.arrowEl = document.createElement('span');
    this.arrowEl.innerHTML = `
      <svg class="relly-section-arrow" viewBox="0 0 10 10">
        <polygon points="2,1 8,5 2,9"></polygon>
      </svg>
    `;

    this.titleEl = document.createElement('span');
    this.titleEl.textContent = label;

    titleWrap.appendChild(this.arrowEl);
    titleWrap.appendChild(this.titleEl);
    this.headerEl.appendChild(titleWrap);

    this.element.appendChild(this.headerEl);
    this.element.appendChild(this.contentEl);

    this.headerEl.addEventListener('click', () => {
      if (this.disabled) return;
      this.soundEngine?.playClick();
      this.toggle();
    });

    if (initialCollapsed) {
      this.setCollapsed(true);
    }
  }

  public setParentContainer(parent: ContainerHelper): this {
    this.parentContainer = parent;
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    if (this.disabled) {
      this.element.classList.add('relly-disabled');
    } else {
      this.element.classList.remove('relly-disabled');
    }
    return this;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  public setLabel(label: string): this {
    this.label = label;
    this.titleEl.textContent = label;
    return this;
  }

  public getLabel(): string {
    return this.label;
  }

  public toggle(): this {
    return this.setCollapsed(!this.isCollapsed);
  }

  public setCollapsed(collapsed: boolean): this {
    this.isCollapsed = collapsed;
    if (this.isCollapsed) {
      this.element.classList.add('relly-section--collapsed');
    } else {
      this.element.classList.remove('relly-section--collapsed');
      if (this.parentContainer) {
        this.parentContainer.onSectionExpanded(this);
      }
    }
    return this;
  }

  public showIf(predicate: ConditionPredicate): this {
    this.conditionPredicate = predicate;
    this.checkVisibility();
    this.bindingEngine.register(this);
    return this;
  }

  public checkVisibility(): boolean {
    if (!this.conditionPredicate) return true;
    const isVisible = this.conditionPredicate();
    this.element.style.display = isVisible ? '' : 'none';
    return isVisible;
  }

  public checkDirty(): void {
    this.checkVisibility();
  }

  public destroy(): void {
    if (this.conditionPredicate) {
      this.bindingEngine.unregister(this);
    }
    this.destroyChildren();
    this.element.remove();
  }
}
