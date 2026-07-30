# Database Schema

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the physical database schema for CareerOS. It specifies the primary database tables, their responsibilities, key columns, relationships, and constraints.

This document provides the foundation for implementing the PostgreSQL database.

---

# Scope

This document covers:

- Core database tables
- Primary keys
- Foreign keys
- Important columns
- Constraints
- Table ownership

Indexes are covered separately in **04-indexing-strategy.md**.

---

# Naming Conventions

## Tables

- Singular names
- Snake case

Examples:

- user
- career_profile
- resume
- application

---

## Columns

- Snake case
- Descriptive names
- Foreign keys end with `_id`

Examples

```text
user_id
resume_id
application_id
created_at
updated_at
```

---

# Common Columns

Most business tables include:

| Column | Type | Description |
|----------|------|-------------|
| id | UUID | Primary Key |
| created_at | Timestamp | Record creation |
| updated_at | Timestamp | Last update |

---

# User

Stores authentication and account information.

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| email | VARCHAR | Unique |
| password_hash | VARCHAR | Required |
| is_active | BOOLEAN | Default TRUE |
| is_verified | BOOLEAN | Default FALSE |
| last_login | TIMESTAMP | Nullable |
| created_at | TIMESTAMP | Required |
| updated_at | TIMESTAMP | Required |

Relationships

- One Career Profile
- Many Resumes
- Many Applications
- Many Notifications

---

# Career Profile

Stores professional information.

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| first_name | VARCHAR |
| last_name | VARCHAR |
| headline | VARCHAR |
| summary | TEXT |
| phone | VARCHAR |
| location | VARCHAR |
| website | VARCHAR |
| linkedin_url | VARCHAR |
| github_url | VARCHAR |

Relationship

```text
User (1)
↓

Career Profile (1)
```

---

# Education

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| institution | VARCHAR |
| degree | VARCHAR |
| field_of_study | VARCHAR |
| start_date | DATE |
| end_date | DATE |
| grade | VARCHAR |

Relationship

```text
User (1)

↓

Education (N)
```

---

# Experience

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| company | VARCHAR |
| designation | VARCHAR |
| employment_type | VARCHAR |
| location | VARCHAR |
| start_date | DATE |
| end_date | DATE |
| description | TEXT |

---

# Skill

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| name | VARCHAR |
| category | VARCHAR |
| proficiency | INTEGER |

---

# Project

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| title | VARCHAR |
| description | TEXT |
| technologies | JSONB |
| repository_url | VARCHAR |
| live_url | VARCHAR |

---

# Certification

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| title | VARCHAR |
| issuer | VARCHAR |
| issue_date | DATE |
| expiry_date | DATE |
| credential_url | VARCHAR |

---

# Resume

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| title | VARCHAR |
| template | VARCHAR |
| status | VARCHAR |
| latest_version_id | FK |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

Relationship

```text
User

↓

Resume

↓

Resume Version
```

---

# Resume Version

Stores every published version.

| Column | Type |
|----------|------|
| id | UUID |
| resume_id | FK |
| version_number | INTEGER |
| file_path | VARCHAR |
| change_summary | TEXT |
| created_at | TIMESTAMP |

---

# Resume Analysis

Stores AI-generated analysis.

| Column | Type |
|----------|------|
| id | UUID |
| resume_id | FK |
| score | INTEGER |
| strengths | JSONB |
| weaknesses | JSONB |
| recommendations | JSONB |
| analyzed_at | TIMESTAMP |

---

# Saved Job

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| company | VARCHAR |
| title | VARCHAR |
| location | VARCHAR |
| source | VARCHAR |
| url | VARCHAR |
| saved_at | TIMESTAMP |

---

# Application

Tracks every job application.

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| resume_id | FK |
| company | VARCHAR |
| position | VARCHAR |
| status | VARCHAR |
| applied_at | DATE |
| source | VARCHAR |

Relationship

```text
User

↓

Application

↓

Interview
```

---

# Interview

| Column | Type |
|----------|------|
| id | UUID |
| application_id | FK |
| round | VARCHAR |
| interview_type | VARCHAR |
| scheduled_at | TIMESTAMP |
| status | VARCHAR |
| notes | TEXT |

---

# Notification

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| type | VARCHAR |
| title | VARCHAR |
| message | TEXT |
| is_read | BOOLEAN |
| created_at | TIMESTAMP |

---

# User Settings

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| theme | VARCHAR |
| timezone | VARCHAR |
| language | VARCHAR |
| email_notifications | BOOLEAN |
| ai_preferences | JSONB |

---

# AI History

Stores AI interactions.

| Column | Type |
|----------|------|
| id | UUID |
| user_id | FK |
| feature | VARCHAR |
| provider | VARCHAR |
| model | VARCHAR |
| prompt_tokens | INTEGER |
| completion_tokens | INTEGER |
| total_tokens | INTEGER |
| status | VARCHAR |
| created_at | TIMESTAMP |

---

# Relationship Summary

| Parent | Child |
|----------|--------|
| User | Career Profile |
| User | Education |
| User | Experience |
| User | Skill |
| User | Project |
| User | Certification |
| User | Resume |
| Resume | Resume Version |
| Resume | Resume Analysis |
| User | Saved Job |
| User | Application |
| Application | Interview |
| User | Notification |
| User | User Settings |
| User | AI History |

---

# Constraints

The database should enforce:

- Primary Keys
- Foreign Keys
- Unique Email
- Required Foreign Key References
- Check Constraints where applicable
- Transaction Integrity

---

# Design Notes

- UUIDs should be used for all primary keys.
- Business entities remain module-specific.
- Files are stored in object storage; only metadata is stored in PostgreSQL.
- JSONB is used only for semi-structured data.
- Large binary data should never be stored in the database.

---

# References

Depends On:

- 01-database-design-overview.md
- 02-entity-relationship-diagram.md

Used By:

- 04-indexing-strategy.md
- API Design
- Backend Development

---

# Summary

The CareerOS database schema defines the physical structure of the application's core entities using PostgreSQL. It establishes standardized tables, relationships, keys, and constraints while maintaining a normalized, modular design aligned with the platform's architecture. This schema provides the foundation for implementing secure, scalable, and maintainable data persistence.