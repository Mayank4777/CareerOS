# Data Flow

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines how data flows throughout CareerOS, from user interactions in the frontend to backend processing, business services, database persistence, AI services, background workers, object storage, caching, and external integrations.

The objective is to establish a secure, predictable, and maintainable data flow across all system components while enforcing clear architectural boundaries.

---

# Scope

This document covers:

- Request lifecycle
- Frontend data flow
- Backend request processing
- Read and write operations
- Database interactions
- Cross-module communication
- AI processing
- Background jobs
- File management
- Notifications
- Caching
- Error handling
- External integrations

---

# Data Flow Principles

Every request in CareerOS follows these principles:

- Unidirectional request flow
- Stateless REST APIs
- Thin API layer
- Business logic resides only in Services
- Selectors perform read-only operations
- Modules communicate through Services
- Long-running operations execute asynchronously
- AI requests are centralized through the AI layer
- External services are accessed only through adapters
- Every request is authenticated and authorized

---

# High-Level Data Flow

```text
User

↓

React Frontend

↓

REST API

↓

Authentication

↓

Business Module

↓

Service Layer

↓

Database / Cache / Storage / AI

↓

Response

↓

Frontend UI
```

---

# Standard Request Lifecycle

Every API request follows the same processing pipeline.

```text
Client

↓

React Application

↓

HTTP Request

↓

Django REST API

↓

JWT Authentication

↓

Permission Check

↓

Serializer Validation

↓

Business Service

↓

Database

↓

Serializer

↓

HTTP Response

↓

Frontend Update
```

Each layer has a single responsibility and should never bypass another layer.

---

# Frontend Data Flow

The frontend manages user interaction and communicates with backend APIs.

```text
User Action

↓

React Component

↓

React Hook Form

↓

Zod Validation

↓

TanStack Query

↓

REST API
```

Responsibilities:

- Capture user input
- Client-side validation
- API communication
- Loading and error states
- Local UI state
- Server state synchronization

The frontend never communicates directly with the database, Redis, or AI providers.

---

# API Layer Flow

The API layer validates requests and delegates work to business services.

```text
HTTP Request

↓

APIView / ViewSet

↓

Authentication

↓

Permission Check

↓

Serializer

↓

Service Layer

↓

HTTP Response
```

Views remain thin and contain no business logic.

---

# Business Service Flow

Services coordinate business workflows.

```text
Service

↓

Business Validation

↓

Selector / Django ORM

↓

External Services (If Required)

↓

Return Result
```

Responsibilities:

- Execute business rules
- Coordinate transactions
- Call AI services
- Trigger background jobs
- Communicate with other modules

---

# Database Flow

Database access is controlled through Services.

### Read Operations

```text
Request

↓

Service

↓

Selector

↓

Django ORM

↓

PostgreSQL

↓

Response
```

Selectors are responsible for:

- Filtering
- Searching
- Sorting
- Pagination
- Aggregation

Selectors never modify data.

---

### Write Operations

```text
Request

↓

Service

↓

Business Validation

↓

Django ORM

↓

PostgreSQL

↓

Response
```

All create, update, and delete operations are coordinated by Services.

Views never access models directly.

---

# Cross-Module Communication

Modules communicate through Services instead of directly accessing another module's database.

```text
Applications Module

↓

Resume Service

↓

Resume Module
```

Not Allowed

```text
Applications Module

↓

Resume Models

↓

Database
```

This keeps modules loosely coupled and independently maintainable.

---

# Authentication Flow

Every protected request follows the same authentication pipeline.

```text
Request

↓

JWT Validation

↓

User Identification

↓

Permission Check

↓

Business Service
```

Requests that fail authentication are rejected before reaching business logic.

---

# AI Processing Flow

Business modules never communicate directly with AI providers.

```text
Business Module

↓

AI Orchestrator

↓

Prompt Manager

↓

Provider Adapter

↓

LLM Provider

↓

Response Formatter

↓

Business Module
```

Benefits:

- Provider independence
- Centralized prompt management
- Consistent response formatting
- Easier provider switching

---

# Resume Analysis Flow

