# Backend Structure

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the backend project structure for CareerOS. It establishes how the Django application is organized, how modules interact, and where business logic should reside.

The objective is to maintain a scalable, modular, and maintainable codebase throughout the product lifecycle.

---

# Scope

This document covers:

- Project structure
- Module organization
- Layered architecture
- Code organization
- Shared components
- Dependency rules
- Development guidelines

---

# Technology Stack

Backend Framework

- Django
- Django REST Framework

Database

- PostgreSQL

Cache

- Redis

Background Processing

- Celery

Authentication

- JWT

Storage

- S3 Compatible Object Storage

---

# High-Level Structure

```text
backend/

├── config/
├── apps/
├── common/
├── ai/
├── integrations/
├── media/
├── static/
├── scripts/
├── requirements/
├── tests/
├── manage.py
└── Dockerfile
```

---

# Project Structure

## config/

Contains project configuration.

Responsibilities:

- Django settings
- URL routing
- ASGI
- WSGI
- Celery configuration
- Environment configuration

---

## apps/

Contains all business modules.

Example:

```text
apps/

├── authentication/
├── career_profile/
├── resume/
├── jobs/
├── applications/
├── interviews/
├── notifications/
├── settings/
```

Each module is independently responsible for its business domain.

---

# Standard Module Structure

Every Django app follows the same structure.

```text
resume/

├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── views.py
├── urls.py
├── services.py
├── selectors.py
├── permissions.py
├── validators.py
├── tasks.py
├── signals.py
├── exceptions.py
├── constants.py
├── tests/
└── migrations/
```

Consistency across modules improves maintainability.

---

# Layered Architecture

```text
API View

↓

Serializer

↓

Service Layer

↓

Selector Layer

↓

Model

↓

Database
```

Each layer has a single responsibility.

---

# Responsibilities

## Views

Responsible for:

- Receiving requests
- Authentication
- Authorization
- Calling services
- Returning responses

Views should remain thin.

---

## Serializers

Responsible for:

- Input validation
- Output formatting
- Request parsing
- Response serialization

Serializers should not contain business logic.

---

## Services

Responsible for:

- Business rules
- Transactions
- Module workflows
- Database writes
- AI orchestration
- External integrations

All business logic belongs here.

---

## Selectors

Responsible for:

- Complex queries
- Read operations
- Optimized database access
- Reusable query logic

Selectors should never modify data.

---

## Models

Responsible for:

- Database schema
- Relationships
- Constraints
- Simple model helpers

Business workflows should not be implemented inside models.

---

# Common Package

The `common` package contains reusable components.

Example:

```text
common/

├── authentication/
├── permissions/
├── pagination/
├── exceptions/
├── middleware/
├── utils/
├── constants/
├── validators/
├── logging/
├── storage/
```

Only generic functionality belongs here.

---

# AI Package

```text
ai/

├── orchestrator/
├── providers/
├── prompts/
├── parsers/
├── context/
├── usage/
└── tasks/
```

Responsibilities:

- Provider abstraction
- Prompt management
- Context building
- AI orchestration
- Usage tracking

Business modules communicate with AI only through this package.

---

# Integrations Package

External systems are isolated.

Example:

```text
integrations/

├── gmail/
├── calendar/
├── linkedin/
├── job_boards/
├── storage/
└── email/
```

External APIs should never be accessed directly from business modules.

---

# Dependency Rules

Allowed dependency flow:

```text
Views

↓

Services

↓

Selectors

↓

Models
```

Not allowed:

- Views calling models directly
- Serializers performing business logic
- Modules accessing another module's models directly
- Circular module dependencies

---

# Shared Utilities

Reusable utilities include:

- Date helpers
- UUID generators
- File helpers
- Email utilities
- Pagination
- Validators
- Logging
- Permissions

Utilities must remain framework-independent whenever possible.

---

# Configuration Management

Configuration is environment-based.

Examples:

- Database
- Redis
- Storage
- AI providers
- Email
- Security
- Logging

Secrets should never be hardcoded.

---

# Background Tasks

Long-running operations execute using Celery.

Examples:

- Resume analysis
- Cover letter generation
- Email delivery
- Notification processing
- File processing

Views should not wait for long-running tasks to complete.

---

# Logging

Centralized logging should capture:

- Errors
- Warnings
- API requests
- Background tasks
- AI requests
- External integrations

Sensitive information must never be logged.

---

# Testing Structure

Each module contains its own tests.

Example:

```text
tests/

├── test_models.py
├── test_views.py
├── test_services.py
├── test_selectors.py
├── test_permissions.py
└── test_serializers.py
```

Testing should mirror the production code structure.

---

# Development Guidelines

- One responsibility per module.
- Keep views thin.
- Keep services focused.
- Reuse selectors for read operations.
- Avoid duplicated business logic.
- Maintain module boundaries.
- Follow consistent naming conventions.

---

# References

Depends On:

- 04-system-architecture/06-module-architecture.md
- 04-system-architecture/07-data-flow.md
- 06-api-design/04-versioning.md

Used By:

- 02-frontend-structure.md
- 03-security.md
- Backend Development

---

# Summary

The CareerOS backend is organized as a modular Django application following a layered architecture. Business logic resides in services, complex reads in selectors, and reusable functionality in shared packages. This structure promotes scalability, maintainability, clear module boundaries, and consistent development practices across the platform.