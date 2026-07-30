# Definition of Done

## Purpose

This document defines the minimum quality standards that every feature, module, bug fix, and enhancement must satisfy before being considered complete.

The Definition of Done (DoD) ensures consistency, maintainability, quality, and production readiness across the CareerOS codebase.

A feature is **not complete** simply because it works. It is complete only when every applicable requirement in this document has been satisfied.

---

# General Principles

Every implementation must be:

- Complete
- Tested
- Secure
- Maintainable
- Documented (when required)
- Production-ready

No shortcuts should be taken to meet deadlines.

---

# Backend Requirements

The backend implementation is considered complete when:

- Database models are finalized.
- Database migrations are created.
- API endpoints are implemented.
- Business logic is placed in the Service layer.
- Selectors are used only for data retrieval.
- Serializers are implemented.
- Permissions are configured.
- Input validation is complete.
- Error handling is implemented.
- Logging is added where appropriate.
- API responses follow project standards.
- No duplicate logic exists.

---

# Frontend Requirements

The frontend implementation is considered complete when:

- UI matches the approved design.
- Responsive layouts work on supported screen sizes.
- Dark mode is supported where applicable.
- Forms include validation.
- Loading states are implemented.
- Empty states are implemented.
- Error states are implemented.
- Success feedback is provided.
- Components are reusable where appropriate.
- No unnecessary re-renders are introduced.

---

# API Requirements

Every API must include:

- Request validation
- Authentication
- Authorization
- Consistent response format
- Proper HTTP status codes
- Error responses
- Pagination (where applicable)
- Filtering (where applicable)
- Sorting (where applicable)

---

# Database Requirements

Every database change must include:

- Migration file
- Proper relationships
- Foreign keys
- Indexes where required
- Constraints
- Audit fields
- Soft delete support (where applicable)

No manual schema changes are allowed.

---

# Security Requirements

Every feature must be reviewed for:

- Authentication
- Authorization
- Input validation
- SQL Injection protection
- XSS protection
- Sensitive data exposure
- Rate limiting (where applicable)
- Secure file handling (where applicable)

---

# Testing Requirements

Every completed feature must include appropriate tests.

Depending on the feature, this may include:

- Unit tests
- Integration tests
- API tests
- Component tests
- End-to-end tests

All existing tests must continue to pass.

---

# Performance Requirements

Every feature should:

- Avoid unnecessary database queries.
- Prevent N+1 query problems.
- Use pagination for large datasets.
- Avoid duplicate API requests.
- Optimize expensive operations.
- Reuse cached data where appropriate.

---

# Accessibility Requirements

User interfaces should:

- Be keyboard accessible.
- Use semantic HTML.
- Provide labels for form controls.
- Display readable validation messages.
- Maintain sufficient color contrast.
- Include appropriate ARIA attributes where necessary.

---

# Code Quality Requirements

Before marking a feature complete:

- No TODO comments remain.
- No commented-out code remains.
- No duplicate code exists.
- No unused imports remain.
- No unused variables remain.
- Naming conventions are followed.
- Code formatting passes.
- Linting passes.
- Type checking passes.

---

# Documentation Requirements

Documentation must be updated only when implementation changes:

- Public APIs
- Architecture
- Environment variables
- Setup process
- Developer workflow

Do not create unnecessary documentation.

---

# Git Requirements

Before merging:

- Branch is up to date.
- Commit messages follow project conventions.
- Merge conflicts are resolved.
- CI pipeline passes.
- Code review comments are addressed.

---

# AI Feature Requirements

For AI-powered functionality:

- Prompt templates are versioned where applicable.
- AI failures are handled gracefully.
- Timeouts are implemented.
- Retry logic is used where appropriate.
- Token usage is considered.
- Sensitive data is not unnecessarily sent to external models.
- Fallback behavior is defined when AI services are unavailable.

---

# Deployment Requirements

A feature is deployment-ready when:

- Environment variables are documented.
- Database migrations execute successfully.
- No manual production changes are required.
- Feature works in staging.
- Rollback is possible.

---

# Feature Completion Checklist

A feature is complete only if all applicable items below are satisfied.

## Backend

- [ ] Models complete
- [ ] Migrations created
- [ ] Services implemented
- [ ] Selectors implemented
- [ ] APIs implemented
- [ ] Permissions configured
- [ ] Validation complete
- [ ] Error handling complete

## Frontend

- [ ] UI complete
- [ ] Responsive
- [ ] Dark mode supported
- [ ] Forms validated
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success feedback

## Quality

- [ ] Tests added
- [ ] Existing tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No duplicate code
- [ ] No unused code

## Security

- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Validation verified
- [ ] Security review completed

## Deployment

- [ ] CI passes
- [ ] Ready for staging
- [ ] Ready for production

---

# Exit Criteria

A feature, module, or milestone may only be marked as **Done** when:

- All applicable checklist items are complete.
- No critical bugs remain.
- No known regressions exist.
- The implementation aligns with the approved architecture.
- The feature is ready for production deployment.

Only then should the status be changed to **Done**.