# Error Handling

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the standard error handling strategy for all CareerOS APIs. It ensures that every API returns predictable, secure, and developer-friendly error responses.

A consistent error handling strategy improves debugging, frontend integration, monitoring, and overall user experience.

---

# Scope

This document covers:

- HTTP status codes
- Error response format
- Validation errors
- Authentication errors
- Authorization errors
- Business logic errors
- AI service errors
- Logging
- Error handling best practices

---

# Design Principles

CareerOS error handling follows these principles:

- Errors must be consistent.
- Responses must be predictable.
- Internal implementation details must never be exposed.
- Error messages should help developers fix problems.
- Sensitive information must never appear in responses.
- Every error should be logged appropriately.

---

# Standard Error Response

Every failed request returns the following structure.

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "email": [
            "This field is required."
        ]
    }
}
```

Fields:

| Field | Description |
|--------|-------------|
| success | Always false |
| message | Human-readable summary |
| errors | Field-level or detailed errors |

---

# Success Response

Successful requests use:

```json
{
    "success": true,
    "message": "Resume created successfully.",
    "data": {}
}
```

---

# HTTP Status Codes

| Status Code | Meaning |
|-------------|----------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 409 | Conflict |
| 422 | Validation Failed |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

# Validation Errors

Validation errors occur when request data is invalid.

Example:

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "title": [
            "This field is required."
        ],
        "email": [
            "Invalid email address."
        ]
    }
}
```

---

# Authentication Errors

Occurs when authentication fails.

Status Code

```text
401 Unauthorized
```

Example:

```json
{
    "success": false,
    "message": "Authentication credentials were not provided."
}
```

---

# Authorization Errors

Occurs when the authenticated user lacks permission.

Status Code

```text
403 Forbidden
```

Example:

```json
{
    "success": false,
    "message": "You do not have permission to access this resource."
}
```

---

# Resource Not Found

Occurs when the requested resource does not exist.

Status Code

```text
404 Not Found
```

Example:

```json
{
    "success": false,
    "message": "Resume not found."
}
```

---

# Duplicate Resource

Occurs when a unique constraint is violated.

Status Code

```text
409 Conflict
```

Example:

```json
{
    "success": false,
    "message": "An account with this email already exists."
}
```

---

# Business Logic Errors

Business rule violations should return meaningful messages.

Example:

```json
{
    "success": false,
    "message": "Resume cannot be deleted because it is linked to an active application."
}
```

---

# AI Service Errors

AI-related failures should not expose provider-specific details.

Possible situations:

- Provider unavailable
- Rate limit exceeded
- Timeout
- Invalid model response

Example:

```json
{
    "success": false,
    "message": "AI service is temporarily unavailable. Please try again later."
}
```

---

# Rate Limiting

Requests exceeding allowed limits return:

Status Code

```text
429 Too Many Requests
```

Example:

```json
{
    "success": false,
    "message": "Too many requests. Please try again later."
}
```

---

# Internal Server Errors

Unexpected server failures return:

Status Code

```text
500 Internal Server Error
```

Example:

```json
{
    "success": false,
    "message": "An unexpected error occurred."
}
```

Stack traces, SQL errors, or internal exception details must never be returned to clients.

---

# Error Logging

The backend should log:

- Timestamp
- Request path
- HTTP method
- User ID (if authenticated)
- Exception type
- Error message
- Stack trace
- Request ID

Sensitive information such as passwords, tokens, and personal data must never be logged.

---

# Exception Flow

```text
Client Request
        │
        ▼
APIView
        │
        ▼
Serializer Validation
        │
        ▼
Service Layer
        │
        ▼
Database / External Services
        │
        ▼
Exception Raised
        │
        ▼
Global Exception Handler
        │
        ▼
Standard Error Response
```

All unhandled exceptions should pass through a centralized exception handler.

---

# Custom Exception Types

CareerOS may define custom exceptions such as:

- ValidationException
- AuthenticationException
- AuthorizationException
- ResourceNotFoundException
- ConflictException
- AIServiceException
- BusinessRuleException

Each exception should map to an appropriate HTTP status code.

---

# Client Guidelines

Frontend applications should:

- Display user-friendly messages.
- Handle validation errors per field.
- Retry transient failures when appropriate.
- Redirect users after authentication failures.
- Avoid exposing raw backend messages directly to end users.

---

# Monitoring

Production systems should monitor:

- 500 error frequency
- API failure rate
- AI provider failures
- Authentication failures
- Slow requests
- Validation error trends

Monitoring supports faster issue detection and operational stability.

---

# Best Practices

- Return consistent response structures.
- Use appropriate HTTP status codes.
- Keep messages concise and meaningful.
- Do not expose implementation details.
- Log enough information for debugging.
- Validate input before business logic execution.
- Centralize exception handling.

---

# References

Depends On:

- 01-api-standards.md
- 02-endpoint-specification.md

Used By:

- 04-versioning.md
- Backend Development
- Frontend Development
- Monitoring & Observability

---

# Summary

The CareerOS error handling strategy standardizes API error responses, HTTP status codes, validation behavior, and exception management. By using centralized error handling, secure messaging, and comprehensive logging, the platform provides a reliable developer experience while protecting sensitive implementation details and supporting effective monitoring.