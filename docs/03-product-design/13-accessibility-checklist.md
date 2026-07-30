# Accessibility Checklist

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the accessibility requirements for CareerOS.

Accessibility is a core product requirement, not a feature added later. Every screen, component, and interaction must meet these standards before release.

CareerOS targets compliance with **WCAG 2.2 Level AA**.

---

# Accessibility Principles

CareerOS should be:

- Perceivable
- Operable
- Understandable
- Robust

Every feature should be usable by people with different abilities, devices, and input methods.

---

# Compliance Target

Minimum compliance:

- WCAG 2.2 AA

Supported technologies:

- Screen readers
- Keyboard navigation
- High contrast mode
- Browser zoom
- Reduced motion preferences

---

# Keyboard Navigation

Every interactive element must be accessible using only a keyboard.

Required support:

- Tab
- Shift + Tab
- Enter
- Space
- Escape
- Arrow Keys (where applicable)

Never create a keyboard trap.

---

# Focus Management

Every interactive element must display a visible focus indicator.

Requirements:

- Minimum 2px focus ring
- High contrast
- Never remove focus outlines
- Return focus after closing modals

---

# Skip Navigation

Provide a "Skip to main content" link.

Purpose:

Allow keyboard users to bypass repetitive navigation.

---

# Screen Reader Support

Every interactive element must include:

- Accessible name
- Semantic role
- Helpful description when necessary

Examples:

Good:

```
Edit Resume
```

Avoid:

```
Button 1
```

---

# Semantic HTML

Use semantic elements whenever possible.

Preferred:

- header
- nav
- main
- section
- article
- aside
- footer
- button
- form
- label
- table

Avoid using generic `<div>` elements where semantic elements are appropriate.

---

# Forms

Every form field must include:

- Label
- Required indicator (when applicable)
- Validation message
- Helper text (if needed)

Never rely solely on placeholder text.

---

# Form Validation

Validation messages should:

- Clearly describe the problem
- Explain how to fix it
- Be announced to screen readers
- Appear near the related field

Example:

```
Email address is required.
```

---

# Color Usage

Never rely only on color to communicate meaning.

Example:

Instead of:

🔴 Error

Use:

- Error icon
- Error text
- Error color

---

# Color Contrast

Minimum contrast ratios:

| Element | Minimum |
|----------|----------|
| Normal Text | 4.5:1 |
| Large Text | 3:1 |
| UI Components | 3:1 |

---

# Typography

Minimum body text:

```
16px
```

Avoid:

- Extremely thin fonts
- Small labels
- Tight line spacing

---

# Icons

Decorative icons:

- Hidden from screen readers

Informational icons:

- Include accessible labels

Never use icons without accompanying text for important actions.

---

# Images

Every informative image must include meaningful alternative text.

Decorative images:

```
alt=""
```

Charts should provide a text summary or accessible data.

---

# Tables

Data tables must support:

- Header cells
- Proper scope attributes
- Keyboard navigation
- Responsive behavior

Complex tables should include captions.

---

# Buttons

Buttons must:

- Have descriptive labels
- Meet minimum touch target size
- Show focus state
- Indicate disabled state clearly

Minimum touch target:

```
40 × 40 px
```

---

# Links

Links should describe their destination.

Good:

```
View application details
```

Avoid:

```
Click here
```

---

# Modals

Every modal must:

- Trap keyboard focus
- Restore focus when closed
- Close with Escape
- Have a title
- Include close button

---

# Notifications

Toast notifications should:

- Be announced to assistive technologies
- Remain visible long enough to read
- Never require precise timing to dismiss

Critical notifications should also appear in the page content.

---

# Loading States

Loading indicators should:

- Communicate progress
- Avoid flashing
- Be announced when appropriate

Prefer skeleton screens over indefinite spinners.

---

# Error Handling

Every error should:

- Explain the issue
- Suggest a next step
- Avoid technical jargon

Example:

```
Unable to save your profile.

Please check your internet connection and try again.
```

---

# Motion & Animation

Respect the user's operating system preference for reduced motion.

Guidelines:

- Reduce non-essential animations
- Avoid flashing effects
- Keep transitions subtle
- Never animate continuously without user control

---

# Responsive Accessibility

Support:

- Mobile
- Tablet
- Desktop
- Zoom up to 200%

No functionality should be lost when zooming.

---

# Language

Set the document language correctly.

Example:

```
<html lang="en">
```

If multilingual support is added in the future, update language attributes appropriately.

---

# AI Features

AI-generated content should:

- Clearly distinguish suggestions from confirmed facts
- Explain uncertainty where appropriate
- Be reviewable before users act on it

Never present AI output as guaranteed or authoritative.

---

# Testing Checklist

Before releasing any feature, verify:

## Keyboard

- All controls reachable
- Logical tab order
- No keyboard traps

---

## Screen Reader

- Labels announced correctly
- Forms understandable
- Notifications announced
- Navigation landmarks present

---

## Visual

- Contrast meets WCAG
- Focus visible
- Text readable
- No clipped content

---

## Forms

- Labels present
- Errors announced
- Validation clear
- Required fields identified

---

## Mobile

- Touch targets ≥ 40 × 40 px
- Gestures have alternatives where possible
- Responsive layouts remain usable

---

# Accessibility QA Checklist

Every new screen must answer **Yes** to the following:

- Semantic HTML used
- Keyboard navigation works
- Focus indicators visible
- Screen reader labels added
- Contrast requirements met
- Forms fully labeled
- Errors accessible
- Images have alt text
- Tables properly structured
- Responsive behavior verified
- Reduced motion respected
- Toasts accessible
- Modals trap focus correctly
- Buttons have descriptive labels

No screen should be considered complete until this checklist passes.

---

# References

## Depends On

- Design System
- Design Tokens
- Component Library
- UX Writing Guidelines

## Used By

- UI Design
- Frontend Development
- QA Testing
- Accessibility Audits
- Product Reviews

---

# Summary

Accessibility is a fundamental quality standard for CareerOS. By following WCAG 2.2 AA guidelines and this checklist, every feature should remain usable, understandable, and inclusive across different devices, input methods, and assistive technologies.