/**
 * BickerBape Apple Fluid Motion Engine
 * Implements WWDC Fluid Interface principles:
 * - Instant response on pointer-down (kill latency)
 * - Direct manipulation (1:1 tracking with grab offset)
 * - Interruptibility (animations can be grabbed mid-flight)
 * - Momentum projection (exponential decay flick physics)
 * - Rubber-banding at boundaries
 */

export class FluidMotion {
  /**
   * Exponential momentum projection formula from Apple's Designing Fluid Interfaces
   * @param {number} velocity px/second
   * @param {number} decelerationRate default 0.996
   * @returns {number} projected distance in px
   */
  static project(velocity, decelerationRate = 0.996) {
    return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
  }

  /**
   * Apple rubberband resistance curve for dragging past bounds
   * @param {number} overshoot Distance dragged past bound
   * @param {number} dimension Viewport/element size
   * @param {number} constant Default 0.55
   * @returns {number}
   */
  static rubberband(overshoot, dimension, constant = 0.55) {
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  }

  /**
   * Attaches direct-manipulation drag-to-dismiss gesture to the drawer/sheet
   * @param {HTMLElement} drawerElement 
   * @param {HTMLElement} grabHandle 
   * @param {Function} onDismiss Callback when dismissed
   */
  static attachDrawerGestures(drawerElement, grabHandle, onDismiss) {
    if (!drawerElement || !grabHandle) return;

    let isDragging = false;
    let startCoord = 0;
    let currentCoord = 0;
    let history = []; // [{ time, coord }]
    const isMobile = window.innerWidth <= 768;

    const onPointerDown = (e) => {
      // Allow drag on grab handle or top header of drawer
      if (!e.target.closest('.grab-handle') && !e.target.closest('.drawer-header')) return;
      
      isDragging = true;
      grabHandle.setPointerCapture(e.pointerId);
      startCoord = isMobile ? e.clientY : e.clientX;
      currentCoord = startCoord;
      history = [{ time: performance.now(), coord: startCoord }];
      
      drawerElement.style.transition = 'none'; // direct 1:1 tracking
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      currentCoord = isMobile ? e.clientY : e.clientX;
      const now = performance.now();
      history.push({ time: now, coord: currentCoord });
      if (history.length > 6) history.shift();

      let delta = currentCoord - startCoord;
      
      // On mobile: dragging down dismisses. On desktop: dragging right dismisses.
      if (delta < 0) {
        // Dragging in reverse -> apply rubber-band resistance
        const dimension = isMobile ? window.innerHeight : window.innerWidth;
        delta = -FluidMotion.rubberband(Math.abs(delta), dimension, 0.4);
      }

      if (isMobile) {
        drawerElement.style.transform = `translateY(${Math.max(0, delta)}px)`;
      } else {
        drawerElement.style.transform = `translateX(${Math.max(0, delta)}px)`;
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        grabHandle.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // Calculate release velocity (px/sec)
      let velocity = 0;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const timeDelta = (last.time - first.time) / 1000;
        if (timeDelta > 0) {
          velocity = (last.coord - first.coord) / timeDelta;
        }
      }

      const delta = currentCoord - startCoord;
      const projectedDistance = delta + FluidMotion.project(velocity);
      const threshold = isMobile ? 120 : 150;

      drawerElement.style.transition = 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)';

      // If projected endpoint crosses threshold or high positive velocity flick -> dismiss!
      if (projectedDistance > threshold || velocity > 450) {
        if (isMobile) {
          drawerElement.style.transform = 'translateY(100%)';
        } else {
          drawerElement.style.transform = 'translateX(100%)';
        }
        setTimeout(() => {
          if (onDismiss) onDismiss();
        }, 280);
      } else {
        // Snap back home
        if (isMobile) {
          drawerElement.style.transform = 'translateY(0%)';
        } else {
          drawerElement.style.transform = 'translateX(0%)';
        }
      }
    };

    grabHandle.addEventListener('pointerdown', onPointerDown);
    grabHandle.addEventListener('pointermove', onPointerMove);
    grabHandle.addEventListener('pointerup', onPointerUp);
    grabHandle.addEventListener('pointercancel', onPointerUp);
  }
}
