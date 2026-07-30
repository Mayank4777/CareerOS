# AI Prompting Guide

## Purpose

This document defines the standard prompting workflow for AI coding agents working on CareerOS.

Its goal is to ensure consistent, predictable, and architecture-compliant code generation.

All implementation prompts should follow the patterns defined in this document.

---

# General Rules

Before implementing any feature, the AI coding agent must:

- Read all referenced documents.
- Follow the documented architecture.
- Never redesign the system.
- Never modify unrelated modules.
- Ask for clarification if requirements conflict.

---

# Standard Prompt Structure

Every implementation prompt should contain the following sections:

## 1. Context

Briefly describe what needs to be built.

Example:

Implement the Authentication module for CareerOS.

---

## 2. Required Documents

Reference only the documents required for the current task.

Example:

Read:

@01-ai-context.md

@02-development-roadmap.md

@03-module-dependency-map.md

@04-definition-of-done.md

@05-coding-standards.md

@authentication-module.md

@03-database-schema.md

@02-endpoint-specification.md

---

## 3. Scope

Clearly define what should be implemented.

Example:

Implement:

- Django models
- Serializers
- Services
- Views
- URLs
- Permissions
- API endpoints
- Unit tests

Do not implement frontend.

---

## 4. Constraints

Example:

Do not:

- Modify other modules.
- Change database schema.
- Introduce new libraries.
- Rename APIs.
- Ignore coding standards.

---

## 5. Expected Output

Specify exactly what should be delivered.

Example:

Deliver:

- Complete backend implementation
- Passing tests
- Production-ready code

Stop after backend implementation is complete.

---

# Prompt Templates

---

## Backend Module

Read:

@01-ai-context.md

@05-coding-standards.md

@Module Architecture Document

@03-database-schema.md

@02-endpoint-specification.md

Implement only the backend for this module.

Do not touch frontend.

---

## Frontend Module

Read:

@01-ai-context.md

@05-coding-standards.md

@Module UI Document

Implement:

- Pages
- Components
- Forms
- API integration

Do not modify backend.

---

## Full Module

Read:

@01-ai-context.md

@02-development-roadmap.md

@03-module-dependency-map.md

@04-definition-of-done.md

@05-coding-standards.md

@Module Documentation

Implement the complete module including:

- Backend
- Frontend
- Tests

Do not modify unrelated modules.

---

## Bug Fix

Read:

Relevant module documentation.

Fix only the reported issue.

Do not refactor unrelated code.

Maintain backward compatibility.

---

## Refactoring

Read:

Relevant architecture documentation.

Improve code quality without changing functionality.

Maintain all public APIs.

---

## Test Generation

Read:

Relevant module documentation.

Generate:

- Unit tests
- Integration tests
- API tests

Do not modify production code unless required.

---

# Prompting Best Practices

Always:

- Keep prompts focused on one module.
- Reference only necessary documents.
- Define implementation boundaries.
- Specify expected output.

Avoid:

- Large multi-module prompts.
- Vague requirements.
- Architecture redesign requests.
- Mixing unrelated tasks.

---

# Common Mistakes to Avoid

Do not ask the AI to:

- Build the entire project at once.
- Redesign completed architecture.
- Modify completed modules without reason.
- Introduce new dependencies without approval.
- Skip tests or validation.

---

# Recommended Workflow

For every feature:

1. Read the required documents.
2. Implement one module.
3. Review the generated code.
4. Run tests.
5. Fix issues.
6. Commit changes.
7. Proceed to the next module.

Never implement multiple major modules simultaneously.

---

# Example Prompt

Implement the Career Profile module.

Read:

@01-ai-context.md

@02-development-roadmap.md

@03-module-dependency-map.md

@04-definition-of-done.md

@05-coding-standards.md

@career-profile-module.md

@03-database-schema.md

@02-endpoint-specification.md

Implement:

- Backend
- Frontend
- Tests

Do not modify any other module.

Ensure the implementation satisfies the Definition of Done.

---

# Related Documents

- @01-ai-context.md
- @02-development-roadmap.md
- @03-module-dependency-map.md
- @04-definition-of-done.md
- @05-coding-standards.md

Use the relevant module documentation from the architecture as required.