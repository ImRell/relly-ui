export interface RellyTheme {
  bg: string;
  fg: string;
  headerBg: string;
  headerFg: string;
  accent: string;
  accentHover: string;
  border: string;
  inputBg: string;
  inputHover: string;
  radius: string;
  font: string;
  fontSize: string;
  rowHeight: string;
}

export type ThemePreset =
  | 'dark'
  | 'light'
  | 'cyberpunk'
  | 'nord'
  | 'dracula'
  | 'tokyo-night'
  | 'matrix'
  | 'synthwave';

export type SoundPack = 'synth' | 'mechanical' | 'bubble' | 'arcade';
export type ThemeInput = ThemePreset | Partial<RellyTheme>;

export interface SearchOptions {
  ignoreCase?: boolean;
  placeholder?: string;
}

export interface RellyUIOptions {
  /**
   * Title shown in the panel header. Defaults to 'RellyUI'.
   */
  title?: string;

  /**
   * Target DOM container. If omitted, appends to document.body as a floating panel.
   */
  container?: HTMLElement | string;

  /**
   * Whether to encapsulate the panel and styles inside Shadow DOM (100% style isolation).
   * Defaults to true.
   */
  shadowDOM?: boolean;

  /**
   * Whether to display a real-time search bar to filter components.
   * Defaults to false.
   */
  searchBar?: boolean;

  /**
   * Search configuration options.
   */
  searchOptions?: SearchOptions;

  /**
   * Width of the panel in pixels or CSS string. Defaults to 280.
   */
  width?: number | string;

  /**
   * Height of the panel in pixels or CSS string. Defaults to auto.
   */
  height?: number | string;

  /**
   * Whether the panel is resizable via bottom-right drag handle.
   * Defaults to true.
   */
  resizable?: boolean;

  /**
   * Whether subtle Web Audio micro-sound effects are enabled.
   * Defaults to true.
   */
  sound?: boolean;

  /**
   * Sound pack profile ('synth' | 'mechanical' | 'bubble' | 'arcade').
   * Defaults to 'synth'.
   */
  soundPack?: SoundPack;

  /**
   * Automatically persist component values and panel layout/position to localStorage.
   * Defaults to false.
   */
  autoSave?: boolean;

  /**
   * localStorage key for autoSave. Defaults to 'relly-ui-session'.
   */
  autoSaveKey?: string;

  /**
   * Master volume for synthetic sound effects (0.0 to 1.0).
   * Defaults to 1.0.
   */
  soundVolume?: number;

  /**
   * Ghost mode: panel fades to semi-transparent when cursor is idle outside panel.
   * Defaults to false.
   */
  ghostOnIdle?: boolean;

  /**
   * Idle opacity when ghostOnIdle is true (0.1 to 1.0). Defaults to 0.38.
   */
  idleOpacity?: number;

  /**
   * Accordion mode: expanding one section automatically collapses sibling sections.
   * Defaults to false.
   */
  accordion?: boolean;

  /**
   * Whether the panel starts collapsed. Defaults to false.
   */
  collapsed?: boolean;

  /**
   * Keyboard code to toggle panel visibility. Defaults to 'KeyH'. Set null or empty string to disable.
   */
  hotkey?: string | null;

  /**
   * Theme configuration or preset name ('dark' | 'light' | 'cyberpunk' | 'nord' | 'dracula').
   */
  theme?: ThemeInput;

  /**
   * Whether to automatically inject CSS styles. Defaults to true.
   */
  autoInjectStyles?: boolean;

  /**
   * Initial floating position.
   */
  position?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };

  /**
   * Allow moving the panel via drag-and-drop. Defaults to true.
   */
  draggable?: boolean;
}

export type OnChangeCallback<T = any> = (value: T, prevValue: T) => void;
export type OnClickCallback = (event: MouseEvent) => void;
export type ConditionPredicate = () => boolean;

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: (component?: any) => void;
  danger?: boolean;
  separator?: boolean;
  disabled?: boolean;
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface IBaseComponent<T = any> {
  element: HTMLElement;
  setLabel(label: string): this;
  getLabel(): string;
  setTooltip(text: string): this;
  getTooltip(): string | undefined;
  setDisabled(disabled: boolean): this;
  isDisabled(): boolean;
  showIf(predicate: ConditionPredicate): this;
  setContextMenu(items: ContextMenuItem[]): this;
  getContextMenu(): ContextMenuItem[] | undefined;
  setValue(value: T): this;
  getValue(): T;
  onChange(callback: OnChangeCallback<T>): this;
  listen(): this;
  update(): this;
  destroy(): void;
}

export type ComponentType =
  | 'checkbox'
  | 'slider'
  | 'button'
  | 'select'
  | 'dynamicLabel'
  | 'graph'
  | 'color'
  | 'point2d'
  | 'point3d'
  | 'vector3'
  | 'range'
  | 'segmented'
  | 'status'
  | 'section'
  | 'folder'
  | 'row';

export interface Point2DOptions {
  min?: number;
  max?: number;
  step?: number;
}

export interface Point3DOptions {
  min?: number;
  max?: number;
  step?: number;
}

export type Point3DVal =
  | [number, number, number]
  | { x: number; y: number; z: number };

export interface RangeOptions {
  min?: number;
  max?: number;
  step?: number;
  format?: (min: number, max: number) => string;
}

export type RangeVal = [number, number] | { min: number; max: number };

export interface SegmentedOptions {
  options: string[] | number[] | Record<string, any>;
}

export type StatusType = 'online' | 'busy' | 'offline' | 'info' | 'ready';

export interface StatusOptions {
  badge?: string;
  detail?: string;
}

export interface GraphSeriesOptions {
  label?: string;
  color: string;
  fillColor?: string;
}

export interface GraphOptions {
  min?: number;
  max?: number;
  autoRange?: boolean;
  color?: string;
  fillColor?: string;
  bufferSize?: number;
  height?: number;
  smooth?: boolean;
  sampleInterval?: number;
  format?: (value: number) => string;
}

export interface ComponentFactoryOptions {
  type: ComponentType;
  label?: string;
  object?: any;
  property?: string;
  // Slider / Point2D options
  min?: number;
  max?: number;
  step?: number;
  // Select options
  options?: string[] | number[] | Record<string, any>;
  // Button options
  onClick?: OnClickCallback;
  // Callbacks
  onChange?: OnChangeCallback;
  onToggle?: OnChangeCallback;
  // DynamicLabel
  format?: (value: any) => string;
  // Color options
  swatches?: string[];
  // Graph options
  color?: string;
  fillColor?: string;
  range?: [number, number];
  bufferSize?: number;
  // Section options
  collapsed?: boolean;
  // Tooltip & Context Menu
  tooltip?: string;
  contextMenu?: ContextMenuItem[];
  // Conditional visibility
  showIf?: ConditionPredicate;
  disabled?: boolean;
  // Status options
  status?: StatusType;
  badge?: string;
  detail?: string;
  // General
  listen?: boolean;
}

export interface SchemaControl extends ComponentFactoryOptions {
  children?: SchemaControl[];
}

export interface SchemaDefinition {
  title?: string;
  target?: any;
  controls: SchemaControl[];
}
