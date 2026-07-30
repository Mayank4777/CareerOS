# Screen Inventory

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document provides a complete inventory of every screen in CareerOS.

Each screen includes:

- Purpose
- Route
- Required components
- Data dependencies
- User actions
- States
- Permissions

This document serves as the bridge between product design and wireframing.

---

# Screen Classification

| Category | Description |
|----------|-------------|
| Public | Accessible without authentication |
| Authenticated | Requires login |
| Future | Planned beyond MVP |

---

# Public Screens

---

## SCR-001 — Landing Page

**Route**

```
/
```

Purpose

Introduce CareerOS and encourage registration.

Components

- Hero Section
- Feature Overview
- CTA Buttons
- Footer

Actions

- Login
- Register

Permission

Public

---

## SCR-002 — Login

Route

```
/login
```

Components

- Login Form
- Remember Me
- Forgot Password

Actions

- Sign In
- Navigate to Register

Permission

Public

---

## SCR-003 — Register

Route

```
/register
```

Components

- Registration Form
- Password Strength
- Terms Checkbox

Actions

- Create Account

Permission

Public

---

## SCR-004 — Forgot Password

Route

```
/forgot-password
```

Permission

Public

---

## SCR-005 — Email Verification

Route

```
/verify-email
```

Permission

Public

---

# Dashboard Module

---

## SCR-100 — Dashboard

Route

```
/dashboard
```

Purpose

Provide an overview of the user's career.

Components

- AppShell
- PageHeader
- StatCards
- AIInsightCard
- Activity Timeline
- Upcoming Interviews
- Next Actions

Primary Data

- Career Profile
- Applications
- Interviews
- AI Recommendations

Actions

- Navigate to modules
- View recommendations

Permission

Authenticated

---

# Career Profile Module

---

## SCR-200 — Career Profile

Route

```
/profile
```

Components

- Profile Form
- Progress Indicator
- Section Cards

Actions

- Edit Profile
- Save Changes

---

## SCR-201 — Education

Route

```
/profile/education
```

Components

- Education Table
- Add/Edit Modal

---

## SCR-202 — Skills

Route

```
/profile/skills
```

Components

- Skill List
- Skill Tags
- Add Skill Dialog

---

## SCR-203 — Experience

Route

```
/profile/experience
```

---

## SCR-204 — Projects

Route

```
/profile/projects
```

---

## SCR-205 — Certifications

Route

```
/profile/certifications
```

---

## SCR-206 — Career Goals

Route

```
/profile/goals
```

---

# Resume Module

---

## SCR-300 — Resume Library

Route

```
/resumes
```

Components

- Resume Cards
- Search
- Filters
- Create Button

Actions

- Create Resume
- Upload Resume
- Open Resume

---

## SCR-301 — Resume Editor

Route

```
/resumes/:id/edit
```

Components

- Resume Form
- Live Preview
- Save Button
- AI Review Button

---

## SCR-302 — Resume Preview

Route

```
/resumes/:id
```

---

## SCR-303 — Resume Version History

Route

```
/resumes/:id/versions
```

---

## SCR-304 — AI Resume Review

Route

```
/resumes/:id/review
```

---

# Jobs Module

---

## SCR-400 — Saved Jobs

Route

```
/jobs
```

Components

- DataTable
- Search
- Filters
- Bulk Actions

---

## SCR-401 — Job Details

Route

```
/jobs/:id
```

---

## SCR-402 — Create Job

Route

```
/jobs/new
```

---

# Applications Module

---

## SCR-500 — Applications

Route

```
/applications
```

Components

- DataTable
- Status Filter
- Timeline

---

## SCR-501 — Application Details

Route

```
/applications/:id
```

Components

- Timeline
- Resume Used
- Interview History
- Notes

---

## SCR-502 — Create Application

Route

```
/applications/new
```

---

# Interviews Module

---

## SCR-600 — Interviews

Route

```
/interviews
```

---

## SCR-601 — Interview Details

Route

```
/interviews/:id
```

---

## SCR-602 — Schedule Interview

Route

```
/interviews/new
```

---

# AI Module

---

## SCR-700 — AI Career Coach

Route

```
/ai
```

Components

- AIRecommendationPanel
- Career Score
- Next Actions

---

## SCR-701 — Skill Gap Analysis

Route

```
/ai/skills
```

---

## SCR-702 — Job Match Analysis

Route

```
/ai/job-match
```

---

## SCR-703 — Career Roadmap

Route

```
/ai/roadmap
```

---

# Settings Module

---

## SCR-800 — Settings

Route

```
/settings
```

---

## SCR-801 — Account

Route

```
/settings/account
```

---

## SCR-802 — Security

Route

```
/settings/security
```

---

## SCR-803 — Notifications

Route

```
/settings/notifications
```

---

## SCR-804 — Connected Accounts

Route

```
/settings/integrations
```

---

# Common Screen States

Every screen should define:

## Loading

- Skeleton UI
- Disabled actions

---

## Empty

- Helpful illustration/icon
- Clear explanation
- Primary CTA

---

## Error

- Friendly message
- Retry option

---

## Success

- Confirmation toast
- Updated UI

---

# Navigation Relationships

```
Dashboard
    │
    ├── Profile
    ├── Resume
    ├── Jobs
    ├── Applications
    ├── Interviews
    ├── AI
    └── Settings
```

---

# Permission Matrix

| Screen | Guest | User | Admin |
|---------|:-----:|:----:|:-----:|
| Landing | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ |
| Dashboard | ✗ | ✓ | ✓ |
| Profile | ✗ | ✓ | ✓ |
| Resume | ✗ | ✓ | ✓ |
| Jobs | ✗ | ✓ | ✓ |
| Applications | ✗ | ✓ | ✓ |
| Interviews | ✗ | ✓ | ✓ |
| AI Coach | ✗ | ✓ | ✓ |
| Settings | ✗ | ✓ | ✓ |

---

# MVP Screen Count

| Module | Screens |
|---------|---------|
| Public | 5 |
| Dashboard | 1 |
| Career Profile | 7 |
| Resume | 5 |
| Jobs | 3 |
| Applications | 3 |
| Interviews | 3 |
| AI | 4 |
| Settings | 5 |

**Total MVP Screens:** **36**

---

# References

## Depends On

- Information Architecture
- User Flows
- Component Library

## Used By

- Wireframes
- UI Design
- Frontend Development
- QA
- Navigation Testing

---

# Summary

This inventory defines every user-facing screen in CareerOS, ensuring complete coverage of the MVP before wireframing begins. Each screen has a clear purpose, route, and set of reusable components, reducing ambiguity during design and development.