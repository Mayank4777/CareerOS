# Design Tokens

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the global design tokens for CareerOS.

Design tokens are the single source of truth for colors, typography, spacing, sizing, elevation, motion, and other visual properties.

Every frontend component should consume these tokens instead of hardcoded values.

---

# Design Philosophy

CareerOS follows a token-driven design system.

Benefits:

- Consistent UI
- Easier theming
- Faster development
- Better AI-generated code
- Simplified maintenance
- Scalable branding

---

# Color Tokens

## Brand

| Token | Value |
|--------|--------|
| color-brand-50 | #EFF6FF |
| color-brand-100 | #DBEAFE |
| color-brand-200 | #BFDBFE |
| color-brand-300 | #93C5FD |
| color-brand-400 | #60A5FA |
| color-brand-500 | #2563EB |
| color-brand-600 | #1D4ED8 |
| color-brand-700 | #1E40AF |
| color-brand-800 | #1E3A8A |
| color-brand-900 | #172554 |

---

## Neutral

| Token | Value |
|--------|--------|
| color-neutral-0 | #FFFFFF |
| color-neutral-50 | #FAFAFA |
| color-neutral-100 | #F3F4F6 |
| color-neutral-200 | #E5E7EB |
| color-neutral-300 | #D1D5DB |
| color-neutral-400 | #9CA3AF |
| color-neutral-500 | #6B7280 |
| color-neutral-600 | #4B5563 |
| color-neutral-700 | #374151 |
| color-neutral-800 | #1F2937 |
| color-neutral-900 | #111827 |

---

## Semantic

### Success

| Token | Value |
|--------|--------|
| color-success | #16A34A |

### Warning

| Token | Value |
|--------|--------|
| color-warning | #D97706 |

### Danger

| Token | Value |
|--------|--------|
| color-danger | #DC2626 |

### Info

| Token | Value |
|--------|--------|
| color-info | #0284C7 |

---

# Background Tokens

| Token | Light | Dark |
|--------|--------|--------|
| bg-app | #FAFAFA | #111827 |
| bg-surface | #FFFFFF | #1F2937 |
| bg-card | #FFFFFF | #1F2937 |
| bg-sidebar | #FFFFFF | #0F172A |
| bg-hover | #F3F4F6 | #374151 |

---

# Text Tokens

| Token | Light | Dark |
|--------|--------|--------|
| text-primary | #111827 | #F9FAFB |
| text-secondary | #6B7280 | #9CA3AF |
| text-muted | #9CA3AF | #6B7280 |
| text-inverse | #FFFFFF | #111827 |

---

# Border Tokens

| Token | Light | Dark |
|--------|--------|--------|
| border-default | #E5E7EB | #374151 |
| border-hover | #D1D5DB | #4B5563 |
| border-focus | #2563EB | #2563EB |

---

# Typography Tokens

## Font Family

```
font-primary = Inter
font-mono = JetBrains Mono
font-fallback = system-ui, sans-serif
```

---

## Font Sizes

| Token | Size |
|--------|------|
| text-xs | 12px |
| text-sm | 14px |
| text-base | 16px |
| text-lg | 18px |
| text-xl | 20px |
| text-2xl | 24px |
| text-3xl | 30px |
| text-4xl | 36px |
| text-5xl | 48px |

---

## Font Weight

| Token | Value |
|--------|------|
| font-regular | 400 |
| font-medium | 500 |
| font-semibold | 600 |
| font-bold | 700 |

---

## Line Heights

| Token | Value |
|--------|------|
| leading-tight | 1.25 |
| leading-normal | 1.5 |
| leading-relaxed | 1.75 |

---

# Spacing Tokens

CareerOS follows an 8px spacing system.

| Token | Value |
|--------|------|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-5 | 20px |
| space-6 | 24px |
| space-8 | 32px |
| space-10 | 40px |
| space-12 | 48px |
| space-16 | 64px |

---

# Radius Tokens

| Token | Value |
|--------|------|
| radius-sm | 4px |
| radius-md | 8px |
| radius-lg | 12px |
| radius-xl | 16px |
| radius-full | 999px |

---

# Shadow Tokens

| Token | Value |
|--------|--------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) |
| shadow-md | 0 4px 8px rgba(0,0,0,0.08) |
| shadow-lg | 0 8px 16px rgba(0,0,0,0.10) |

Avoid heavy shadows.

---

# Opacity Tokens

| Token | Value |
|--------|------|
| opacity-disabled | 0.50 |
| opacity-muted | 0.70 |
| opacity-overlay | 0.80 |

---

# Motion Tokens

## Duration

| Token | Value |
|--------|------|
| duration-fast | 150ms |
| duration-normal | 250ms |
| duration-slow | 350ms |

---

## Easing

```
ease-standard = ease-in-out

ease-enter = ease-out

ease-exit = ease-in
```

Animations should be subtle and purposeful.

---

# Z-Index Tokens

| Token | Value |
|--------|------|
| z-base | 1 |
| z-dropdown | 100 |
| z-sticky | 200 |
| z-fixed | 300 |
| z-modal | 400 |
| z-toast | 500 |
| z-tooltip | 600 |

---

# Icon Tokens

Default:

20px

Small:

16px

Large:

24px

Stroke:

2px

Library:

Lucide Icons

---

# Layout Tokens

## Sidebar Width

```
280px
```

Collapsed

```
80px
```

---

## Navbar Height

```
64px
```

---

## Container Width

```
1440px
```

---

## Content Padding

```
24px
```

---

# Table Tokens

Header Height

```
48px
```

Row Height

```
44px
```

Cell Padding

```
16px
```

Border

```
1px
```

---

# Form Tokens

Input Height

```
40px
```

Textarea Minimum Height

```
120px
```

Button Height

```
40px
```

---

# Breakpoints

| Token | Width |
|--------|--------|
| mobile | 0px |
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

Desktop-first remains the primary target.

---

# Accessibility Tokens

Minimum touch target:

```
40px
```

Focus Ring

```
2px solid color-brand-500
```

Minimum contrast:

WCAG 2.2 AA

---

# Token Usage Rules

Always:

- Use semantic tokens instead of raw hex values.
- Use spacing tokens instead of arbitrary margins.
- Use typography tokens instead of custom font sizes.
- Use radius tokens consistently.
- Reuse existing tokens before creating new ones.

Never:

- Hardcode colors.
- Hardcode spacing.
- Hardcode shadows.
- Mix multiple border radius values unnecessarily.
- Introduce one-off design values without updating this document.

---

# Future Token Categories

Future versions may include:

- Charts
- Data visualization
- Heatmaps
- AI-specific UI
- Motion presets
- Brand themes
- White-label themes

---

# References

## Depends On

- Design System

## Used By

- Figma Design Library
- Frontend Development
- Tailwind Configuration
- CSS Variables
- Component Library
- Theme Engine

---

# Summary

The CareerOS Design Tokens provide a centralized foundation for all visual decisions across the application. By standardizing colors, spacing, typography, layout, and interaction values, the design system remains consistent, scalable, and implementation-ready for both designers and AI-assisted development.