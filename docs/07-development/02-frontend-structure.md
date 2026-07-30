# Frontend Structure

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the frontend architecture and project structure for CareerOS. It establishes how the React application is organized, how features are separated, and how reusable components and shared logic are managed.

The objective is to build a scalable, maintainable, and consistent frontend codebase.

---

# Scope

This document covers:

- Project structure
- Feature organization
- Routing
- State management
- API integration
- Component architecture
- Shared utilities
- Development guidelines

---

# Technology Stack

Framework

- React
- TypeScript
- Vite

UI

- Tailwind CSS

Routing

- React Router

Data Fetching

- TanStack Query

Forms

- React Hook Form
- Zod

Icons

- Lucide React

State Management

- React Context
- TanStack Query Cache

---

# High-Level Structure

```text
frontend/

├── src/
├── public/
├── tests/
├── package.json
├── vite.config.ts
└── Dockerfile
```

---

# Source Structure

```text
src/

├── app/
├── features/
├── components/
├── layouts/
├── hooks/
├── services/
├── lib/
├── contexts/
├── assets/
├── styles/
├── routes/
├── types/
├── constants/
└── utils/
```

---

# App Directory

Responsible for application initialization.

Contains:

- Application bootstrap
- Providers
- Global configuration
- Router setup
- Theme initialization

---

# Feature Modules

Business functionality is organized by feature.

```text
features/

├── authentication/
├── career-profile/
├── resumes/
├── jobs/
├── applications/
├── interviews/
├── ai-coach/
├── notifications/
└── settings/
```

Each feature is independently developed and maintained.

---

# Standard Feature Structure

Every feature follows the same layout.

```text
applications/

├── api/
├── components/
├── hooks/
├── pages/
├── types/
├── validation/
├── constants/
└── index.ts
```

This structure improves consistency and discoverability.

---

# Shared Components

Reusable UI components are stored separately.

```text
components/

├── ui/
├── forms/
├── tables/
├── dialogs/
├── navigation/
├── feedback/
├── charts/
└── common/
```

These components should remain business-independent.

---

# Layouts

Layouts define page structure.

Examples:

```text
layouts/

├── AuthLayout
├── DashboardLayout
├── SettingsLayout
└── PublicLayout
```

Layouts should not contain business logic.

---

# Routing

Routes are centrally managed.

```text
routes/

├── index.tsx
├── protected.tsx
├── public.tsx
└── paths.ts
```

Protected routes require authentication before rendering.

---

# API Layer

All backend communication passes through the service layer.

```text
services/

├── api.ts
├── auth.ts
├── resume.ts
├── application.ts
├── interview.ts
└── ai.ts
```

Components should never perform HTTP requests directly.

---

# State Management

CareerOS uses multiple levels of state.

## Server State

Managed using:

- TanStack Query

Examples:

- User profile
- Applications
- Jobs
- Resume data

---

## Local Component State

Managed using:

- React Hooks

Examples:

- Modal visibility
- Form steps
- UI interactions

---

## Global State

Managed using:

- React Context

Examples:

- Authentication
- Theme
- User preferences

Only truly global data should use Context.

---

# Form Management

Forms use:

- React Hook Form
- Zod validation

Validation should be shared between forms wherever possible.

---

# Hooks

Reusable business logic is extracted into custom hooks.

Examples:

```text
hooks/

useAuth()
usePagination()
useDebounce()
useNotifications()
useResumeAnalysis()
```

Hooks should avoid rendering UI.

---

# Utility Functions

Shared utilities include:

```text
utils/

date.ts
string.ts
file.ts
validation.ts
storage.ts
```

Utilities should remain framework-independent whenever possible.

---

# Constants

Application constants are centralized.

Examples:

```text
constants/

api.ts
routes.ts
roles.ts
status.ts
theme.ts
```

Avoid hardcoded values throughout the application.

---

# Types

Shared TypeScript interfaces are stored separately.

Examples:

```text
types/

user.ts
resume.ts
application.ts
interview.ts
api.ts
```

Feature-specific types should remain within their respective modules.

---

# Styling

CareerOS uses Tailwind CSS.

Guidelines:

- Utility-first styling
- Responsive design
- Design token usage
- Minimal custom CSS

Global styles should be limited to application-wide concerns.

---

# Assets

Static assets include:

- Logos
- Icons
- Illustrations
- Fonts

Large media files should be optimized before inclusion.

---

# Error Handling

Frontend should gracefully handle:

- API failures
- Validation errors
- Network issues
- Authentication failures
- Loading states

Users should receive clear, actionable feedback.

---

# Development Guidelines

- Organize code by feature.
- Keep components small and reusable.
- Separate UI from business logic.
- Reuse hooks for shared behavior.
- Avoid duplicated code.
- Keep API communication centralized.
- Follow TypeScript strictly.

---

# References

Depends On:

- 03-product-design/06-design-system.md
- 04-system-architecture/07-data-flow.md
- 06-api-design/01-api-standards.md

Used By:

- 03-security.md
- 04-testing-strategy.md
- Frontend Development

---

# Summary

The CareerOS frontend follows a feature-based React architecture with clear separation of concerns. Shared components, centralized API services, reusable hooks, and strict TypeScript practices create a scalable and maintainable foundation that aligns with the backend architecture and design system.