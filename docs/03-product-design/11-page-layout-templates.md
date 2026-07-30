# Page Layout Templates

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the standard page layouts used throughout CareerOS.

Instead of designing every screen independently, all pages should be composed using these reusable templates. This ensures consistency, reduces design effort, simplifies frontend development, and improves AI-generated code quality.

---

# Layout Principles

Every layout should be:

- Consistent
- Responsive
- Accessible
- Reusable
- Data-first
- Optimized for productivity

The goal is to minimize layout variation while maximizing usability.

---

# Global Application Structure

Every authenticated page follows the same foundation.

```
+-----------------------------------------------------------+
|                      Top Navigation                        |
+-----------+-----------------------------------------------+
|           |                                               |
| Sidebar   |             Page Content                      |
|           |                                               |
|           |                                               |
|           |                                               |
|           |                                               |
+-----------+-----------------------------------------------+
```

Used by every authenticated screen.

---

# Template 1 — Dashboard Layout

## Purpose

Provides a high-level overview of the user's career.

---

## Used By

- Dashboard
- AI Dashboard
- Future Analytics

---

## Structure

```
Page Header

↓

Statistics Row

↓

AI Recommendations

↓

Recent Activity

↓

Upcoming Interviews

↓

Quick Actions
```

---

## Components

- AppShell
- PageHeader
- StatCard
- AIInsightCard
- ActivityTimeline
- SectionCard
- QuickActionPanel

---

## Characteristics

- Information-rich
- Read-only
- Multiple widgets
- Minimal scrolling

---

# Template 2 — Data Management Layout

## Purpose

Manage collections of records.

---

## Used By

- Applications
- Jobs
- Resume Library
- Interviews
- Skills
- Certifications

---

## Structure

```
Page Header

↓

Toolbar

↓

Filters

↓

Search

↓

Data Table

↓

Pagination
```

---

## Components

- PageHeader
- SearchInput
- FilterPanel
- DataTable
- BulkActions
- Pagination

---

## Characteristics

- High information density
- Optimized for repeated use
- Keyboard-friendly
- Bulk operations

---

# Template 3 — Detail View Layout

## Purpose

Display detailed information about a single entity.

---

## Used By

- Job Details
- Application Details
- Interview Details
- Resume Details

---

## Structure

```
Breadcrumb

↓

Page Header

↓

Summary Card

↓

Information Sections

↓

Timeline

↓

Related Items

↓

Actions
```

---

## Components

- Breadcrumb
- PageHeader
- SectionCard
- Timeline
- Badge
- ActionButtons

---

## Characteristics

- Read-focused
- Organized into sections
- Easy navigation between related records

---

# Template 4 — Form Layout

## Purpose

Create or edit data.

---

## Used By

- Profile
- Resume Editor
- New Job
- New Application
- Schedule Interview
- Settings Forms

---

## Structure

```
Page Header

↓

Form Sections

↓

Validation

↓

Primary Actions
```

---

## Components

- AppForm
- TextInput
- Select
- TextArea
- DatePicker
- FileUpload
- Save Button
- Cancel Button

---

## Characteristics

- Vertical layout
- Logical grouping
- Inline validation
- Sticky action bar (desktop)

---

# Template 5 — AI Workspace Layout

## Purpose

Display AI-generated insights and recommendations.

---

## Used By

- AI Coach
- Resume Review
- Skill Gap Analysis
- Job Match Analysis
- Career Roadmap

---

## Structure

```
Page Header

↓

Summary

↓

AI Results

↓

Recommendations

↓

Suggested Actions
```

---

## Components

- AIInsightCard
- CareerReadinessCard
- SkillGapCard
- ResumeReviewPanel
- ActionPanel

---

## Characteristics

- Reading-focused
- Recommendation-driven
- Minimal distractions

---

# Template 6 — Settings Layout

## Purpose

Manage user preferences and account configuration.

---

## Used By

- Account
- Security
- Notifications
- Integrations

---

## Structure

```
Settings Navigation

↓

Configuration Form

↓

Save Changes
```

---

## Components

- SettingsSidebar
- PageHeader
- AppForm
- ToggleSwitch
- Save Button

---

## Characteristics

- Simple
- Consistent
- Low cognitive load

---

# Template 7 — Authentication Layout

## Purpose

Public authentication pages.

---

## Used By

- Login
- Register
- Forgot Password
- Verify Email

---

## Structure

```
Logo

↓

Heading

↓

Authentication Form

↓

Secondary Actions
```

---

## Components

- AuthCard
- TextInput
- PasswordInput
- PrimaryButton
- Divider
- Footer Links

---

## Characteristics

- Centered content
- Minimal distractions
- Mobile-friendly

---

# Shared Layout Rules

Every authenticated page includes:

- Sidebar
- Top Navigation
- Breadcrumb (except Dashboard)
- Page Header
- Toast Container
- Loading Overlay
- Confirmation Dialog Support

---

# Responsive Behavior

## Desktop (≥1024px)

- Permanent sidebar
- Multi-column layouts
- Sticky headers
- Sticky table toolbar

---

## Tablet (768–1023px)

- Collapsible sidebar
- Reduced spacing
- Two-column layouts where appropriate

---

## Mobile (<768px)

- Drawer navigation
- Single-column layouts
- Cards replace tables when necessary
- Sticky bottom action buttons for forms

---

# Empty State Pattern

Every layout should provide an informative empty state.

Structure:

```
Illustration/Icon

↓

Title

↓

Description

↓

Primary Action
```

Example:

Applications page:

```
No applications yet.

Track every job application from one place.

[ Create First Application ]
```

---

# Loading State Pattern

Use Skeleton UI instead of full-screen spinners.

Guidelines:

- Match final content layout
- Avoid layout shift
- Preserve user context

---

# Error State Pattern

Every page should provide:

- Clear title
- Human-readable explanation
- Retry action
- Link back to Dashboard (if appropriate)

Never expose technical errors to end users.

---

# Success Feedback Pattern

Successful actions should use:

- Toast notifications
- Inline success indicators
- Automatic UI refresh where appropriate

Avoid unnecessary confirmation pages.

---

# Layout Selection Matrix

| Screen | Template |
|---------|----------|
| Dashboard | Dashboard Layout |
| Profile | Form Layout |
| Education | Data Management |
| Skills | Data Management |
| Projects | Data Management |
| Resume Library | Data Management |
| Resume Editor | Form Layout |
| Resume Review | AI Workspace |
| Jobs | Data Management |
| Job Details | Detail View |
| Applications | Data Management |
| Application Details | Detail View |
| Interviews | Data Management |
| Interview Details | Detail View |
| AI Coach | AI Workspace |
| Settings | Settings Layout |
| Login | Authentication |
| Register | Authentication |

---

# AI Code Generation Rules

When generating UI, AI tools should:

- Select the appropriate layout template first.
- Assemble pages using components from the Component Library.
- Use only Design Tokens for spacing, colors, typography, and sizing.
- Follow the Navigation Map for routing.
- Respect responsive behavior and accessibility guidelines.

No page should invent a new layout unless explicitly approved.

---

# References

## Depends On

- Design System
- Design Tokens
- Component Library
- Navigation Map
- Screen Inventory

## Used By

- Wireframes
- High-Fidelity UI
- React Frontend
- Figma Components
- Storybook
- AI-Assisted Development

---

# Summary

CareerOS uses seven standardized page layouts to build every screen in the application. By separating layout from content, the platform achieves a consistent, scalable, and maintainable user experience while dramatically simplifying design, frontend development, and AI-assisted implementation.