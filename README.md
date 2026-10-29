# relly-ui 🎛️

> **Senior-grade, zero-dependency, ultra-performant GUI control panel library for JavaScript & TypeScript.**  
> Built for creative coders, WebGL/WebGPU developers, canvas simulations, game tools, and runtime debugging. Features complete Shadow DOM style isolation, seamless CDN `<script>` support, interactive Web Audio feedback, and a Fluent chaining API.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)
[![Tests Passing](https://img.shields.io/badge/tests-81%2F81%20passed-success.svg)](tests/)
[![TypeScript Ready](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](tsconfig.json)
[![Bundle Size](https://img.shields.io/badge/bundle-24KB%20gzip-purple.svg)](dist/)

---

## 🌟 Key Features

- 📦 **Zero Runtime Dependencies** — 0 external packages. Ultra-lightweight footprint (~22 KB gzipped).
- 🛡️ **100% Shadow DOM Isolation** — Host page styles (Tailwind, Bootstrap, CSS resets) can never bleed in or break the GUI layout.
- 🌐 **CDN-First & IIFE Ready** — Importable via a single `<script>` tag: exposes `window.RellyUI` and auto-injects required styles.
- 📈 **Next-Gen Telemetry HUD Graph** — Canvas time-series with smooth cubic Bezier curves, glowing gradients, multi-series support (`addSeries`), live pulse dot, hover crosshair inspector, click-to-pause inspection, and continuous timeline scrolling without freezing.
- 🎚️ **Rich Component Suite**:
  - `Slider` — Numeric slider with virtual jog-dial scrubbing (`Shift` ×10 / `Alt` ×0.1 modifiers) and direct text editing.
  - `Switch` — Cyberpunk / iOS animated sliding pill toggle with optional on/off labels.
  - `ButtonGroup` — Compact horizontal action button group in a single row.
  - `TextInput` — Text string input with optional clear button, placeholder, and max length.
  - `Progress` — Animated glowing telemetry progress bar / meter.
  - `Separator` — Clean divider line with optional uppercase centered title.
  - `Point2D` & `Point3D / Vector3` — 2D and 3D vectors with color-coded RGB axes (X — red, Y — green, Z — blue) and drag scrubbing.
  - `RangeSlider` — Dual-handle interval slider `[min, max]` with draggable range bar and dual inputs.
  - `Segmented` — Fast single-click mode switcher with an animated sliding pill indicator.
  - `ColorPicker` — Color preview with editable HEX text input, quick swatches, and native EyeDropper API.
  - `StatusIndicator` — Live pulsing LED status indicator with badge (`online`, `busy`, `offline`, `info`, `ready`).
  - `Checkbox`, `Button`, `Select`, `DynamicLabel`.
- 🎨 **8 Designer Themes** — `dark`, `light`, `tokyo-night`, `matrix`, `synthwave`, `cyberpunk`, `nord`, `dracula`, plus custom theme object support.
- 🔊 **Web Audio Sound FX (4 Sound Packs)** — Synthetic interface micro-sounds without external audio assets (`synth`, `mechanical`, `bubble`, `arcade`) with volume control.
- 💾 **Session AutoSave (`autoSave: true`)** — Automatic debounced persistence and restoration of component values, panel layout, collapsed state, and theme to `localStorage`.
- 📋 **Custom Context Menu (`setContextMenu`)** — UI creators configure custom right-click actions per control (reset to default, copy value, custom actions).
- 🔔 **In-Panel Toast Notifications (`ui.notify`)** — Non-blocking notification stack (`success`, `warning`, `error`, `info`) with smooth animations and audio chime.
- ⤢ **Mini-HUD Mode** — Instant floating pill mode with a live sparkline canvas, toggled by double-clicking the header or pressing `⤢`.
- 🔍 **Real-Time Search Bar** — Filter components instantly with `/` shortcut and robust keyboard event isolation.
- 📥 **JSON Presets Import/Export** — Modal dialog with Drag & Drop `.json` file parsing, syntax validation, and clipboard export.
- 🔀 **Conditional Visibility (`showIf`)** — Dynamically show/hide controls and entire sections using boolean predicates.
- 🪟 **Draggable & Resizable** — Fluid header dragging, corner resize handle, and viewport boundary protection against clipping during browser zoom.

---

## 🚀 Quick Start

### 1. Direct CDN / Browser `<script>`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>RellyUI Demo</title>
</head>
<body>
  <script src="https://unpkg.com/relly-ui/dist/relly-ui.iife.js"></script>
  <script>
    const state = {
      speed: 1.5,
      mode: 'solid',
      color: '#6366f1',
      vector: { x: 0, y: 10, z: -5 },
      bounds: [10, 80],
      active: true
    };

    const ui = new RellyUI({
      title: 'Simulation Controls',
      theme: 'tokyo-night',
      soundPack: 'mechanical',
      autoSave: true,
      searchBar: true
    });

    ui.addSlider(state, 'speed', { min: 0, max: 10, step: 0.1 })
      .setLabel('Speed');

    ui.addSegmented(state, 'mode', ['wireframe', 'solid', 'points'])
      .setLabel('Render Mode');

    ui.addPoint3D(state, 'vector', { min: -20, max: 20 })
      .setLabel('Wind Vector');

    ui.addRange(state, 'bounds', { min: 0, max: 100 })
      .setLabel('Clipping Range');

    ui.addColor(state, 'color')
      .setLabel('Primary Color')
      .setSwatches(['#6366f1', '#00ff66', '#00f0ff', '#ff71ce', '#f59e0b']);
  </script>
</body>
</html>
```

### 2. Modern ESM / npm

```bash
npm install relly-ui
```

```typescript
import { RellyUI } from 'relly-ui';

const state = { fps: 60, particles: 200 };

const ui = new RellyUI({
  title: 'Engine HUD',
  theme: 'matrix',
  autoSave: true
});

ui.addGraph(state, 'fps')
  .setLabel('Telemetry')
  .setColor('#00ff66');
```

---

## 📖 Component API Reference

| Method | Description | Supported Data Types |
|---|---|---|
| `ui.addSlider(obj, prop, opts)` | Slider with mouse jog-dial scrubbing | `number` |
| `ui.addSwitch(obj, prop, opts)` | Cyberpunk / iOS animated sliding pill toggle | `boolean` |
| `ui.addButtonGroup(buttons)` | Multi-button action group in a single row | Array of button definitions |
| `ui.addText(obj, prop, opts)` | String input with clear button & validation | `string` |
| `ui.addProgress(obj, prop, opts)`| Animated glowing telemetry progress meter | `number` |
| `ui.addSeparator(title?, dashed?)`| Clean divider line with optional title | None / Layout |
| `ui.addPoint2D(obj, prop, opts)` | 2D vector with X and Y drag scrubbing | `{x, y}` or `[x, y]` |
| `ui.addPoint3D(obj, prop, opts)` | 3D vector with color-coded RGB axes | `{x, y, z}` or `[x, y, z]` |
| `ui.addRange(obj, prop, opts)` | Dual-handle range slider `[min, max]` | `[min, max]` or `{min, max}` |
| `ui.addSegmented(obj, prop, opts)`| Segmented button group switcher | `string`, `number` |
| `ui.addColor(obj, prop)` | Color picker with editable HEX, swatches & EyeDropper | `string` (HEX/RGB) |
| `ui.addCheckbox(obj, prop)` | Boolean toggle checkbox | `boolean` |
| `ui.addSelect(obj, prop, options)`| Dropdown selection menu | Array or Record |
| `ui.addGraph(obj, prop)` | Time-series telemetry canvas with Bezier curve | `number` |
| `ui.addStatus(obj, prop, status)` | Pulsing animated LED status indicator | `online`, `busy`, `offline`, `info`, `ready` |
| `ui.addDynamicLabel(obj, prop)` | Reactive text readout | `any` |
| `ui.addButton(label, onClick)` | Action push button | Callback function |
| `ui.addTab(title)` | Multi-tab container | Returns `Tab` container |
| `ui.addSection(title, collapsed)` | Collapsible section / folder | Returns `Section` container |
| `ui.addRow()` | Multi-column inline layout row | Returns `Row` container |

### Advanced Features & Interactions:

- **Custom Context Menu**:
  ```typescript
  const speed = ui.addSlider(state, 'speed', { min: 0, max: 10 });
  speed.setContextMenu([
    { label: 'Reset to Default (1.0)', action: (c) => c.reset() },
    { label: 'Copy Value', action: (c) => navigator.clipboard.writeText(c.getValue()) },
    { separator: true, label: '' },
    { label: 'Turbo Mode (10.0)', danger: true, action: (c) => c.setValue(10) }
  ]);
  ```

- **In-Panel Toast Notifications**:
  ```typescript
  ui.notify('Configuration saved!', 'success');
  ui.notify('High memory usage detected', 'warning');
  ```

- **Runtime Themes & Sound Packs**:
  ```typescript
  ui.setTheme('tokyo-night'); // 'dark' | 'light' | 'tokyo-night' | 'matrix' | 'synthwave' | 'cyberpunk' | 'nord' | 'dracula'
  ui.setSoundPack('mechanical'); // 'synth' | 'mechanical' | 'bubble' | 'arcade'
  ui.setSoundVolume(0.8);
  ```

---

## 🛠 Development & Testing

```bash
# Launch interactive playground dev server
npm run dev

# Run Vitest test suite (67 tests)
npm run test

# Run TypeScript typecheck (0 errors)
npm run typecheck

# Build all production targets (ESM, IIFE, UMD, CSS, .d.ts)
npm run build
```

---

## 📄 License

MIT License © 2026 Rell
