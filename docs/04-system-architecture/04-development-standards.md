# Development Standards

**Product:** CareerOS

**Document Version:** 1.0

**Status:** Approved

**Last Updated:** July 29, 2026

---

# Purpose

This document defines the engineering standards for the CareerOS codebase.

Every contributor—human or AI—must follow these standards to ensure consistency, maintainability, readability, and scalability.

Deviation from these standards requires an approved Architecture Decision Record (ADR).

---

# Core Philosophy

Write code for the next developer, not just for the compiler.

The codebase should prioritize:

- Readability
- Simplicity
- Consistency
- Testability
- Maintainability

A slightly longer but clearer implementation is preferred over clever or overly compact code.

---

# Project Structure

```
careeros/

backend/
frontend/
shared/
docs/
scripts/
docker/
.github/
```

No feature should exist outside its designated area.

---

# Backend Structure

```
backend/

apps/
config/
common/
media/
static/
tests/
requirements/
```

---

## Django Apps

Each business domain is an independent Django app.

Example:

```
apps/

authentication/
career_profile/
resume/
jobs/
applications/
interviews/
ai/
notifications/
settings/
```

Each app owns its models, services, serializers, views, permissions, and tests.

---

# Standard Django App Layout

```
resume/

models.py
views.py
serializers.py
urls.py
permissions.py
services.py
selectors.py
validators.py
signals.py
tasks.py
admin.py

tests/

migrations/
```

Business logic belongs inside **services.py**, not views.

Complex read queries belong in **selectors.py**.

---

# Frontend Structure

```
src/

components/
features/
layouts/
pages/
hooks/
services/
api/
types/
utils/
constants/
assets/
styles/
```

---

# Feature Organization

```
features/

resume/

components/

hooks/

services/

types/

pages/
```

Each feature should remain self-contained.

---

# Naming Conventions

## Files

Use:

```
resume-service.ts
resume-card.tsx
```

Avoid:

```
ResumeServiceFinal.ts
resumeNew.ts
```

---

## React Components

Use PascalCase.

Example:

```
ResumeCard
ApplicationTimeline
InterviewPanel
```

---

## Variables

camelCase

Example:

```
resumeScore
userProfile
jobApplication
```

---

## Functions

camelCase

Use verbs.

Examples:

```
calculateScore()

createResume()

sendEmail()

parseResume()
```

---

## Classes

PascalCase

Example:

```
ResumeService
StorageProvider
PromptManager
```

---

## Constants

UPPER_SNAKE_CASE

```
MAX_FILE_SIZE
DEFAULT_PAGE_SIZE
JWT_EXPIRATION
```

---

## Environment Variables

UPPER_SNAKE_CASE

```
DATABASE_URL

SECRET_KEY

REDIS_URL

OPENAI_API_KEY
```

Never hardcode secrets.

---

# API Standards

REST conventions.

Good:

```
GET

/api/resumes/
```

```
POST

/api/resumes/
```

```
GET

/api/resumes/{id}
```

Avoid verbs in URLs.

Bad:

```
/createResume
/deleteResume
/getAllResumes
```

---

# HTTP Status Codes

Use standard status codes.

Examples:

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Database Naming

Tables

snake_case

```
job_application
resume_version
career_profile
```

Columns

snake_case

```
created_at
updated_at
user_id
resume_score
```

Primary Key

```
id
```

Foreign Keys

```
user_id

resume_id

application_id
```

---

# Timestamp Fields

Every table should include:

```
created_at

updated_at
```

Optional:

```
deleted_at
```

for soft deletion where appropriate.

---

# Service Layer Rules

Services should:

- Contain business logic
- Be reusable
- Not depend on HTTP requests
- Be independently testable

Views should remain thin.

---

# Selector Rules

Selectors are read-only.

Responsibilities:

- Complex queries
- Reporting
- Aggregation
- Filtering

Selectors must never modify data.

---

# Validation Rules

Validation belongs in:

- Serializer
- Validator
- Domain Service

Never duplicate validation logic unnecessarily.

---

# Logging

Never use print().

Backend:

Python logging

Frontend:

Structured console logging only during development.

Sensitive information must never be logged.

---

# Error Handling

Every exception should be:

- Logged
- Classified
- Returned with a consistent API response

Avoid generic "Something went wrong" errors when a meaningful message can be provided safely.

---

# Git Branch Strategy

```
main

develop

feature/*

bugfix/*

hotfix/*
```

Examples:

```
feature/resume-parser

feature/job-tracker

bugfix/login-validation
```

---

# Commit Message Convention

Format:

```
type(scope): summary
```

Examples:

```
feat(resume): add resume parser

fix(auth): refresh token issue

docs(api): update endpoint documentation

refactor(ai): simplify provider abstraction
```

Types:

- feat
- fix
- docs
- refactor
- style
- test
- chore

---

# Documentation Rules

Every major feature requires:

- Architecture update
- API documentation
- Database documentation
- User documentation (if applicable)

Documentation is part of the feature, not an afterthought.

---

# Code Review Checklist

Before merging:

- Follows naming conventions
- Business logic isolated
- Tests included
- Documentation updated
- No duplicated logic
- Security considered
- Logging implemented
- Error handling complete

---

# AI Coding Rules

When using AI-assisted development:

- Generate production-ready code
- Do not accept generated code without review
- Verify security implications
- Follow project naming conventions
- Reuse existing services and components
- Never introduce new architectural patterns without approval

---

# Performance Guidelines

Avoid:

- N+1 queries
- Unnecessary re-renders
- Duplicate API calls
- Large payloads
- Deep component nesting

Optimize only when justified by profiling or known bottlenecks.

---

# Security Standards

Always:

- Validate input
- Escape output where required
- Use parameterized queries
- Protect secrets
- Enforce permissions
- Use HTTPS
- Sanitize uploaded files

Never:

- Store plaintext passwords
- Expose internal errors
- Trust client-side validation
- Commit secrets to version control

---

# Testing Standards

Every new feature should include:

- Unit tests
- Integration tests (where applicable)
- API tests (for backend endpoints)

Critical workflows should eventually include end-to-end tests.

---

# References

## Depends On

- 01-system-architecture-overview.md
- 02-architecture-principles.md
- 03-technology-stack.md

## Used By

All implementation documents and source code.

---

# Summary

These development standards establish a consistent engineering approach for CareerOS. By standardizing project structure, naming, APIs, database conventions, testing, documentation, and code review practices, the project remains maintainable as it grows and enables both human developers and AI coding assistants to contribute predictably and safely.