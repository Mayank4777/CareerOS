# Navigation Map

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the navigation structure of CareerOS.

It specifies how users move between screens, how modules connect, how navigation behaves, and how routing should be implemented.

Unlike the Information Architecture, which describes the organization of information, this document describes the user's movement through the application.

---

# Navigation Principles

CareerOS navigation should be:

- Predictable
- Consistent
- Shallow
- Fast
- Keyboard-friendly
- Searchable
- Responsive

Users should never be more than three interactions away from any primary feature.

---

# Global Navigation Structure

```
Landing
│
├── Login
├── Register
└── Forgot Password

↓

Dashboard

├── Career Profile
├── Resume
├── Jobs
├── Applications
├── Interviews
├── AI Career Coach
└── Settings
```

---

# Sidebar Navigation

```
Dashboard

Career Profile
    ├── Personal Information
    ├── Education
    ├── Experience
    ├── Skills
    ├── Projects
    ├── Certifications
    └── Career Goals

Resume
    ├── Resume Library
    ├── Resume Editor
    ├── Resume Review
    └── Version History

Jobs
    ├── Saved Jobs
    ├── New Job
    └── Job Details

Applications
    ├── Applications
    ├── New Application
    └── Application Details

Interviews
    ├── Interviews
    ├── Schedule Interview
    └── Interview Details

AI Career Coach
    ├── Dashboard
    ├── Skill Gap
    ├── Job Match
    └── Career Roadmap

Settings
```

---

# Top Navigation

Every authenticated screen contains:

```
Logo

↓

Global Search

↓

Notifications

↓

Theme Toggle

↓

User Menu
```

---

# Dashboard Navigation

Dashboard serves as the central hub.

Users can navigate directly to:

```
Dashboard

↓

Career Profile

Resume

Jobs

Applications

Interviews

AI Coach

Settings
```

---

# Module Navigation

## Career Profile

```
Profile

↓

Education

↓

Skills

↓

Projects

↓

Experience

↓

Certifications

↓

Goals
```

Users may switch between sections without leaving the module.

---

## Resume

```
Resume Library

↓

Resume Details

↓

Resume Editor

↓

AI Review

↓

Version History

↓

Export
```

---

## Jobs

```
Jobs

↓

Job Details

↓

Create Application
```

---

## Applications

```
Applications

↓

Application Details

↓

Interview

↓

AI Analysis
```

---

## Interviews

```
Interviews

↓

Interview Details

↓

Outcome

↓

Lessons Learned
```

---

## AI Career Coach

```
AI Dashboard

↓

Resume Insights

↓

Skill Gap

↓

Job Match

↓

Career Roadmap
```

---

# Cross-Module Navigation

CareerOS encourages seamless movement between related modules.

```
Career Profile

↓

Resume

↓

Applications

↓

Interviews

↓

AI Coach
```

Examples:

- A resume can open linked applications.
- An application can open its associated job.
- An interview can open the related application.
- AI recommendations can deep-link to the exact screen requiring action.

---

# Breadcrumb Navigation

Examples:

```
Dashboard
```

```
Career Profile
```

```
Career Profile
>
Projects
```

```
Resume
>
Resume Library
>
Resume Editor
```

```
Applications
>
Application Details
>
Interview
```

Breadcrumbs should always reflect the current navigation hierarchy.

---

# Deep Linking

Every page should have a unique URL.

Examples:

```
/dashboard

/profile

/profile/projects

/resumes

/resumes/{id}

/applications

/applications/{id}

/interviews/{id}

/ai/job-match
```

Users should be able to refresh the browser without losing context.

---

# Navigation Behavior

## Sidebar

- Persistent on desktop
- Collapsible
- Highlights active module
- Preserves expanded sections

---

## Mobile

- Drawer navigation
- Full-screen overlays for nested menus
- Bottom navigation is **not** used

---

## Browser Controls

Support:

- Back
- Forward
- Refresh
- Deep links
- Shared URLs

---

# Search Navigation

Global search should navigate directly to matching entities.

Supported targets:

- Resume
- Job
- Application
- Interview
- Skill
- Project
- Certification
- Company

Selecting a result opens its detail page.

---

# Notification Navigation

Notifications should open the relevant context.

Examples:

| Notification | Destination |
|-------------|-------------|
| Interview Tomorrow | Interview Details |
| Resume Review Ready | AI Resume Review |
| Career Score Updated | Dashboard |
| New AI Recommendation | AI Career Coach |

---

# Error Navigation

If a requested page is unavailable:

- Show a 404 page.
- Provide navigation back to the Dashboard.
- Preserve sidebar and top navigation where possible.

If the user lacks permission:

- Show an Access Denied screen.
- Explain why access is unavailable.
- Offer a valid navigation path.

---

# Authentication Navigation

Guest users attempting to access protected routes:

```
Protected Route

↓

Redirect to Login

↓

Successful Login

↓

Return to Requested Page
```

The original destination should be preserved after authentication.

---

# Navigation State

The application should remember:

- Expanded sidebar sections
- Active module
- Theme preference
- Recent searches
- Last visited page (optional)

Navigation state should not affect business data.

---

# Accessibility

Navigation must support:

- Keyboard-only operation
- Skip-to-content link
- Visible focus indicators
- Screen reader announcements
- Logical tab order

---

# Future Navigation

Future modules should integrate without restructuring existing navigation.

Potential additions:

- Learning Hub
- Portfolio
- Recruiter Workspace
- University Portal
- Community
- Admin Console

---

# Design Implications

This document influences:

- React Router configuration
- Sidebar implementation
- Breadcrumb generation
- Deep linking
- Navigation guards
- Route organization
- Search behavior
- Permission handling

---

# References

## Depends On

- Information Architecture
- User Flows
- Screen Inventory

## Used By

- Wireframes
- Frontend Routing
- Navigation Components
- QA Testing
- Mobile Design

---

# Summary

The Navigation Map defines how users move throughout CareerOS. By establishing clear routing, deep linking, breadcrumbs, and module relationships, it ensures a predictable, scalable, and user-friendly navigation experience across the entire platform.