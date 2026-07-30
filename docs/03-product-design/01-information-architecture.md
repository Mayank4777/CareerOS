# Information Architecture

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines how information is organized within CareerOS.

It establishes the application's structure, navigation hierarchy, relationships between modules, and the overall user experience before interface design begins.

A well-defined Information Architecture ensures that users can easily find information and complete tasks without unnecessary complexity.

---

# Design Principles

The information architecture follows these principles:

- User journey over feature grouping
- Minimal navigation depth
- Clear separation of concerns
- Consistent layout across modules
- Scalable for future expansion
- Desktop-first with responsive design

---

# Primary Navigation

The main sidebar contains the core modules of CareerOS.

```
CareerOS

├── Dashboard
├── Career Profile
├── Resume
├── Jobs
├── Applications
├── Interviews
├── AI Career Coach
└── Settings
```

---

# Module Hierarchy

## Dashboard

Purpose:

Provide a complete overview of the user's career progress.

Pages

```
Dashboard

├── Overview
├── Career Readiness
├── Application Statistics
├── Recent Activity
├── Upcoming Interviews
└── AI Next Actions
```

---

## Career Profile

Purpose:

Maintain the user's complete professional profile.

Pages

```
Career Profile

├── Personal Information
├── Education
├── Experience
├── Skills
├── Projects
├── Certifications
├── Achievements
├── Career Goals
└── Portfolio Links
```

---

## Resume

Purpose:

Create, manage, review, and improve resumes.

Pages

```
Resume

├── Resume Library
├── Resume Editor
├── Resume Preview
├── Resume Versions
├── AI Resume Review
└── Export PDF
```

---

## Jobs

Purpose:

Store and organize job opportunities.

Pages

```
Jobs

├── Saved Jobs
├── Job Details
├── Browser Capture
├── Bookmarks
└── Job Notes
```

---

## Applications

Purpose:

Track every application throughout its lifecycle.

Pages

```
Applications

├── All Applications
├── Application Details
├── Timeline
├── Status History
├── Resume Used
└── Notes
```

---

## Interviews

Purpose:

Prepare for and document interviews.

Pages

```
Interviews

├── Upcoming Interviews
├── Interview Details
├── Notes
├── Outcomes
└── Lessons Learned
```

---

## AI Career Coach

Purpose:

Provide personalized recommendations.

Pages

```
AI Career Coach

├── Career Insights
├── Resume Suggestions
├── Skill Gap Analysis
├── Job Match Analysis
├── Interview Guidance
└── Career Roadmap
```

---

## Settings

Purpose:

Manage user preferences and account settings.

Pages

```
Settings

├── Profile
├── Account
├── Security
├── Notifications
├── Connected Accounts
└── Preferences
```

---

# Navigation Flow

```
Login

↓

Dashboard

↓

Career Profile

↓

Resume

↓

Jobs

↓

Applications

↓

Interviews

↓

AI Coach
```

Users may enter any module directly after authentication.

---

# Cross-Module Relationships

```
Career Profile
      │
      ├────────────┐
      │            │
      ▼            ▼
Resume         AI Coach
      │            ▲
      ▼            │
Applications ──────┘
      │
      ▼
Interviews
      │
      ▼
Dashboard
```

### Relationship Summary

- Career Profile powers AI recommendations.
- Resumes are linked to job applications.
- Applications generate interview records.
- Interview outcomes contribute to AI guidance.
- Dashboard aggregates information from all modules.

---

# Breadcrumb Structure

Examples:

```
Dashboard

Dashboard > Overview
```

```
Career Profile

Career Profile > Skills
```

```
Resume

Resume > Resume Library > Resume Preview
```

```
Applications

Applications > Application Details
```

---

# Global Search Scope

Global search should support:

- Resume names
- Companies
- Job titles
- Skills
- Projects
- Certifications
- Applications
- Interview records

---

# Global Components

Available on every authenticated page:

- Sidebar Navigation
- Top Navigation Bar
- Search
- Notifications
- User Menu
- Theme Toggle
- Breadcrumbs

---

# Access Rules

Guest users

- Login
- Register
- Forgot Password

Authenticated users

- Access all personal modules
- Access only their own data

Administrators (Future)

- User Management
- Analytics
- Platform Monitoring
- Support Tools

---

# Scalability

Future modules can be added without restructuring navigation.

Examples:

```
CareerOS

├── Dashboard
├── Career Profile
├── Resume
├── Jobs
├── Applications
├── Interviews
├── AI Career Coach
├── Learning Hub
├── Recruiter Workspace
├── University Portal
├── Public Portfolio
└── Admin
```

---

# Design Implications

This architecture influences:

- URL structure
- Routing
- Sidebar navigation
- Breadcrumb generation
- Database relationships
- API organization
- Permission model
- UI layout consistency

Changes to this document should be made before visual UI design begins.

---

# References

## Depends On

- Product Requirements Document
- MVP Definition
- Feature Inventory
- Epics

## Used By

- Wireframes
- UI Design
- Database Design
- API Design
- Frontend Architecture
- Backend Architecture

---

# Summary

The Information Architecture organizes CareerOS into a clear, scalable structure centered on the user's career journey. Every module contributes to a unified workflow, allowing users to collect career information, manage opportunities, track progress, and receive personalized AI guidance from a single platform.