# Endpoint Specification

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the REST API endpoints for CareerOS. It specifies the available resources, supported operations, authentication requirements, and expected request and response behaviors for each module.

Detailed request and response schemas are implemented using Django REST Framework serializers.

---

# Scope

This document covers:

- Authentication APIs
- Career Profile APIs
- Resume APIs
- Job APIs
- Application APIs
- Interview APIs
- AI APIs
- Notification APIs
- Settings APIs

---

# API Base URL

```text
/api/v1/
```

---

# Authentication

Base Path

```text
/api/v1/auth/
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | /register | Register a new user | No |
| POST | /login | Authenticate user | No |
| POST | /refresh | Refresh access token | Yes |
| POST | /logout | Logout current session | Yes |
| POST | /forgot-password | Request password reset | No |
| POST | /reset-password | Reset password | No |
| GET | /me | Get authenticated user | Yes |

---

# Career Profile

Base Path

```text
/api/v1/profile/
```

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | / | Get profile | Yes |
| POST | / | Create profile | Yes |
| PATCH | / | Update profile | Yes |
| DELETE | / | Delete profile | Yes |

---

# Education

Base Path

```text
/api/v1/education/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| GET | /{id} |
| PATCH | /{id} |
| DELETE | /{id} |

Authentication required for all endpoints.

---

# Experience

Base Path

```text
/api/v1/experience/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| GET | /{id} |
| PATCH | /{id} |
| DELETE | /{id} |

---

# Skills

Base Path

```text
/api/v1/skills/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| PATCH | /{id} |
| DELETE | /{id} |

---

# Projects

Base Path

```text
/api/v1/projects/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| GET | /{id} |
| PATCH | /{id} |
| DELETE | /{id} |

---

# Certifications

Base Path

```text
/api/v1/certifications/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| GET | /{id} |
| PATCH | /{id} |
| DELETE | /{id} |

---

# Resume

Base Path

```text
/api/v1/resumes/
```

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | List resumes |
| POST | / | Create resume |
| GET | /{id} | Get resume |
| PATCH | /{id} | Update resume |
| DELETE | /{id} | Delete resume |

---

## Resume Versions

```text
/api/v1/resumes/{id}/versions/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| GET | /{version_id} |

---

## Resume Analysis

```text
/api/v1/resumes/{id}/analysis/
```

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | / | Generate AI analysis |
| GET | / | Retrieve latest analysis |

---

# Jobs

Base Path

```text
/api/v1/jobs/
```

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | List jobs |
| GET | /{id} | Job details |
| GET | /search | Search jobs |

---

# Saved Jobs

```text
/api/v1/saved-jobs/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| DELETE | /{id} |

---

# Applications

Base Path

```text
/api/v1/applications/
```

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | List applications |
| POST | / | Create application |
| GET | /{id} | Get application |
| PATCH | /{id} | Update application |
| DELETE | /{id} | Delete application |

---

# Interviews

Base Path

```text
/api/v1/interviews/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| POST | / |
| GET | /{id} |
| PATCH | /{id} |
| DELETE | /{id} |

---

# AI Coach

Base Path

```text
/api/v1/ai/
```

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /resume-analysis | Analyze resume |
| POST | /cover-letter | Generate cover letter |
| POST | /career-advice | Career recommendations |
| POST | /interview-feedback | Interview evaluation |
| GET | /history | AI usage history |

---

# Notifications

Base Path

```text
/api/v1/notifications/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| PATCH | /{id}/read |
| PATCH | /read-all |
| DELETE | /{id} |

---

# User Settings

Base Path

```text
/api/v1/settings/
```

| Method | Endpoint |
|---------|----------|
| GET | / |
| PATCH | / |

---

# Common Query Parameters

Pagination

```text
?page=1&page_size=20
```

Filtering

```text
?status=active
```

Searching

```text
?search=python
```

Sorting

```text
?ordering=-created_at
```

Multiple parameters may be combined.

Example:

```text
GET /applications?status=interview&ordering=-applied_at&page=1&page_size=20
```

---

# Authentication Requirements

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

Public endpoints:

- Register
- Login
- Forgot Password
- Reset Password

All other endpoints require authentication.

---

# Standard Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# Endpoint Design Principles

- Resource-oriented URLs
- Consistent naming
- RESTful operations
- UUID-based identifiers
- Predictable response structures
- Stateless requests
- Module isolation
- Backward-compatible versioning

---

# Future Endpoints

The following endpoints may be introduced in future releases:

- OAuth integrations
- Calendar integrations
- Email integrations
- AI chat sessions
- Resume sharing
- Team collaboration
- Admin APIs
- Analytics APIs

These are outside the current MVP scope.

---

# References

Depends On:

- 01-api-standards.md
- 04-system-architecture/06-module-architecture.md

Used By:

- 03-error-handling.md
- Frontend Development
- Backend Development

---

# Summary

The CareerOS endpoint specification defines a consistent RESTful API organized around business modules. Each resource exposes standardized CRUD operations, secure authentication, and predictable behaviors, providing a scalable interface between the frontend, backend services, and AI capabilities.   