# Design System

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document establishes the visual language, component standards, interaction patterns, and accessibility guidelines for CareerOS. The goal is to create a consistent, professional, and scalable design system that supports long-term product growth.

---

# Design Principles

CareerOS should feel:

- Professional
- Calm
- Modern
- Trustworthy
- Efficient
- Timeless

Avoid trendy visual effects that reduce readability or quickly become dated.

---

# Design Inspiration

CareerOS draws inspiration from:

- Linear
- GitHub
- Notion
- Stripe Dashboard
- Vercel
- Supabase
- Raycast

The product should resemble enterprise-grade software rather than a marketing landing page.

---

# Visual Style

## Do

- Neutral color palette
- Clear typography hierarchy
- Consistent spacing
- Thin borders
- Subtle shadows
- One primary accent color
- High information density where appropriate

## Avoid

- Neon colors
- Heavy gradients
- Excessive glassmorphism
- Oversized rounded corners
- Glow effects
- Oversaturated UI
- Decorative animations

---

# Color Palette

## Primary

| Role | Hex |
|------|------|
| Primary | #2563EB |
| Primary Hover | #1D4ED8 |
| Primary Active | #1E40AF |

## Neutral

| Role | Hex |
|------|------|
| Background (Light) | #FAFAFA |
| Surface (Light) | #FFFFFF |
| Background (Dark) | #111827 |
| Surface (Dark) | #1F2937 |
| Border | #E5E7EB |
| Border Dark | #374151 |
| Primary Text | #111827 |
| Secondary Text | #6B7280 |

## Semantic

| Role | Hex |
|------|------|
| Success | #16A34A |
| Warning | #D97706 |
| Danger | #DC2626 |
| Info | #0284C7 |

---

# Typography

## Font Family

Primary: Inter

Fallback: system-ui, sans-serif

## Scale

- Display
- H1
- H2
- H3
- H4
- Body
- Small
- Caption

Use typography to create hierarchy instead of relying on color.

---

# Spacing System

Use an 8px grid.

Allowed spacing values:

4

8

12

16

24

32

40

48

64

No arbitrary spacing values.

---

# Border Radius

| Component | Radius |
|-----------|--------|
| Buttons | 8px |
| Inputs | 8px |
| Cards | 12px |
| Modals | 12px |
| Badges | 999px |

---

# Elevation

Use only three elevation levels:

- None
- Small
- Medium

Avoid dramatic shadows.

---

# Icons

Library:

Lucide Icons

Style:

- Outline
- Consistent stroke width
- 18–20px default size

---

# Buttons

Variants:

- Primary
- Secondary
- Outline
- Ghost
- Destructive

States:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

---

# Forms

Every field includes:

- Label
- Input
- Helper text (optional)
- Validation message
- Required indicator (when applicable)

---

# Tables

All data tables should support:

- Sticky headers
- Sorting
- Filtering
- Pagination
- Search
- Row selection
- Responsive overflow
- Empty state
- Loading state

---

# Cards

Cards should contain:

- Title
- Optional description
- Actions
- Content
- Footer (optional)

No gradients or glow effects.

---

# Feedback Components

Provide consistent designs for:

- Toasts
- Alerts
- Confirmation dialogs
- Empty states
- Skeleton loaders
- Progress indicators

---

# Responsive Breakpoints

| Device | Width |
|---------|------:|
| Mobile | <640px |
| Tablet | 640–1023px |
| Desktop | 1024–1439px |
| Large Desktop | ≥1440px |

Desktop-first is the primary design target.

---

# Accessibility

Minimum standards:

- WCAG 2.2 AA contrast
- Keyboard navigation
- Visible focus states
- Screen reader labels
- Semantic HTML
- Accessible form validation

---

# Component Naming

Examples:

- AppButton
- AppInput
- AppCard
- AppTable
- AppModal
- AppBadge
- AppToast

Keep naming consistent across the codebase.

---

# Design Implications

This design system is the foundation for:

- Wireframes
- High-fidelity UI
- Frontend components
- Figma library
- AI-generated code
- Future branding updates

---

# References

## Depends On

- Information Architecture
- User Flows
- Domain Model

## Used By

- Wireframes
- UI Design
- Component Library
- Frontend Development

---

# Summary

CareerOS adopts a clean, enterprise-grade visual language inspired by leading SaaS products. The focus is on clarity, usability, and long-term maintainability rather than visual novelty.