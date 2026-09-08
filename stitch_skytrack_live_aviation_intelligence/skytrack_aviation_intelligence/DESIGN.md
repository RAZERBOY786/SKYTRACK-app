---
name: Skytrack Aviation Intelligence
colors:
  surface: '#0a1422'
  surface-dim: '#0a1422'
  surface-bright: '#303a49'
  surface-container-lowest: '#050e1c'
  surface-container-low: '#121c2a'
  surface-container: '#16202f'
  surface-container-high: '#212a39'
  surface-container-highest: '#2c3545'
  on-surface: '#d9e3f7'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#d9e3f7'
  inverse-on-surface: '#273140'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#52e87c'
  on-tertiary: '#003915'
  tertiary-container: '#2ccb63'
  on-tertiary-container: '#004f20'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#0a1422'
  on-background: '#d9e3f7'
  surface-variant: '#2c3545'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.03em
  metric-label:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  telemetry-data:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.05em
  code-pill:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-xxs: 2px
  space-xs: 4px
  space-sm: 8px
  space-md: 12px
  space-lg: 16px
  space-xl: 20px
  space-2xl: 24px
  space-3xl: 32px
  gutter-mobile: 8px
  gutter-desktop: 16px
  panel-padding-compact: 10px
  panel-padding-standard: 16px
---

## Brand & Style

The design system embodies the precision, high-tempo vigilance, and analytical clarity of an advanced aerospace operations center. Designed for flight dispatchers, aviation analysts, and air traffic operations leads, the interface evokes total situational control, zero-latency feedback, and tactical authority. 

The aesthetic is **Tactical Glassmorphic HUD** fused with **High-Density Technical Minimalism**. Key visual attributes include:
- Deep oceanic nocturnal substrates punctuated by electric photon-blue illumination.
- Translucent aerospace heads-up display (HUD) panels with hairline precision borders.
- Live telemetry streams that prioritize immediate scanability, zero visual clutter, and strict hierarchical separation between static controls and real-time transponder streams.
- Subtle radar-sweep line motifs, status-driven optical glows, and compact grid arrangements calibrated for mission-critical monitoring.

## Colors

The color architecture is built exclusively for a dark-room operations environment, maximizing optical contrast while minimizing retinal fatigue during extended observation shifts.

### Functional Palette Matrix
- **Substrate Deep Navy (`#07111F` / `#0A1625`)**: The core infinite canvas and map backdrop.
- **Surface Elevation Layers**:
  - `panel-base`: `#0D1B2A` (Backdrop for fixed instrument racks).
  - `panel-elevated`: `#12263A` (Interactive cards, popovers, and telemetry panels).
  - `panel-glass`: `rgba(13, 27, 42, 0.75)` with backdrop-filter blur.
- **Accents & Telemetry Primary**:
  - `primary-cyan`: `#38BDF8` (Active radar vectors, selected tracks, focus indicators).
  - `secondary-cyan`: `#06B6D4` (Secondary telemetry channels, sub-system states).
- **Tactical Status Tokens**:
  - `status-live-emerald`: `#22C55E` (Nominal operation, active squawk, on-schedule routes).
  - `status-alert-amber`: `#F59E0B` (Squawk 7700 standby, weather vectors, holding patterns).
  - `status-critical-red`: `#EF4444` (Collision warning, emergency squawk, trajectory conflict).
- **Borders & Structural Lines**:
  - `border-subtle`: `#1E3A52` (Structural partitions, data tables).
  - `border-active`: `rgba(56, 189, 248, 0.45)` (Active focus frames and selected aircraft tracks).
- **Text & Readouts**:
  - `text-bright`: `#F8FAFC` (Critical callouts, ICAO identifiers, primary values).
  - `text-telemetry`: `#94A3B8` (Labels, metadata, units of measurement, inactive flags).

## Typography

The type system pairs **Space Grotesk** for architectural framing, headers, and operational sectors, **Inter** for dense contextual notes and incident logs, and **JetBrains Mono** for all coordinates, squawk codes, barometric pressure readouts, ground speeds, and altitude bands.

### Application Rules
- All numeric readouts, timestamps (UTC / Zulu), vector degrees, and flight coordinates must strictly utilize `JetBrains Mono` with tabular numbers enabled (`tnum`) to eliminate layout jitter during high-frequency data refresh cycles.
- Labels for technical readouts must be styled in uppercase using `telemetry-data` with tracking (`letter-spacing: 0.05em`) to emphasize instrument readability.
- Operational callouts (FL380, MACH .82, SQUAWK 7700) must consistently render with higher optical weights than their respective contextual labels.

## Layout & Spacing

The layout is built around high-density data display, utilizing a tight base-4 spacing scale.

