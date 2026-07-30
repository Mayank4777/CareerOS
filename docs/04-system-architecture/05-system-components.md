# System Components

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

Defines the major components of CareerOS, their responsibilities, and interactions.

---

# System Overview

```
                React Frontend
                      │
              Django REST API
                      │
 ┌────────────┬─────────────┬────────────┐
 │            │             │            │
Auth      Career Core    AI Engine   Notifications
 │            │             │            │
 └────────────┴─────────────┴────────────┘
                      │
               Background Jobs
                      │
      PostgreSQL  Redis  Object Storage
                      │
            External AI Providers
```

---

# Components

## Frontend

Responsibilities:

- UI
- Routing
- Forms
- State Management
- API Communication

Technology:

- React
- TypeScript
- Tailwind CSS

---

## API Layer

Responsibilities:

- REST Endpoints
- Validation
- Authentication
- Authorization
- Serialization

Technology:

- Django REST Framework

---

## Authentication

Responsibilities:

- Login
- Registration
- JWT
- Refresh Tokens
- Password Reset
- Permissions

---

## Career Profile

Responsibilities:

- Personal Information
- Skills
- Experience
- Education
- Career Goals

---

## Resume Module

Responsibilities:

- Resume CRUD
- Resume Versions
- Resume Export
- Resume Analysis
- Resume Templates

---

## Jobs Module

Responsibilities:

- Saved Jobs
- Job Tracking
- Status Management
- Search Metadata

---

## Applications Module

Responsibilities:

- Application Tracking
- Timeline
- Notes
- Documents

---

## Interview Module

Responsibilities:

- Interview Schedule
- Interview Notes
- Feedback
- Preparation

---

## AI Engine

Responsibilities:

- Resume Review
- Skill Gap Analysis
- Career Recommendations
- Prompt Orchestration
- Provider Management

Uses:

- OpenAI
- Gemini
- Anthropic
- Ollama

---

## Notification Module

Responsibilities:

- In-App Notifications
- Email Notifications
- Future Push Notifications

---

## Storage Layer

Stores:

- Resumes
- Documents
- Images
- Generated Files

Uses:

- S3-Compatible Storage

---

## Database

Technology:

- PostgreSQL

Stores:

- User Data
- Career Data
- Jobs
- Applications
- Interviews
- AI Metadata

---

## Cache

Technology:

- Redis

Uses:

- Caching
- Sessions
- Rate Limiting
- Celery Broker

---

## Background Workers

Technology:

- Celery

Processes:

- AI Analysis
- Emails
- File Processing
- Scheduled Jobs

---

## External Services

Examples:

- AI Providers
- Email Provider
- Object Storage
- OAuth Providers (Future)

---

# Communication Rules

- Frontend communicates only with REST APIs.
- Modules communicate through services.
- Long-running tasks use Celery.
- External services are accessed through adapters.
- Modules never access another module's database directly.

---

# Component Dependencies

```
Frontend
    ↓
REST API
    ↓
Business Modules
    ↓
Infrastructure Services
    ↓
External Providers
```

---

# Design Principles

- Loose Coupling
- High Cohesion
- Stateless APIs
- Dependency Injection
- Infrastructure Abstraction
- Module Isolation

---

# References

Depends On:

- 01-system-architecture-overview.md
- 02-architecture-principles.md
- 03-technology-stack.md
- 04-development-standards.md

Used By:

- Module Architecture
- API Architecture
- AI Architecture
- Database Design

---

# Summary

CareerOS consists of independent business modules connected through a REST API and shared infrastructure. Each component has a single responsibility, communicates through defined interfaces, and remains loosely coupled to support future scalability.