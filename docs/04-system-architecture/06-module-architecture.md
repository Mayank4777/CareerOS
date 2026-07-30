# Module Architecture

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the internal architecture of each business module in CareerOS, establishes module boundaries, and specifies how modules communicate with each other.

The objective is to keep the application modular, maintainable, and scalable while remaining a Modular Monolith.

---

# Architecture Style

CareerOS follows a **Modular Monolith** architecture.

Each business domain is implemented as an independent Django application with its own models, business logic, API endpoints, permissions, and tests.

Modules communicate through service interfaces rather than direct database access.

---

# Business Modules

| Module | Responsibility |
|----------|----------------|
| Authentication | User authentication, authorization, roles |
| Career Profile | Personal, education, skills, experience |
| Resume | Resume management and analysis |
| Jobs | Saved jobs and job metadata |
| Applications | Job application lifecycle |
| Interviews | Interview scheduling and tracking |
| AI Coach | AI recommendations and analysis |
| Notifications | User notifications |
| Settings | User preferences and account settings |

---

# Standard Module Structure

Every module follows the same directory structure.

```text
module_name/

migrations/
tests/

__init__.py
admin.py
apps.py
models.py
views.py
serializers.py
urls.py
permissions.py
services.py
selectors.py
validators.py
tasks.py
signals.py
```

Optional files may be added when required, but the structure should remain consistent across all modules.

---

# Module Responsibilities

## Models

Responsible for:

- Database entities
- Relationships
- Field definitions

Models should contain only lightweight business logic.

---

## Views

Responsible for:

- Receiving HTTP requests
- Calling services
- Returning API responses

Views must remain thin.

---

## Serializers

Responsible for:

- Request validation
- Response serialization
- Data transformation

Business rules should not be implemented here.

---

## Services

Responsible for:

- Business logic
- Workflows
- Transactions
- Cross-module coordination

This is the core of each module.

---

## Selectors

Responsible for:

- Read-only queries
- Reporting
- Filtering
- Aggregation

Selectors must never modify data.

---

## Validators

Responsible for:

- Custom validation
- Business constraints
- Reusable validation logic

---

## Permissions

Responsible for:

- Authorization
- Resource access
- Role-based permissions

---

## Tasks

Responsible for:

- Background jobs
- AI processing
- Email sending
- Scheduled tasks

Executed using Celery.

---

## Signals

Responsible for:

- Internal module events
- Lightweight automation

Signals should not contain complex business logic.

---

# Module Independence

Each module owns:

- Database models
- Business rules
- Services
- Permissions
- API endpoints
- Tests

Other modules must not manipulate another module's models directly.

---

# Cross-Module Communication

Communication occurs through service methods.

Example:

```text
Applications

↓

Resume Service

↓

Resume Module
```

Avoid:

```text
Applications

↓

Resume Database Tables
```

Modules should never bypass another module's service layer.

---

# Shared Components

Shared functionality belongs in a common package.

Examples:

```text
common/

authentication/
storage/
email/
pagination/
exceptions/
permissions/
utils/
constants/
```

Shared code should remain generic and independent of business domains.

---

# Dependency Rules

Allowed:

```text
View

↓

Service

↓

Selector / Model
```

Not Allowed:

```text
View

↓

Model
```

or

```text
Module A

↓

Module B Database
```

---

# Module Lifecycle

A typical request follows this flow.

```text
Client

↓

View

↓

Serializer

↓

Service

↓

Selector / Model

↓

Database

↓

Response
```

Long-running operations are delegated to background tasks.

---

# AI Integration

Business modules do not call AI providers directly.

Flow:

```text
Resume Module

↓

AI Service

↓

Provider Adapter

↓

OpenAI / Gemini / Ollama
```

This keeps AI implementation centralized and provider-independent.

---

# Background Processing

Tasks suitable for asynchronous execution include:

- Resume analysis
- AI recommendations
- Email delivery
- File processing
- Notification delivery

All background work is handled through Celery.

---

# Module Design Principles

Every module should:

- Have a single responsibility
- Be independently testable
- Minimize dependencies
- Expose clear APIs
- Follow consistent structure
- Avoid duplicated business logic

---

# Future Expansion

New modules should follow the same architecture without modifying existing modules.

Examples:

- Portfolio
- Learning
- Recruiter
- University
- Billing

Each new module becomes another independent Django app.

---

# References

Depends On:

- 01-system-architecture-overview.md
- 02-architecture-principles.md
- 03-technology-stack.md
- 04-development-standards.md
- 05-system-components.md

Used By:

- Database Design
- API Design
- Backend Development

---

# Summary

CareerOS organizes functionality into independent business modules following a consistent architecture. Each module encapsulates its own data, business logic, APIs, and permissions while communicating through service interfaces. This approach keeps the codebase modular, maintainable, and scalable without introducing the complexity of microservices.