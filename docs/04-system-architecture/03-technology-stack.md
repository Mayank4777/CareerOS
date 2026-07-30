# Technology Stack

**Product:** CareerOS

**Document Version:** 1.0

**Status:** Approved

**Last Updated:** July 29, 2026

---

# Purpose

This document defines the official technology stack for CareerOS.

It serves as the single source of truth for all technologies used throughout the project, including frontend, backend, infrastructure, AI, development tools, testing, deployment, and DevOps.

Only technologies listed in this document are considered officially supported unless a new Architecture Decision Record (ADR) approves a change.

---

# Technology Selection Principles

Technologies are selected based on the following criteria:

1. Long-term maintainability
2. Strong community support
3. Production maturity
4. Excellent documentation
5. Security
6. Scalability
7. Developer productivity
8. AI ecosystem compatibility
9. Cloud compatibility
10. Active maintenance

Popularity alone is **not** a selection criterion.

---

# High-Level Stack

```
Frontend

React
TypeScript
Tailwind CSS

↓

REST API

↓

Django REST Framework

↓

Business Services

↓

PostgreSQL

↓

Redis

↓

Celery

↓

Object Storage

↓

AI Providers

↓

Docker

↓

Cloud Infrastructure
```

---

# Frontend

## Framework

**React**

Reason:

- Industry standard
- Component architecture
- Excellent ecosystem
- Large community
- Easy scalability

---

## Language

**TypeScript**

Reason:

- Type safety
- Better IDE support
- Fewer runtime bugs
- Easier refactoring
- Better maintainability

JavaScript is not allowed for application logic.

---

## Styling

**Tailwind CSS**

Reason:

- Utility-first
- Fast development
- Consistent design
- Easy customization
- Works well with design tokens

---

## Component Strategy

Custom reusable component library.

No dependency on large UI frameworks.

Small utility libraries may be used when justified.

---

## State Management

React Context

+

TanStack Query

Reasons:

React Context

- Authentication
- Theme
- Global UI state

TanStack Query

- Server state
- API caching
- Background refetching
- Optimistic updates

Avoid Redux unless future complexity requires it.

---

## Forms

React Hook Form

Reasons:

- Performance
- Minimal re-rendering
- Excellent validation integration

---

## Validation

Zod

Reasons:

- Type-safe
- Simple
- Shared schemas
- Excellent TypeScript support

---

## Routing

React Router

Reasons:

- Mature
- Flexible
- Widely adopted

---

# Backend

## Framework

Django

Reasons:

- Mature
- Secure
- Excellent ORM
- Admin interface
- Authentication
- Scalable
- Strong Python ecosystem

---

## API Framework

Django REST Framework

Reasons:

- Serialization
- Authentication
- Permissions
- Browsable API
- Pagination
- Validation

---

## Programming Language

Python

Reasons:

- AI ecosystem
- Readability
- Developer productivity
- Excellent libraries

---

# Database

## Primary Database

PostgreSQL

Reasons:

- ACID compliance
- JSON support
- Full-text search
- Excellent indexing
- Mature ecosystem

---

## ORM

Django ORM

Reasons:

- Mature
- Migration support
- Excellent relationships
- Easy maintenance

Raw SQL should only be used for performance-critical queries.

---

# Caching

Redis

Uses:

- Cache
- Sessions
- Background jobs
- Rate limiting
- Temporary data

---

# Background Processing

Celery

Reasons:

- Mature
- Reliable
- Works perfectly with Django

Examples:

- Resume analysis
- AI requests
- Email sending
- Notifications
- Scheduled jobs

---

# Storage

Object Storage

S3-compatible.

Examples:

- AWS S3
- Cloudflare R2
- MinIO
- DigitalOcean Spaces

Storage implementation should remain provider-independent.

---

# Authentication

JWT

Access Token

Refresh Token

Future support:

- Google Login
- GitHub Login
- LinkedIn Login

---

# AI Layer

Provider abstraction architecture.

Supported providers:

- OpenAI
- Google Gemini
- Anthropic
- Ollama

Business modules communicate only with the AI Service Layer.

---