### Grid & Viewport Model
- **Mobile (< 768px):** A single-column primary canvas with bottom-sheet tactical overlays. Bottom telemetry sheets collapse to a compact 64px persistent flight monitor ticker, expandable to 45% or 90% viewport height via vertical swipes.
- **Tablet (768px – 1024px):** Dual split-view. A 65% interactive radar/chart surface accompanied by a 35% side drawer for live tail telemetry and sector feeds.
- **Desktop (> 1024px):** 12-column dynamic command grid. Central interactive canvas (8 columns) pinned between a left navigation/filter strip (1 column collapsed, 2 columns expanded) and a right diagnostic telemetry rack (3 columns).

Padding within telemetry modules is kept compact (8px to 12px) to maximize real-estate efficiency. Airspace metrics must never sacrifice density for arbitrary negative space.

## Elevation & Depth

Visual hierarchy is maintained through **tactical glassmorphic layers**, **1px crisp perimeter borders**, and **luminescent status backlights** rather than traditional drop shadows.

1. **Floor (Layer 0):** Background vector map surface `#07111F` overlaid with low-contrast latitude/longitude graticules (`rgba(30, 58, 82, 0.4)`).
2. **Backdrop Panels (Layer 1):** Floating instrument containers with `background: rgba(13, 27, 42, 0.85)`, `backdrop-filter: blur(12px)`, and a structural border `1px solid #1E3A52`.
3. **Focused Modules & Cards (Layer 2):** Elevated operational state with `background: rgba(18, 38, 58, 0.95)`, `border: 1px solid rgba(56, 189, 248, 0.4)`, and a subtle ambient outer glow: `box-shadow: 0 0 16px -2px rgba(56, 189, 248, 0.15)`.
4. **Alert & Tactical Overlays (Layer 3):** Highest modal priority. Glowing 1px border colored according to state (Emerald `#22C55E`, Amber `#F59E0B`, or Red `#EF4444`) with an assertive localized drop glow: `0 0 24px -4px rgba(239, 68, 68, 0.3)`.

## Shapes

The interface embraces a **Soft Angular / Technical Instrument** geometry (`roundedness: 1`). Radii are deliberately constrained to maintain the aesthetic of military and commercial aerospace hardware avionics.

- Base containers, data tables, and telemetry boxes utilize `0.25rem` (`4px`) corner radii.
- Interactive controls, primary buttons, and floating toolbars use `0.375rem` (`6px`) up to `0.5rem` (`8px`) for `rounded-lg`.
- **Status Pills and Live Beacons:** Completely rounded (`9999px` pill shapes) to provide immediate organic contrast against rigid structural grids.
- Internal telemetry chips and tag nodes feature chamfered-style crisp edges to sustain an authentic flight-deck digital display identity.

## Components

### Buttons & Tactical Triggers
- **Primary Flight Action:** Solid electric blue background (`#38BDF8`), text in `#07111F` (ultra-dark navy for maximum legibility), font weight 600. Hover introduces a high-intensity cyan illumination `box-shadow: 0 0 12px rgba(56, 189, 248, 0.5)`.
- **Secondary / HUD Button:** Translucent `#12263A` background, 1px border in `#1E3A52`, text in `#F8FAFC`. On hover, the border transitions to `#38BDF8` with text illuminated to match.
- **Critical Command (Abort / Ground):** Crimson outline button (`border: 1px solid #EF4444`, text: `#EF4444`, background: `rgba(239, 68, 68, 0.1)`).

### Status Pills & Beacon Indicators
- Compact height (20px to 24px), monospaced typography (`code-pill`).
- Enclosing a continuous 6px circular dot featuring an animated radial pulse ring (CSS ping animation) signaling active live transponder reception (`#22C55E` for regular streaming, `#F59E0B` for signal degraded, `#EF4444` for transponder failure/emergency).

### Telemetry Cards & Flight Data Strips
- Constructed with a top header row displaying tail number and aircraft ICAO class, followed by a segmented 3-column data grid: `ALT` (Altitude in ft), `SPD` (Ground speed in kts), `V/S` (Vertical speed in ft/min).
- Background: `rgba(13, 27, 42, 0.85)`. Border: 1px solid `#1E3A52`. Left edge contains an active 3px vertical status stripe representing route condition.

### Input & Search Fields
- Airport/Tail Search Inputs: Dark background (`#0A1625`), 1px structural border `#1E3A52`, typography `JetBrains Mono` 13px. Focus transforms border to electric sky blue (`#38BDF8`) with an inner inset glow `rgba(56, 189, 248, 0.1)`. Clear icon and tactical shortcut badges (`CMD + K`) rendered in `#94A3B8`.

### Checkboxes & Segmented Filters
- Precision toggle boxes with a 1px border, filled with cyan checkmark icons when active.
- Segmented band selectors (e.g., Altitude filters: `LOW`, `MID`, `HIGH`, `SUPER`) styled as an interconnected, segmented instrument switch. Active segment is filled with `#1E3A52` and highlighted with a glowing sky-blue bottom underline.