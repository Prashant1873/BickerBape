---
phase: 9
slug: comprehensive-ui-ux-craft-overhaul-and-anti-slop-audit
status: draft
nyquist_compliant: true
wave_0_complete: false
created: '2026-10-12'
---

# Phase 9 — Validation Strategy: Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.0.3 |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run typecheck; npm test` |
| **Estimated runtime** | ~3.5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run typecheck; npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|--------|
| 09-01-01 | 01 | 1 | UX-01, UX-02 | Cognitive chunking & chrome distillation | unit/DOM | `npm test src/lib/__tests__/ui-ux-audit.test.ts` | ⬜ pending |
| 09-01-02 | 01 | 1 | UX-01, UX-02 | Sub-400ms filter responsiveness & no duplicate controls | integration | `npm run typecheck; npm test` | ⬜ pending |
| 09-02-01 | 02 | 2 | UX-03 | Typography scale & baseline rhythm adherence | unit/DOM | `npm test src/lib/__tests__/ui-ux-audit.test.ts` | ⬜ pending |
| 09-02-02 | 02 | 2 | UX-03 | Complete anti-slop regression pass | integration | `npm run typecheck; npm test` | ⬜ pending |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Viewport Responsiveness | UX-03 | Visual layout validation on mobile (375px) vs desktop (1440px) | Resize viewport in DevTools and inspect card padding and sticky table headers |
| Cognitive Category Chunking | UX-01 | Visual scannability and categorization ergonomics | Verify Core vs Thematic vs Tax groups scan cleanly in sidebar |

---

## Validation Sign-Off

- [x] All tasks have automated verification
- [x] Sampling continuity maintained
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-12
