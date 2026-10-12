# Phase 6: Buttons & Interactive Controls Modernization - Research

**Researched:** 2026-10-11
**Status:** Complete

## Technical Analysis

### 1. Concentric Corner Radii Geometry
The human eye perceives nested rectangles with identical border-radii as "pinched" or sloppy at the corners. To produce an organic nested curvature, the inner radius must match:
$$r_{inner} = \max(0, r_{outer} - \text{padding})$$

In our Tailwind structure:
- `p-1` is 4px.
- `rounded-2xl` is 16px. Inner child with `p-1` must be $16 - 4 = 12\text{px}$ (`rounded-xl`).
- `rounded-xl` is 12px. Inner child with `p-1` must be $12 - 4 = 8\text{px}$ (`rounded-lg`).
- `rounded-lg` is 8px. Inner child with `p-1` must be $8 - 4 = 4\text{px}$ (`rounded`).
- If padding is 8px (`p-2`) and outer is `rounded-2xl` (16px), inner child must be $16 - 8 = 8\text{px}$ (`rounded-lg`).

### 2. Sub-Pixel Optical Icon Centering
When rendering glyphs next to text, icon bounding boxes center to the em-box rather than the font cap-height. Applying:
```css
.material-symbols-outlined,
.optical-icon {
  transform: translateY(-0.5px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```
eliminates the perceived 1px sag of icons next to bold uppercase labels.

### 3. Tactile Active Feedback Physics
Replacing uniform `transform: scale(0.97)` with elastomeric Poisson volume deformation:
```css
.touch-spring, button, .strategy-chip, .btn-tactile {
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.18s ease,
              background-color 0.15s ease,
              border-color 0.15s ease;
  will-change: transform;
}

.touch-spring:active, button:active, .strategy-chip:active, .btn-tactile:active {
  transform: scale(1.02, 0.95);
  transition: transform 70ms cubic-bezier(0.1, 0.9, 0.2, 1);
}
```
And adding high-contrast `:focus-visible` rings:
```css
button:focus-visible, a:focus-visible, input:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 4. Sliding Rails for Switchers
For the Investor Mood 3-way switcher and the Mode switcher in `Navbar.tsx`, we can use an animated sliding pill backdrop or CSS transition with spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) so changes feel fluid and alive.
