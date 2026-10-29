import './styles/index.css';
import { RellyUI } from './RellyUI';
import { Checkbox } from './components/Checkbox/Checkbox';
import { Slider } from './components/Slider/Slider';
import { Button } from './components/Button/Button';
import { Select } from './components/Select/Select';
import { DynamicLabel } from './components/DynamicLabel/DynamicLabel';
import { Graph } from './components/Graph/Graph';
import { ColorPicker } from './components/ColorPicker/ColorPicker';
import { Point2D } from './components/Point2D/Point2D';
import { Point3D } from './components/Point3D/Point3D';
import { RangeSlider } from './components/Range/RangeSlider';
import { Segmented } from './components/Segmented/Segmented';
import { StatusIndicator } from './components/Status/StatusIndicator';
import { Switch } from './components/Switch/Switch';
import { ButtonGroup } from './components/ButtonGroup/ButtonGroup';
import { TextInput } from './components/TextInput/TextInput';
import { Progress } from './components/Progress/Progress';
import { Separator } from './components/Separator/Separator';
import { Section } from './components/Section/Section';
import { Row } from './components/Row/Row';
import { Tab } from './components/Tabs/Tab';
import { TabsManager } from './components/Tabs/TabsManager';
import { BaseComponent } from './core/BaseComponent';
import { BindingEngine } from './core/BindingEngine';
import { PresetManager } from './core/PresetManager';
import {
  ThemeManager,
  DARK_THEME,
  LIGHT_THEME,
  CYBERPUNK_THEME,
  NORD_THEME,
  DRACULA_THEME,
  TOKYO_NIGHT_THEME,
  MATRIX_THEME,
  SYNTHWAVE_THEME
} from './core/ThemeManager';
import { Draggable } from './core/Draggable';
import { Resizable } from './core/Resizable';
import { HotkeyManager } from './core/HotkeyManager';
import { SearchBar } from './core/SearchBar';
import { SoundEngine } from './core/SoundEngine';
import { ImportModal } from './core/ImportModal';
import { ToastManager } from './core/ToastManager';
import { ContextMenuManager } from './core/ContextMenuManager';
import { SchemaLoader } from './core/SchemaLoader';
import { ContainerHelper } from './core/ComponentContainer';

// Attach static members to RellyUI class for convenient access via RellyUI.*
Object.assign(RellyUI, {
  Checkbox,
  Slider,
  Button,
  Select,
  DynamicLabel,
  Graph,
  ColorPicker,
  Point2D,
  Point3D,
  RangeSlider,
  Segmented,
  StatusIndicator,
  Switch,
  ButtonGroup,
  TextInput,
  Progress,
  Separator,
  Section,
  Row,
  Tab,
  TabsManager,
  BaseComponent,
  BindingEngine,
  PresetManager,
  ThemeManager,
  DARK_THEME,
  LIGHT_THEME,
  CYBERPUNK_THEME,
  NORD_THEME,
  DRACULA_THEME,
  TOKYO_NIGHT_THEME,
  MATRIX_THEME,
  SYNTHWAVE_THEME,
  Draggable,
  Resizable,
  HotkeyManager,
  SearchBar,
  SoundEngine,
  ImportModal,
  ToastManager,
  ContextMenuManager,
  SchemaLoader,
  ContainerHelper,
  RellyUI
});

// Named exports for modern ESM imports
export {
  RellyUI,
  Checkbox,
  Slider,
  Button,
  Select,
  DynamicLabel,
  Graph,
  ColorPicker,
  Point2D,
  Point3D,
  RangeSlider,
  Segmented,
  StatusIndicator,
  Switch,
  ButtonGroup,
  TextInput,
  Progress,
  Separator,
  Section,
  Row,
  Tab,
  TabsManager,
  BaseComponent,
  BindingEngine,
  PresetManager,
  ThemeManager,
  DARK_THEME,
  LIGHT_THEME,
  CYBERPUNK_THEME,
  NORD_THEME,
  DRACULA_THEME,
  TOKYO_NIGHT_THEME,
  MATRIX_THEME,
  SYNTHWAVE_THEME,
  Draggable,
  Resizable,
  HotkeyManager,
  SearchBar,
  SoundEngine,
  ImportModal,
  ToastManager,
  ContextMenuManager,
  SchemaLoader,
  ContainerHelper
};

export * from './types';

// Browser global attachment for direct <script src="...">
if (typeof window !== 'undefined') {
  (window as any).RellyUI = RellyUI;
}

// Default export is the RellyUI constructor
export default RellyUI;
