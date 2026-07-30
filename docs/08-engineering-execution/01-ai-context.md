# AI Context

## Purpose

This document is the primary entry point for any AI coding agent working on CareerOS.

Before implementing any feature, the AI must read this document to understand the project, development principles, implementation workflow, and references to the detailed architecture documentation.

This document does **not** replace the architecture documents. It serves as a navigation guide and rulebook for implementation.

---

# Project Overview

CareerOS is an AI-first Career Operating System that helps users manage every stage of their professional career through a single integrated platform.

Core capabilities include:

- Career Profile
- Resume Builder
- Resume Analysis
- Job Tracking
- Job Applications
- Interview Preparation
- AI Career Coach
- Notifications
- User Settings

The goal is to build a scalable, modular, production-ready SaaS application.

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod

## Backend

- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery

## Infrastructure

- Docker
- Docker Compose
- Nginx
- GitHub Actions

---

# Architecture Principles

The project follows a modular architecture.

Each module owns its:

- Models
- APIs
- Services
- Serializers
- Permissions
- Tests

Business logic must remain inside the Service layer.

Views should remain thin.

Selectors should only read data and must never contain business logic.

Modules communicate only through well-defined services or APIs.

---

# Development Principles

The project prioritizes:

- Maintainability
- Scalability
- Security
- Performance
- Readability
- Reusability
- Testability

Avoid shortcuts that compromise long-term maintainability.

---

# Folder Structure

High-level repository structure:

```text
CareerOS/

backend/
frontend/
docs/
docker/
scripts/
.github/
```

Detailed folder organization is documented separately.

---

# Development Order

Features must be implemented in the following order:

1. Project Setup
2. Backend Foundation
3. Frontend Foundation
4. Authentication
5. Career Profile
6. Resume
7. Job Management
8. Applications
9. Interviews
10. Notifications
11. AI Coach
12. User Settings

Do not implement future modules before completing required dependencies.

---

# General Rules

- Never redesign the architecture.
- Follow the documented folder structure.
- Reuse existing components whenever possible.
- Do not duplicate business logic.
- Keep modules independent.
- Write clean and readable code.
- Use UUIDs for primary keys.
- Prefer configuration over hardcoding.
- Keep functions and classes focused on a single responsibility.
- Remove dead code instead of commenting it out.

---

# Implementation Workflow

For every feature:

1. Read the relevant architecture documents.
2. Identify dependencies.
3. Implement backend.
4. Implement frontend.
5. Write tests.
6. Verify functionality.
7. Update documentation only if architecture changes.

---

# Documentation Reference

Refer to the following documentation before implementation:

## Product

- Product Discovery
- Product Definition
- Product Design

## Architecture

- System Architecture
- Database Design
- API Design
- Development Architecture

## Engineering Execution

- Development Roadmap
- Module Dependency Map
- Definition of Done
- Coding Standards
- Environment Setup

---

# Definition of Success

A feature is considered complete only when:

- Backend implementation is complete.
- Frontend implementation is complete.
- Validation is implemented.
- Error handling is implemented.
- Tests pass.
- UI is responsive.
- Dark mode is supported where applicable.
- Code follows project conventions.

---

# Important Notes for AI Coding Agents

- Never introduce new frameworks without approval.
- Never rename APIs or database structures without approval.
- Never change module boundaries.
- Never ignore existing documentation.
- If documentation and implementation conflict, documentation takes precedence.
- If requirements are unclear, stop and request clarification instead of making assumptions.

---

# End of Document