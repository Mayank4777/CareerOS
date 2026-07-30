# Domain Model

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the core business entities of CareerOS and the relationships between them.

The domain model represents the business language of the product, independent of database tables or implementation details.

It serves as the foundation for:

- Database Design
- Backend Architecture
- API Design
- AI Context Assembly
- Authorization
- UI Design

---

# Domain Design Principles

The CareerOS domain model follows these principles:

- One source of truth for every piece of data.
- High cohesion within each entity.
- Loose coupling between modules.
- Business-first, not database-first.
- AI consumes domain entities rather than raw tables.
- Future features should extend existing entities where possible.

---

# Core Domain Overview

```
User
│
├── Career Profile
│      ├── Education
│      ├── Experience
│      ├── Skills
│      ├── Projects
│      ├── Certifications
│      ├── Achievements
│      └── Career Goals
│
├── Resume
│      ├── Resume Version
│      └── AI Review
│
├── Job
│
├── Application
│      └── Interview
│
├── AI Recommendation
│
└── Notification
```

---

# Domain Entities

## User

### Description

Represents an authenticated CareerOS account.

### Owns

- Career Profile
- Resume Library
- Saved Jobs
- Applications
- Interviews
- AI Recommendations
- Notifications

### Relationships

```
User

1 → 1 Career Profile

1 → N Resume

1 → N Job

1 → N Application

1 → N Interview

1 → N AI Recommendation
```

---

## Career Profile

### Description

Represents the user's professional identity.

### Contains

- Personal Information
- Education
- Skills
- Experience
- Projects
- Certifications
- Achievements
- Career Goals
- Portfolio Links

### Relationships

```
Career Profile

1 → N Skills

1 → N Projects

1 → N Education

1 → N Experience

1 → N Certifications
```

---

## Resume

### Description

Represents a resume owned by a user.

A user may maintain multiple resumes for different purposes.

### Contains

- Metadata
- Resume Content
- Version History
- AI Reviews

### Relationships

```
Resume

1 → N Resume Versions

1 → N AI Reviews

1 → N Applications
```

---

## Resume Version

### Description

Represents a snapshot of a resume.

Used to track changes over time and identify which version was submitted with each application.

---

## Job

### Description

Represents a job opportunity.

### Contains

- Company
- Role
- Location
- Description
- Requirements
- Salary (optional)
- Source
- Bookmark Status

### Relationships

```
Job

1 → N Applications
```

---

## Application

### Description

Represents a submitted job application.

### Contains

- Applied Date
- Current Status
- Resume Used
- Notes
- Timeline

### Relationships

```
Application

1 → 1 Job

1 → 1 Resume Version

1 → N Interviews
```

---

## Interview

### Description

Represents an interview for an application.

### Contains

- Interview Type
- Schedule
- Notes
- Outcome
- Lessons Learned

### Relationships

```
Interview

N → 1 Application
```

---

## AI Recommendation

### Description

Represents AI-generated guidance.

### Types

- Resume
- Skills
- Interview
- Career
- Application
- Dashboard

Recommendations may be regenerated over time and should remain linked to the context that produced them.

---

## Notification

### Description

Represents system-generated reminders and updates.

Examples

- Upcoming interview
- Resume review available
- Weekly career summary
- Application follow-up reminder

Notifications are user-specific and do not contain business logic.

---

# Aggregate Boundaries

## User Aggregate

```
User

Career Profile

Resume

Applications

Interviews

Notifications
```

The User aggregate is the root of all personal data.

---

## Resume Aggregate

```
Resume

↓

Versions

↓

AI Reviews
```

---

## Application Aggregate

```
Application

↓

Interview

↓

Timeline
```

---

# Relationship Summary

| Entity | Relationship | Entity |
|----------|-------------|---------|
| User | 1 → 1 | Career Profile |
| User | 1 → N | Resume |
| User | 1 → N | Job |
| User | 1 → N | Application |
| User | 1 → N | Interview |
| User | 1 → N | AI Recommendation |
| Resume | 1 → N | Resume Version |
| Resume Version | 1 → N | Application |
| Job | 1 → N | Application |
| Application | 1 → N | Interview |

---

# Domain Events

The following business events occur within CareerOS.

### User

- User Registered
- User Logged In
- Profile Updated

### Resume

- Resume Uploaded
- Resume Created
- Resume Edited
- Resume Reviewed
- Resume Exported

### Jobs

- Job Saved
- Job Updated
- Job Archived

### Applications

- Application Created
- Status Changed
- Resume Attached

### Interviews

- Interview Scheduled
- Interview Completed
- Interview Outcome Recorded

### AI

- Recommendation Generated
- Resume Reviewed
- Skill Gap Calculated
- Career Score Updated

---

# Ownership Rules

- A User owns all career data.
- A Resume cannot exist without a User.
- An Application cannot exist without a Job.
- An Interview cannot exist without an Application.
- AI Recommendations always reference the entity they were generated from.
- Deleting a User removes all associated personal data according to retention policies.

---

# Future Domain Extensions

Future entities may include:

- Recruiter
- University
- Learning Path
- Portfolio
- Company Insights
- Subscription
- Team Workspace
- Mentor
- Career Community

These extensions should integrate with the existing domain model without altering current relationships.

---

# Design Implications

The domain model determines:

- Database schema
- API resources
- Backend modules
- Authorization rules
- AI context composition
- Event architecture
- Service boundaries

Changes to entity relationships should be evaluated carefully, as they affect multiple layers of the application.

---

# References

## Depends On

- Information Architecture
- User Flows
- AI Interaction Design
- Feature Inventory

## Used By

- ER Diagram
- Database Design
- API Specification
- Backend Architecture
- Frontend State Management
- AI Context Builder

---

# Summary

The CareerOS domain model defines the core business entities and their relationships, ensuring a consistent understanding of the product across design, development, AI integration, and future platform expansion.