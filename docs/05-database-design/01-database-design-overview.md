# Database Design Overview

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the database architecture and design principles used throughout CareerOS. It establishes how data is organized, related, stored, and maintained to ensure consistency, scalability, and long-term maintainability.

---

# Scope

This document covers:

- Database architecture
- Design principles
- Data organization
- Entity ownership
- Relationships
- Data integrity
- Performance considerations
- Scalability strategy

Detailed schemas and ER diagrams are covered in subsequent documents.

---

# Database Technology

CareerOS uses:

**Database Management System**

- PostgreSQL

Reasons for selection:

- ACID compliance
- Strong relational capabilities
- Excellent indexing support
- JSON support
- Mature ecosystem
- High reliability
- Scalability

---

# Database Architecture

```text
Business Modules

↓

Service Layer

↓

Django ORM

↓

PostgreSQL
```

Business modules never communicate directly with the database.

All database operations are coordinated through the Service Layer.

---

# Design Principles

The database follows these principles:

- Normalize business data
- Avoid unnecessary duplication
- Enforce referential integrity
- Store only structured data
- Separate files from metadata
- Design for scalability
- Prefer explicit relationships
- Keep entities independent

---

# Database Organization

The database stores structured business data only.

Major domains include:

- Users
- Career Profiles
- Skills
- Education
- Experience
- Resumes
- Jobs
- Applications
- Interviews
- Notifications
- AI Results
- Settings

Each domain belongs to a dedicated business module.

---

# Entity Ownership

Every entity has a clearly defined owner.

Example:

```text
User

├── Career Profile
├── Resume
├── Application
├── Interview
├── Settings
└── Notifications
```

Ownership simplifies authorization and data isolation.

---

# Relationship Strategy

CareerOS primarily uses relational modeling.

Relationship types include:

- One-to-One
- One-to-Many
- Many-to-Many

Relationships should use foreign keys with proper constraints.

---

# Primary Keys

Each table uses a single primary key.

Guidelines:

- Unique identifier
- Immutable
- Indexed automatically
- Never reused

---

# Foreign Keys

Foreign keys enforce relationships between entities.

Rules:

- Maintain referential integrity
- Prevent orphan records
- Support cascading only when appropriate

---

# Data Integrity

Data consistency is maintained through:

- Primary keys
- Foreign keys
- Unique constraints
- Check constraints
- Transactions
- Application-level validation

Database constraints complement business validation but do not replace it.

---

# Soft Delete Strategy

Business records should generally use soft deletion.

Typical flow:

```text
Delete Request

↓

Mark Record as Deleted

↓

Hide from Queries

↓

Retain for Audit
```

Permanent deletion should be reserved for maintenance operations.

---

# Audit Fields

Every business entity should include standard audit information.

Recommended fields:

- Created At
- Updated At
- Created By (where applicable)
- Updated By (where applicable)

These fields improve traceability and debugging.

---

# File Storage Strategy

The database stores only metadata.

Example metadata:

- File Name
- File Type
- Storage Path
- File Size
- Upload Timestamp

Actual files are stored in object storage.

---

# Transactions

Critical write operations execute within database transactions.

This guarantees:

- Atomicity
- Consistency
- Isolation
- Durability

---

# Performance Strategy

Performance is achieved through:

- Proper indexing
- Optimized queries
- Pagination
- Query optimization
- Redis caching
- Efficient relationships

Large datasets should never be loaded without pagination.

---

# Scalability

The database is designed to support future growth.

Future improvements may include:

- Read replicas
- Partitioning
- Archiving
- Connection pooling

These enhancements should not require changes to the application architecture.

---

# Security

Database security principles:

- Least-privilege access
- Encrypted connections
- Secure credentials
- Parameterized queries
- No direct public access
- Regular backups

Sensitive information should be encrypted where appropriate.

---

# Best Practices

- Keep tables focused on a single responsibility.
- Avoid duplicated data.
- Use meaningful relationships.
- Maintain referential integrity.
- Index frequently queried columns.
- Archive inactive data when appropriate.
- Keep business logic outside the database.

---

# References

Depends On:

- 04-system-architecture/01-system-architecture-overview.md
- 04-system-architecture/06-module-architecture.md
- 04-system-architecture/07-data-flow.md

Used By:

- 02-entity-relationship-model.md
- 03-database-schema.md
- API Design
- Backend Architecture

---

# Summary

CareerOS uses PostgreSQL as its primary relational database, with a normalized schema, strong referential integrity, and clear entity ownership. Business logic remains in the application layer, while the database focuses on reliable storage, consistency, performance, and scalability. This foundation supports the platform's modular architecture and future growth.