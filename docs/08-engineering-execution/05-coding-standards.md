# Coding Standards

## Purpose

This document defines the coding standards for CareerOS.

Its purpose is to ensure that all contributors and AI coding agents produce consistent, maintainable, secure, and production-ready code.

These standards apply to the entire codebase.

---

# General Principles

Every piece of code should be:

- Simple
- Readable
- Modular
- Reusable
- Testable
- Maintainable
- Consistent

Code should optimize for long-term maintainability rather than short-term convenience.

---

# Clean Code Principles

Always:

- Write self-explanatory code.
- Prefer readability over cleverness.
- Keep functions focused on a single responsibility.
- Avoid deep nesting.
- Keep modules independent.
- Remove dead code immediately.
- Refactor duplicated logic into reusable abstractions.

Never:

- Leave commented-out code.
- Commit debugging statements.
- Introduce unnecessary complexity.
- Use magic numbers or hardcoded values without explanation.

---

# Naming Conventions

## Variables

Use meaningful names.

Good:

```python
user_profile
resume_version
application_status
```

Avoid:

```python
data
obj
temp
value
```

---

## Functions

Use verbs.

Examples:

```python
create_resume()
update_profile()
send_notification()
calculate_score()
```

---

## Classes

Use PascalCase.

Examples:

```python
ResumeService
ApplicationSerializer
CareerProfileView
```

---

## Files

Use lowercase with underscores.

Examples:

```text
resume_service.py
career_profile.py
notification_tasks.py
```

---

# Backend Standards

## Project Structure

Business logic belongs only in:

- Services

Data retrieval belongs only in:

- Selectors

HTTP handling belongs only in:

- Views

Validation belongs in:

- Serializers
- Validators

Database logic belongs in:

- Models

---

## Views

Views should only:

- Validate request
- Check permissions
- Call services
- Return responses

Views must not contain business logic.

---

## Services

Services should:

- Implement business rules.
- Coordinate database operations.
- Call external services.
- Handle transactions.

Services should not return HTTP responses.

---

## Selectors

Selectors:

- Read data only.
- Never modify data.
- Never trigger side effects.

---

## Models

Models should:

- Represent database entities.
- Keep methods lightweight.
- Avoid business workflows.

---

# Frontend Standards

## Components

Components should be:

- Small
- Reusable
- Focused on one responsibility

Avoid components that manage unrelated concerns.

---

## State Management

Use:

- TanStack Query for server state
- Local state for UI state

Avoid unnecessary global state.

---

## Forms

Use:

- React Hook Form
- Zod validation

Validation should never be duplicated.

---

## API Layer

All API communication must go through the centralized API client.

Components must never call HTTP libraries directly.

---

# Error Handling

Always:

- Handle expected failures.
- Return meaningful messages.
- Log unexpected errors.
- Fail gracefully.

Never expose internal implementation details to users.

---

# Logging

Log:

- Critical failures
- Authentication events
- Background task failures
- External service failures

Do not log:

- Passwords
- Tokens
- Sensitive personal information

---

# Database Standards

- Use UUID primary keys.
- Use foreign keys for relationships.
- Apply indexes where appropriate.
- Use migrations for every schema change.
- Never modify production schema manually.

---

# API Standards

Follow the API Design documentation.

Every endpoint should:

- Validate input
- Authenticate user
- Authorize access
- Return standard responses
- Use correct HTTP status codes

---

# Security Standards

Every feature should:

- Validate input.
- Check permissions.
- Sanitize user-provided data.
- Protect sensitive information.
- Follow the project's authentication model.

---

# Performance Standards

Avoid:

- N+1 database queries
- Duplicate API calls
- Unnecessary re-renders
- Large synchronous operations

Prefer:

- Pagination
- Query optimization
- Lazy loading
- Caching where appropriate

---

# Testing Standards

Every new feature should include appropriate tests.

Existing tests must continue to pass.

No feature should reduce overall code quality.

---

# Code Review Checklist

Before submitting code:

- Code follows project architecture.
- Naming conventions are followed.
- No duplicated logic exists.
- Error handling is complete.
- Tests pass.
- Linting passes.
- Formatting passes.
- Documentation updated if required.

---

# AI Coding Agent Rules

AI coding agents must:

- Follow the documented architecture.
- Never redesign modules without approval.
- Never introduce new libraries without approval.
- Reuse existing components before creating new ones.
- Keep implementations incremental.
- Stop and request clarification if documentation is ambiguous.

---

# Summary

The goal of these standards is not to restrict development but to ensure that CareerOS remains clean, scalable, and maintainable as it grows.

Consistency is more valuable than individual coding preferences.