```text
Resume Upload

↓

Validation

↓

Object Storage

↓

Database Metadata

↓

Celery Task

↓

AI Orchestrator

↓

Analysis Result

↓

Database

↓

Notification
```

Large AI operations never block user requests.

---

# Resume Generation Flow

```text
Career Profile

↓

Resume Service

↓

Template Engine

↓

AI Enhancement (Optional)

↓

PDF Generator

↓

Object Storage

↓

Secure Download URL
```

---

# Job Application Flow

```text
User

↓

Applications Module

↓

Application Service

↓

Business Validation

↓

Database

↓

Notification Task

↓

Response
```

---

# Interview Flow

```text
Schedule Interview

↓

Interview Module

↓

Database

↓

Reminder Task

↓

Notification Module

↓

Email / In-App Notification
```

---

# Notification Flow

Notifications are generated from business events.

```text
Business Event

↓

Notification Service

↓

Celery Queue

↓

Worker

↓

Email / In-App Notification

↓

Delivery Status
```

Notification delivery should never delay API responses.

---

# Background Processing Flow

Time-consuming operations execute asynchronously.

```text
API Request

↓

Create Celery Task

↓

Redis Queue

↓

Celery Worker

↓

Business Service

↓

Database

↓

Notification
```

Examples:

- Resume Analysis
- Cover Letter Generation
- Email Delivery
- Reminder Scheduling
- File Conversion
- Cleanup Tasks

---

# File Upload Flow

```text
User Upload

↓

Frontend

↓

REST API

↓

Validation

↓

Object Storage

↓

Database Metadata

↓

Response
```

Rules:

- Files are stored in object storage.
- PostgreSQL stores only metadata.
- Uploaded files are validated before storage.

---

# File Download Flow

```text
Download Request

↓

Authorization

↓

Generate Secure URL

↓

Object Storage

↓

Download
```

Storage credentials are never exposed to clients.

---

# Cache Flow

Redis improves performance for frequently accessed data.

### Cache Hit

```text
Request

↓

Redis

↓

Response
```

### Cache Miss

```text
Request

↓

Redis

↓

Database

↓

Redis

↓

Response
```

Common cache targets:

- Dashboard statistics
- User preferences
- Frequently accessed reference data

---

# Error Handling Flow

```text
Request

↓

Validation

↓

Business Service

↓

Exception

↓

Global Exception Handler

↓

Standard Error Response
```

All API errors follow a standardized response format.

---

# Transaction Flow

Critical operations execute within database transactions.

```text
Begin Transaction

↓

Business Operations

↓

Commit

↓

Response
```

On failure:

```text
Exception

↓

Rollback

↓

Error Response
```

This ensures data consistency.

---

# External Integration Flow

External services are isolated behind adapters.

```text
Business Module

↓

Adapter

↓

External Service

↓

Adapter

↓

Business Module
```

Examples:

- AI Providers
- Email Provider
- Object Storage
- OAuth Providers (Future)

This architecture prevents vendor lock-in.

---

# Security Rules

Every data flow must satisfy these requirements:

- Authenticate protected requests
- Authorize every resource
- Validate all inputs
- Encrypt sensitive data where applicable
- Never expose storage credentials
- Never expose AI provider credentials
- Sanitize uploaded files
- Log critical security events

---

# Best Practices

- Keep APIs stateless.
- Keep request flow unidirectional.
- Use Services for business logic.
- Use Selectors for complex read operations.
- Store files outside PostgreSQL.
- Execute heavy workloads with Celery.
- Keep modules independent.
- Standardize API responses.
- Handle failures gracefully.
- Prefer asynchronous processing for non-critical operations.

---

# References

Depends On:

- 01-system-architecture-overview.md
- 02-architecture-principles.md
- 03-technology-stack.md
- 04-development-standards.md
- 05-system-components.md
- 06-module-architecture.md

Used By:

- Authentication & Authorization
- AI Architecture
- Database Design
- API Design
- Backend Architecture

---

# Summary

CareerOS follows a service-oriented, unidirectional data flow where every request progresses through authentication, authorization, validation, business services, and controlled data access before generating a response. Database operations, AI processing, background jobs, caching, and external integrations are isolated behind dedicated architectural layers, ensuring the platform remains secure, scalable, maintainable, and consistent as it grows.