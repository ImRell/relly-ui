# Changelog

All notable changes to `relly-ui` will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.2] - 2026-10-30

### Added
- **Custom Vector Stepper Arrows**: Replaced native browser spin buttons on `Point2D` and `Point3D` with sleek embedded SVG stepper buttons (`▲` / `▼`) supporting single clicks, smooth repeat-on-hold, and tactile tick audio.
- **Mouse Wheel Scrubbing on Vectors, Sliders & Ranges**: Scrolling over coordinate cells, slider boxes, and range min/max inputs smoothly increments/decrements values with modifier key support (`Shift` for 10x, `Alt` for 0.1x) and acoustic feedback.
- **GPU-Accelerated Mini-HUD Morph & Expansion Animations**: Added smooth springy morph animation (`@keyframes relly-minihud-shrink` and `relly-minihud-expand`) when collapsing and expanding the panel, complete with staggered content slide-in.

### Fixed & Improved
- **Centered Value Display**: All input boxes across all components (`RangeSlider`, `Slider`, `Point2D`, `Point3D`, `Progress`, `ColorPicker`, `DynamicLabel`) now have cleanly centered values (`text-align: center`).
- **Wider RangeSlider Input Boxes**: Increased width from `38px` to `48px` (`min-width: 48px; box-sizing: border-box;`), preventing decimals from getting truncated.
- **Immediate Header Double-Click on Mousedown**: Double-click minimization/expansion now triggers instantly on the second `mousedown` instead of waiting for `mouseup`, eliminating accidental minimizes when dragging.
- **Zero-Drift Header Expansion**: Fixed X-axis rightward position shift when expanding from Mini-HUD by making drag coordinate conversion trigger only upon actual drag movement and keeping unscaled layout anchoring.

---

## [1.1.1] - 2026-10-30

### Added
- **Panel Open Audio Feedback**: Added `SoundEngine.playPanelOpen()` with distinct sound signatures across all 4 sound packs (`synth`, `mechanical`, `bubble`, `arcade`), automatically triggered when opening or revealing the panel.
- **Select Option Audio Feedback**: Added `SoundEngine.playSelect()` providing tactile confirmation clicks whenever a user selects a dropdown option.
- **Header Close Button (`✕`)**: Replaced previous minimize (`_`) button with a clean `✕` button (`.relly-close-btn`). Panel hides gracefully and reopens at any time using the configured hotkey (e.g. `H`).

### Changed & Fixed
- **Smoothed Range & Slider Audio**: Eliminated ear-piercing sound spam during rapid scrubbing. Lowered tick frequencies to warm 240–480 Hz tactile dial clicks, reduced gain, added a 45ms audio-level cooldown, and throttled mouse-drag ticks on `RangeSlider` and `Slider` to 60ms intervals.
- **Universal Outline Elimination**: Stripped default browser focus rings and outlines across all interactive elements (`.relly-btn`, `.relly-btn--group`, `.relly-header-btn`, `.relly-tab-btn`, `.relly-range-input`, `.relly-point3d-input`, selects, and text inputs).

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