# API Style

REST API

Reasons:

- Simplicity
- Mature ecosystem
- Easy frontend integration

GraphQL is intentionally excluded from the MVP.

---

# Search

PostgreSQL Full Text Search

Future:

ElasticSearch or OpenSearch when required.

---

# Email

SMTP abstraction.

Future providers:

- SendGrid
- Amazon SES
- Mailgun

---

# File Processing

Libraries may include:

- PyMuPDF
- pdfplumber
- Pillow
- python-docx

Final selection depends on module requirements.

---

# Logging

Python logging

Structured logging

Future:

OpenTelemetry

---

# Monitoring

Sentry

Application errors

Future:

Prometheus

Grafana

---

# Testing

Backend

pytest

Frontend

Vitest

React Testing Library

End-to-End

Playwright

---

# Package Managers

Frontend

npm

Backend

pip

Future:

uv (after evaluation)

---

# Containerization

Docker

Docker Compose

Reasons:

- Reproducible development
- Easy deployment
- Environment consistency

---

# Reverse Proxy

Nginx

Responsibilities:

- SSL termination
- Static assets
- Reverse proxy
- Compression

---

# CI/CD

GitHub Actions

Responsibilities:

- Build
- Test
- Lint
- Security checks
- Deployment

---

# Version Control

Git

Hosting

GitHub

---

# Documentation

Markdown

Stored inside

```
docs/
```

Architecture documentation remains version-controlled.

---

# Development Environment

Recommended

VS Code

Required

Python

Node.js

Docker Desktop

Git

PostgreSQL

Redis

---

# Code Quality

Frontend

ESLint

Prettier

Backend

Black

isort

Ruff

---

# Security

Dependency scanning

Secret management

HTTPS

JWT

Environment variables

Security headers

---

# Infrastructure

Cloud provider should remain abstract.

Supported platforms:

- AWS
- Azure
- GCP
- DigitalOcean

No cloud vendor lock-in.

---

# Future Technologies

Potential future additions:

- Elasticsearch
- OpenSearch
- Kafka
- RabbitMQ
- Kubernetes
- Terraform
- Feature Flags
- Vector Database
- AI Agent Framework
- WebSockets

These are intentionally excluded from the MVP.

---

# Technologies Explicitly Rejected

For MVP:

❌ Microservices

Reason:

Operational complexity outweighs benefits.

---

❌ GraphQL

Reason:

REST sufficiently satisfies MVP requirements.

---

❌ Redux

Reason:

TanStack Query + Context are adequate.

---

❌ MongoDB

Reason:

CareerOS has highly relational data and benefits from PostgreSQL's transactional capabilities.

---

❌ Server-Side Rendering

Reason:

The application is an authenticated dashboard rather than a content-driven website.

---

❌ Multiple Backend Languages

Reason:

A single backend language simplifies development and maintenance.

---

# Technology Compatibility Matrix

| Area | Technology |
|--------|------------|
| Frontend | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| Validation | Zod |
| Routing | React Router |
| Server State | TanStack Query |
| Backend | Django |
| API | Django REST Framework |
| Language | Python |
| Database | PostgreSQL |
| ORM | Django ORM |
| Cache | Redis |
| Queue | Celery |
| Storage | S3-Compatible Storage |
| Authentication | JWT |
| AI | Provider Abstraction Layer |
| Testing | pytest / Vitest / Playwright |
| Monitoring | Sentry |
| Reverse Proxy | Nginx |
| Containerization | Docker |
| CI/CD | GitHub Actions |

---

# References

## Depends On

- 01-system-architecture-overview.md
- 02-architecture-principles.md

## Used By

- Module Architecture
- Database Design
- API Design
- AI Architecture
- Deployment Architecture
- DevOps Documentation

---

# Summary

CareerOS adopts a modern, production-ready technology stack centered around React, Django, PostgreSQL, Redis, and Docker. Each technology has been selected based on maturity, maintainability, ecosystem strength, and long-term scalability rather than short-term popularity. This stack provides a strong foundation for an AI-first SaaS platform while minimizing unnecessary complexity and vendor lock-in.