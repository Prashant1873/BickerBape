# Phase 7: Apple Fluid Animation & Motion Engine - Research

**Researched:** 2026-10-12
**Status:** Complete

## Technical Analysis

### 1. Apple HIG Spring Physics Curves
Apple's interface motion language relies on critically damped springs where overshoot is zero (`bounce: 0`), preventing wobble or nausea while ensuring immediate physical response.
In CSS bezier parameters:
- **Critically Damped Settling (`damping: 1.0`)**: `cubic-bezier(0.16, 1, 0.3, 1)` (Apple's fluid ease-out curve).
- **Asymmetric Timing Principle**: Entrances take 300ms–350ms to allow visual orientation; exits take 180ms–220ms to yield user focus back to the primary workspace instantly.

### 2. Composited GPU Transform Pipelines
To ensure steady 60fps/120fps motion on ProMotion mobile screens without triggering CPU layout reflows:
- Use only `transform` (`translate3d`, `scale`) and `opacity`.
- Mark animated containers with `will-change: transform, opacity`.
- Clean up `will-change` on idle where applicable, or keep it scoped to active modal shells.

### 3. Responsive Drawer Sheet Behavior
- On desktop ($\ge 640\text{px}$): Slide-in from right via `transform: translateX(0)` from `translateX(100%)`.
- On mobile ($< 640\text{px}$): Slide-up from bottom via `transform: translateY(0)` from `translateY(100%)`.
- Backdrop: Fade-in backdrop blur with `backdrop-filter: blur(12px)` and opacity ramp from 0 to 1.

### 4. Reduced-Motion Invariants
Per WCAG 2.2 criteria, when `@media (prefers-reduced-motion: reduce)` is active:
- Replace spatial slide translations with simple opacity fades (`duration: 150ms`).
- Suppress scaling effects to prevent vestibular disorientation.
