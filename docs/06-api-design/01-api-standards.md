# API Standards

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the API standards for CareerOS. It establishes consistent conventions for designing, implementing, and maintaining REST APIs across all backend modules.

Following these standards ensures predictable behavior, easier maintenance, improved developer experience, and long-term scalability.

---

# Scope

This document covers:

- API architecture
- URL conventions
- HTTP methods
- Request standards
- Response standards
- Naming conventions
- Authentication
- Pagination
- Filtering
- Validation

Detailed endpoint definitions are documented separately.

---

# API Architecture

CareerOS exposes RESTful APIs through Django REST Framework.

Architecture:

```text
Client

↓

REST API

↓

Authentication

↓

View

↓

Service Layer

↓

Database
```

Business logic must never reside inside API views.

---

# Base URL

All endpoints are versioned.

```text
/api/v1/
```

Examples:

```text
/api/v1/auth/
/api/v1/profile/
/api/v1/resumes/
/api/v1/applications/
```

---

# Resource Naming

Rules:

- Use plural nouns.
- Use lowercase.
- Use hyphens only when necessary.
- Avoid verbs in URLs.

Good examples:

```text
/resumes
/applications
/interviews
/notifications
```

Avoid:

```text
/getResume
/createApplication
/updateProfile
```

---

# HTTP Methods

| Method | Purpose |
|---------|----------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Replace resources |
| PATCH | Partial updates |
| DELETE | Remove resources |

---

# URL Structure

Collection

```text
GET /resumes
```

Single Resource

```text
GET /resumes/{id}
```

Create

```text
POST /resumes
```

Update

```text
PATCH /resumes/{id}
```

Delete

```text
DELETE /resumes/{id}
```

---

# Request Format

Requests use JSON.

Example:

```json
{
  "title": "Software Engineer Resume",
  "template": "modern"
}
```

Content Type:

```text
application/json
```

---

# Response Format

Successful responses follow a consistent structure.

Example:

```json
{
  "success": true,
  "message": "Resume created successfully.",
  "data": {
    "id": "uuid",
    "title": "Software Engineer Resume"
  }
}
```

---

# Empty Responses

Successful operations without response data:

```json
{
  "success": true,
  "message": "Operation completed successfully."
}
```

---

# Resource Identifiers

All public resources use UUIDs.

Example:

```text
/resumes/550e8400-e29b-41d4-a716-446655440000
```

Sequential integer IDs should never be exposed.

---

# Authentication

Protected endpoints require JWT authentication.

Example:

```text
Authorization: Bearer <access_token>
```

Authentication details are defined in the Authentication Architecture document.

---

# Authorization

Every request must verify:

- Authentication
- Resource ownership
- User permissions

Users may only access their own resources unless explicitly authorized.

---

# Pagination

Collection endpoints should support pagination.

Example:

```text
GET /applications?page=2&page_size=20
```

Response:

```json
{
  "count": 120,
  "next": "...",
  "previous": "...",
  "results": []
}
```

---

# Filtering

Collections may support filtering.

Example:

```text
GET /applications?status=interview
```

Multiple filters:

```text
GET /applications?status=offer&company=OpenAI
```

---

# Sorting

Sorting uses the `ordering` parameter.

Example:

```text
GET /applications?ordering=-applied_at
```

Supported directions:

- Ascending
- Descending (`-`)

---

# Searching

Search uses the `search` parameter.

Example:

```text
GET /jobs?search=python
```

Search should be limited to approved searchable fields.

---

# Validation

Input validation occurs at multiple layers:

```text
Request

↓

Serializer Validation

↓

Service Validation

↓

Database Constraints
```

Validation errors should return descriptive messages.

---

# Date & Time Format

All timestamps use ISO 8601.

Example:

```text
2026-07-30T09:45:00Z
```

Dates should use:

```text
YYYY-MM-DD
```

---

# Boolean Values

Use JSON booleans.

```json
true
false
```

Never use:

```text
1
0
Yes
No
```

---

# Null Values

Optional fields may return:

```json
null
```

Avoid empty strings for missing values unless required by business logic.

---

# File Uploads

File uploads should use:

```text
multipart/form-data
```

Large files should be stored in object storage, with only metadata persisted in PostgreSQL.

---

# API Documentation

Every endpoint should include:

- Purpose
- Authentication requirements
- Request schema
- Response schema
- Status codes
- Validation rules
- Example requests
- Example responses

---

# Security Standards

APIs should:

- Use HTTPS only.
- Validate all input.
- Authenticate protected routes.
- Authorize resource access.
- Prevent SQL injection.
- Prevent XSS through proper output handling.
- Apply rate limiting where appropriate.

---

# Performance Guidelines

- Paginate large collections.
- Avoid N+1 database queries.
- Cache frequently requested data.
- Minimize response payload size.
- Return only necessary fields.

---

# Best Practices

- Keep endpoints resource-oriented.
- Maintain consistent naming.
- Use appropriate HTTP methods.
- Return meaningful status codes.
- Keep responses predictable.
- Avoid exposing internal implementation details.
- Preserve backward compatibility within the same API version.

---

# References

Depends On:

- 04-system-architecture/07-data-flow.md
- 04-system-architecture/08-authentication-authorization.md
- 05-database-design/03-database-schema.md

Used By:

- 02-endpoint-specification.md
- Backend Development
- Frontend Development

---

# Summary

The CareerOS API Standards establish a consistent RESTful architecture using Django REST Framework. By standardizing URL conventions, request and response formats, authentication, pagination, validation, and security practices, the APIs remain predictable, scalable, and easy to integrate across all frontend and backend components.