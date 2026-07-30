# Indexing Strategy

**Product:** CareerOS

**Version:** 1.0

**Status:** Approved

---

# Purpose

This document defines the indexing strategy for the CareerOS PostgreSQL database. Proper indexing ensures fast query execution, efficient data retrieval, and scalability as the platform grows.

---

# Scope

This document covers:

- Primary indexes
- Foreign key indexes
- Composite indexes
- Unique indexes
- Search optimization
- Performance guidelines
- Index maintenance

---

# Indexing Principles

CareerOS follows these indexing principles:

- Every primary key is indexed.
- Every foreign key is indexed.
- Index frequently filtered columns.
- Index frequently sorted columns.
- Avoid unnecessary indexes.
- Monitor index usage over time.
- Balance read performance with write overhead.

---

# Primary Key Indexes

Every table uses a UUID primary key.

Automatically indexed by PostgreSQL.

Example:

```text
user.id
resume.id
application.id
interview.id
```

---

# Foreign Key Indexes

Every foreign key should have an index.

Examples:

| Table | Column |
|---------|--------|
| career_profile | user_id |
| education | user_id |
| experience | user_id |
| skill | user_id |
| project | user_id |
| certification | user_id |
| resume | user_id |
| resume_version | resume_id |
| resume_analysis | resume_id |
| saved_job | user_id |
| application | user_id |
| application | resume_id |
| interview | application_id |
| notification | user_id |
| user_settings | user_id |
| ai_history | user_id |

---

# Unique Indexes

Unique indexes enforce data integrity.

Recommended unique indexes:

| Table | Column |
|---------|--------|
| user | email |
| career_profile | user_id |
| user_settings | user_id |
| resume | latest_version_id (where applicable) |

---

# Composite Indexes

Composite indexes improve multi-column filtering.

## Applications

Frequently queried by:

- User
- Status

```text
(user_id, status)
```

---

## Applications Timeline

Frequently sorted by application date.

```text
(user_id, applied_at)
```

---

## Interviews

Common queries:

- Upcoming interviews
- User interview history

```text
(application_id, scheduled_at)
```

---

## Notifications

Common queries:

- Unread notifications
- Latest notifications

```text
(user_id, is_read, created_at)
```

---

## AI History

Common queries:

- AI feature usage
- User activity

```text
(user_id, feature, created_at)
```

---

## Resume Versions

Latest versions are accessed frequently.

```text
(resume_id, version_number)
```

---

# Search Optimization

Frequently searched columns should be indexed.

Examples:

| Table | Columns |
|---------|----------|
| skill | name |
| project | title |
| certification | title |
| application | company |
| application | position |
| saved_job | company |
| saved_job | title |

---

# Full-Text Search

Future versions may use PostgreSQL Full-Text Search for:

- Resume content
- Project descriptions
- Experience descriptions
- Skills
- Certifications

Potential implementation:

- `tsvector`
- `GIN` indexes
- Language-aware search dictionaries

---

# JSONB Indexing

CareerOS uses JSONB only where flexibility is required.

Examples:

- technologies
- ai_preferences
- strengths
- weaknesses
- recommendations

Use GIN indexes only when querying JSONB fields frequently.

---

# Sorting Optimization

Columns commonly used in `ORDER BY` clauses should be indexed.

Examples:

| Table | Column |
|---------|--------|
| application | applied_at |
| interview | scheduled_at |
| notification | created_at |
| resume_version | version_number |
| ai_history | created_at |

---

# Pagination Optimization

Large datasets should always use indexed columns for pagination.

Preferred pagination fields:

- created_at
- applied_at
- scheduled_at
- id (cursor-based pagination)

Avoid offset-based pagination for very large datasets.

---

# Write Performance Considerations

Indexes improve reads but increase write costs.

Before creating a new index:

- Verify query frequency.
- Measure performance impact.
- Avoid duplicate indexes.
- Remove unused indexes during maintenance.

---

# Index Maintenance

Regular maintenance should include:

- Rebuilding fragmented indexes when necessary.
- Monitoring unused indexes.
- Updating database statistics.
- Reviewing slow query logs.
- Running PostgreSQL `ANALYZE` and `VACUUM` operations.

---

# Performance Guidelines

Recommended practices:

- Keep indexes focused.
- Prefer composite indexes for common query patterns.
- Avoid indexing rarely queried columns.
- Avoid indexing low-selectivity boolean columns unless combined with other fields.
- Monitor execution plans using `EXPLAIN ANALYZE`.

---

# Future Optimizations

As CareerOS scales, consider:

- Partial indexes
- Covering indexes
- Expression indexes
- Table partitioning
- Read replicas
- Materialized views for reporting

These optimizations should be introduced based on observed production workloads.

---

# References

Depends On:

- 02-entity-relationship-diagram.md
- 03-database-schema.md

Used By:

- 05-migration-strategy.md
- Backend Development
- Performance Optimization

---

# Summary

The CareerOS indexing strategy ensures efficient query performance by indexing primary keys, foreign keys, frequently filtered columns, and common query patterns. It balances read efficiency with write performance while providing a scalable foundation for future growth and advanced PostgreSQL optimizations.