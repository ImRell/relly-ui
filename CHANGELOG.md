# Changelog

All notable changes to `relly-ui` will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-29

### Added
- **Switch Component (`ui.addSwitch`)**: Cyberpunk / iOS animated sliding pill toggle with smooth spring physics, neon glow, and optional on/off labels.
- **Button Group Component (`ui.addButtonGroup`)**: Compact horizontal action button group in a single row (`primary`, `danger`, and standard buttons).
- **Text Input Component (`ui.addText` / `ui.addInput`)**: Full-featured string input with live updates, validation, optional ✕ clear button, and placeholder support.
- **Progress Bar / Meter (`ui.addProgress`)**: Smoothly animated glowing telemetry meter with customizable min/max, custom formatters, and gradient fill.
- **Separator Component (`ui.addSeparator`)**: Clean horizontal divider line with optional centered uppercase title or dashed style.
- **Direct Editable HEX Input in ColorPicker**: Color codes can now be typed or pasted directly (e.g., `#FF0055`) with instant state synchronization.

---

## [1.0.2] - 2026-10-29

### Fixed
- **Mini-HUD Sparkline Over-speed**: Throttled sparkline generation from 60–144 Hz down to a smooth ~5.5 Hz (`180ms` cadence) with 20 data points.
- **Active Telemetry Mirroring**: Mini-HUD sparkline now automatically mirrors real telemetry data from active `Graph` instances.
- **Jog-Dial Step Quantization**: Fixed floating-point drift on integer sliders (`step: 1` no longer produces decimals).
- **Hotkey Registration**: Dynamic hotkey configuration (`ui.setHotkey`) now functions even if initialized with `hotkey: null`.
- **Search Auto-Tab Switch**: SearchBar now automatically switches to the first tab containing search query matches.
- **Secondary Series Redraw**: `Graph.pushSeries()` now triggers an immediate redraw and stats refresh.

---

## [1.0.1] - 2026-10-29

### Fixed
- **Context Menu Target Reference**: Fixed issue where `this.hide()` wiped `currentComponent` before executing menu actions.
- **Missing Favicon Warning**: Added inline SVG favicon to playground demo to resolve browser console 404 warnings.

---

## [1.0.0] - 2026-10-29

### Initial Release
- **Zero Runtime Dependencies**: Ultra-lightweight footprint (~22 KB gzipped).
- **100% Shadow DOM Isolation**: Complete CSS encapsulation protecting against host page style bleeding.
- **Next-Gen Telemetry Graph**: Canvas HUD graph with Bezier curves, multi-series support, crosshair inspector, and click-to-pause inspection.
- **Core Component Suite**: `Slider`, `Point2D`, `Point3D / Vector3`, `RangeSlider`, `Segmented`, `ColorPicker`, `Checkbox`, `Button`, `Select`, `DynamicLabel`, `StatusIndicator`.
- **Containers**: `Tab`, `TabsManager`, `Section` (with accordion mode), `Row`.
- **Features**: 8 built-in themes, Web Audio micro-sounds (4 sound packs), Draggable, Resizable with magnetic edge snapping, Mini-HUD pill mode, Ghost mode, JSON export/import modal, and localStorage `autoSave`.
