# State Management

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the lifecycle states of every major business entity in CareerOS.

State management ensures that every entity follows a predictable lifecycle, preventing invalid transitions and maintaining data consistency across the application.

This document is independent of frontend state libraries (Redux, Zustand, etc.). It focuses on **business state**, not UI state.

---

# State Design Principles

CareerOS state management follows these principles:

- Every entity has a defined lifecycle.
- State transitions are explicit.
- Invalid transitions are rejected.
- State changes generate domain events.
- AI recommendations may be triggered by state changes.
- History is preserved whenever appropriate.

---

# Application Lifecycle

## States

```
Draft

↓

Applied

↓

Under Review

↓

Assessment

↓

Interview Scheduled

↓

Interview Completed

↓

Offer Received

↓

Accepted

OR

Rejected

OR

Withdrawn
```

---

## Allowed Transitions

| Current State | Allowed Next State |
|---------------|-------------------|
| Draft | Applied |
| Applied | Under Review, Rejected, Withdrawn |
| Under Review | Assessment, Interview Scheduled, Rejected |
| Assessment | Interview Scheduled, Rejected |
| Interview Scheduled | Interview Completed, Cancelled |
| Interview Completed | Offer Received, Rejected |
| Offer Received | Accepted, Rejected |
| Accepted | Final |
| Rejected | Final |
| Withdrawn | Final |

---

## Triggered Events

Examples:

- Application Submitted
- Interview Scheduled
- Offer Received
- Application Closed

---

# Resume Lifecycle

## States

```
Draft

↓

In Review

↓

Approved

↓

Applied

↓

Archived
```

---

## Description

Draft

Resume is being edited.

---

In Review

AI review or manual review is in progress.

---

Approved

Resume is ready for applications.

---

Applied

Resume has been used in one or more applications.

---

Archived

Older version retained for history.

---

## Allowed Transitions

| Current | Next |
|----------|------|
| Draft | In Review |
| In Review | Draft, Approved |
| Approved | Applied, Archived |
| Applied | Archived |
| Archived | — |

---

# Interview Lifecycle

## States

```
Scheduled

↓

Completed

↓

Feedback Added

↓

Closed
```

Alternative

```
Scheduled

↓

Cancelled
```

---

## Allowed Transitions

| Current | Next |
|----------|------|
| Scheduled | Completed, Cancelled |
| Completed | Feedback Added |
| Feedback Added | Closed |
| Cancelled | Closed |

---

# Job Lifecycle

## States

```
Saved

↓

Interested

↓

Applied

↓

Archived
```

Alternative

```
Saved

↓

Not Interested

↓

Archived
```

---

## Allowed Transitions

| Current | Next |
|----------|------|
| Saved | Interested, Not Interested |
| Interested | Applied, Archived |
| Applied | Archived |
| Not Interested | Archived |

---

# AI Recommendation Lifecycle

## States

```
Generated

↓

Displayed

↓

Accepted

OR

Dismissed

↓

Archived
```

---

## Description

Generated

AI has produced a recommendation.

Displayed

User has seen it.

Accepted

User chooses to follow the recommendation.

Dismissed

User ignores or rejects it.

Archived

Recommendation retained for history.

---

# Notification Lifecycle

## States

```
Created

↓

Delivered

↓

Read

↓

Archived
```

---

# User Account Lifecycle

## States

```
Registered

↓

Verified

↓

Active

↓

Suspended

↓

Deleted
```

---

# Career Profile Completion

The Career Profile progresses through completion stages.

```
Empty

↓

Basic Information

↓

Education Added

↓

Skills Added

↓

Projects Added

↓

Experience Added

↓

Career Ready
```

Completion percentage is calculated dynamically based on required sections.

---

# AI Trigger Matrix

Certain state changes automatically trigger AI analysis.

| Event | AI Action |
|--------|-----------|
| Resume Approved | Resume Quality Analysis |
| Job Saved | Job Fit Analysis |
| Application Submitted | Resume Match Analysis |
| Interview Completed | Interview Improvement Suggestions |
| Career Profile Updated | Career Readiness Recalculation |

---

# Invalid State Examples

The following transitions are not allowed:

- Draft → Offer Received
- Saved Job → Interview Scheduled
- Resume Draft → Archived without saving
- Interview Scheduled → Feedback Added
- Deleted User → Active

Such transitions should return validation errors.

---

# Audit Requirements

Every state change records:

- Entity ID
- Previous State
- New State
- User
- Timestamp
- Trigger Source
- Optional Notes

This history supports analytics and debugging.

---

# Future State Extensions

Future modules may introduce additional lifecycles for:

- Learning Paths
- Recruiter Workflows
- Portfolio Publishing
- Mentorship
- Team Collaboration

These should follow the same state management principles.

---

# Design Implications

State management influences:

- Backend validation
- API behavior
- Business rules
- Event handling
- Notifications
- AI triggers
- UI actions
- Reporting

State transitions should be centralized within domain services to ensure consistency.

---

# References

## Depends On

- Domain Model
- User Flows
- AI Interaction Design

## Used By

- Backend Services
- API Design
- Frontend UI
- Event System
- QA Testing

---

# Summary

This document defines the lifecycle of CareerOS entities and establishes consistent state transitions across the platform. It ensures predictable behavior, simplifies implementation, and provides a reliable foundation for automation, AI workflows, and future platform growth.