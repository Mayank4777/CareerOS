# Component Library

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines every reusable UI component available in CareerOS.

Rather than designing pages independently, every screen should be composed from these standardized components.

The component library ensures:

- Visual consistency
- Faster development
- Easier maintenance
- Better accessibility
- Predictable AI-generated code

---

# Design Principles

Every component must be:

- Reusable
- Accessible
- Responsive
- Theme-aware
- Stateless where possible
- Consistent with Design Tokens

---

# Component Hierarchy

```
Application

↓

Layouts

↓

Templates

↓

Sections

↓

Components

↓

Primitive Elements
```

---

# Level 1 — Layout Components

These define the overall page structure.

---

## AppShell

Purpose

Main application container.

Contains

- Sidebar
- Top Navigation
- Content Area
- Notification Area

Used On

Every authenticated page.

---

## AuthLayout

Purpose

Layout for login, registration, password reset, and verification.

---

## DashboardLayout

Purpose

Standard layout for dashboard pages.

---

## SettingsLayout

Purpose

Layout with left navigation and settings content.

---

# Level 2 — Navigation Components

---

## Sidebar

Features

- Expand / Collapse
- Active State
- Icons
- Labels
- Nested Navigation
- Keyboard Navigation

---

## TopNavbar

Contains

- Search
- Notifications
- Theme Toggle
- User Menu

---

## Breadcrumb

Displays current page hierarchy.

---

## PageHeader

Contains

- Title
- Subtitle
- Actions
- Breadcrumb

---

# Level 3 — Data Display Components

---

## StatCard

Displays

- Title
- Value
- Change Indicator
- Icon
- Optional Trend

Examples

- Applications
- Interviews
- Career Score

---

## SectionCard

Generic content container.

Contains

- Header
- Body
- Footer (optional)

---

## AIInsightCard

Displays

- Recommendation
- Confidence
- Action Button
- Timestamp

---

## ResumeCard

Displays

- Resume Name
- Version
- Last Updated
- Resume Score
- Actions

---

## JobCard

Displays

- Company
- Role
- Location
- Status
- Tags
- Actions

---

## ApplicationCard

Displays

- Company
- Position
- Current Status
- Resume Used
- Timeline Summary

---

## InterviewCard

Displays

- Company
- Interview Stage
- Schedule
- Outcome

---

## Timeline

Displays chronological events.

Used for

- Applications
- Interviews
- Activity History

---

## Badge

Variants

- Success
- Warning
- Error
- Info
- Neutral

---

# Level 4 — Tables

---

## DataTable

Supports

- Sorting
- Filtering
- Pagination
- Sticky Header
- Search
- Row Selection
- Bulk Actions
- Empty State
- Loading State

Used across:

- Jobs
- Applications
- Resumes
- Skills
- Interviews

---

## TableToolbar

Contains

- Search
- Filters
- Export
- Bulk Actions

---

# Level 5 — Forms

---

## AppForm

Wrapper component.

---

## TextInput

Supports

- Label
- Helper Text
- Validation
- Prefix/Suffix

---

## TextArea

---

## Select

---

## MultiSelect

---

## DatePicker

---

## FileUpload

Supports

- Drag & Drop
- Browse
- Progress
- Validation

---

## SearchInput

---

## ToggleSwitch

---

## Checkbox

---

## RadioGroup

---

## Button

Variants

- Primary
- Secondary
- Outline
- Ghost
- Destructive

States

- Default
- Hover
- Focus
- Disabled
- Loading

---

# Level 6 — AI Components

---

## AIRecommendationPanel

Displays

- Recommendation
- Reasoning Summary
- Confidence
- Actions

---

## AIChatPanel (Future)

Persistent conversation with AI Coach.

Not part of MVP.

---

## SkillGapCard

Displays

- Missing Skill
- Importance
- Suggested Learning

---

## ResumeReviewPanel

Displays

- Resume Score
- Improvements
- Weak Areas
- Strengths

---

## CareerReadinessCard

Displays

- Readiness Score
- Progress
- Recommendations

---

# Level 7 — Feedback Components

---

## Toast

Variants

- Success
- Error
- Warning
- Info

---

## Alert

---

## EmptyState

Contains

- Illustration/Icon
- Message
- Description
- CTA

---

## LoadingState

Use Skeleton UI instead of spinners whenever practical.

---

## ProgressBar

---

## ConfirmationModal

Used before destructive actions.

---

## ErrorBoundary

Displays graceful fallback UI for unexpected errors.

---

# Level 8 — Utility Components

---

## Avatar

---

## Divider

---

## Tooltip

---

## Popover

---

## DropdownMenu

---

## Tabs

---

## Accordion

---

## Pagination

---

## Chip

---

## Tag

---

# Charts

CareerOS uses charts sparingly.

Supported:

- Line Chart
- Bar Chart
- Donut Chart
- Progress Ring

Avoid decorative visualizations.

---

# Component Naming

Use consistent prefixes.

Examples

```
AppButton

AppInput

AppCard

AppTable

AppModal

AppBadge

AppAvatar

AppSidebar

AppNavbar

AppToast

ResumeCard

JobCard

AIInsightCard
```

---

# Component States

Every interactive component should support:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Error (where applicable)

---

# Accessibility Requirements

Every component must support:

- Keyboard navigation
- Screen readers
- Focus management
- Semantic HTML
- WCAG 2.2 AA contrast

---

# Responsive Behavior

Components should adapt across:

- Mobile
- Tablet
- Desktop
- Large Desktop

Layouts may change, but component behavior should remain predictable.

---

# Component Ownership

| Layer | Responsibility |
|---------|---------------|
| Design Tokens | Visual values |
| Design System | Design rules |
| Component Library | Reusable UI building blocks |
| Pages | Business-specific composition |

---

# Future Components

Future releases may introduce:

- GitHub Activity Card
- LinkedIn Profile Card
- Learning Path Timeline
- Portfolio Viewer
- Recruiter Dashboard Widgets
- University Analytics Cards
- AI Interview Simulator
- Voice Recorder
- Kanban Board

---

# Design Implications

The Component Library influences:

- Figma component library
- React component architecture
- Storybook documentation
- AI code generation prompts
- Frontend testing
- Design consistency

All new UI should be built by composing existing components whenever possible.

---

# References

## Depends On

- Design System
- Design Tokens
- Information Architecture

## Used By

- Wireframes
- Figma
- React Components
- Storybook
- Frontend Development
- AI-Assisted UI Generation

---

# Summary

The CareerOS Component Library defines the reusable building blocks of the application's interface. By composing screens from standardized components, the platform achieves a consistent, scalable, and maintainable user experience while significantly improving the quality and reliability of AI-generated frontend code.