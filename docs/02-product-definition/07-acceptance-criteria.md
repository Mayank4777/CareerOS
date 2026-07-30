# Acceptance Criteria

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the conditions that must be satisfied before a user story is considered complete and accepted.

Acceptance criteria provide a common understanding between product owners, developers, testers, and stakeholders.

---

# Acceptance Criteria Format

Acceptance criteria follow the **Given – When – Then (Gherkin)** format.

```
Given <initial condition>

When <user action>

Then <expected result>
```

---

# EPIC-01 — Authentication & User Management

## US-001 — User Registration

### Acceptance Criteria

**AC-001**

Given a visitor is on the registration page

When they enter valid information

Then a new account is created successfully.

---

**AC-002**

Given a visitor enters an email already in use

When they submit the form

Then an appropriate validation error is displayed.

---

**AC-003**

Given all required fields are incomplete

When the form is submitted

Then registration is prevented.

---

## US-002 — Login

### Acceptance Criteria

**AC-004**

Given a registered user

When valid credentials are entered

Then access is granted.

---

**AC-005**

Given incorrect credentials

When login is attempted

Then an error message is shown.

---

# EPIC-02 — Career Profile

## US-005 — Add Education

### Acceptance Criteria

**AC-006**

Given a logged-in user

When education details are entered

Then the education record is saved.

---

**AC-007**

Given existing education

When edited

Then changes are updated immediately.

---

## US-006 — Skills

### Acceptance Criteria

**AC-008**

Given a user profile

When skills are added

Then they appear in the career profile.

---

**AC-009**

Given existing skills

When removed

Then they no longer appear.

---

# EPIC-03 — Resume Management

## US-011 — Upload Resume

### Acceptance Criteria

**AC-010**

Given a supported resume file

When uploaded

Then it is stored successfully.

---

**AC-011**

Given an unsupported file format

When uploaded

Then upload is rejected with a validation message.

---

## US-013 — AI Resume Review

### Acceptance Criteria

**AC-012**

Given a valid resume

When AI review is requested

Then feedback is generated successfully.

---

**AC-013**

Given AI processing fails

When feedback is requested

Then the user receives a meaningful error message.

---

# EPIC-04 — Job Opportunity Management

## US-016 — Save Job

### Acceptance Criteria

**AC-014**

Given job information

When saved

Then it appears in the user's job list.

---

## US-017 — Browser-Assisted Job Capture

### Acceptance Criteria

**AC-015**

Given supported job information

When captured

Then relevant job details are pre-filled.

---

# EPIC-05 — Application Tracking

## US-019 — Record Application

### Acceptance Criteria

**AC-016**

Given a saved job

When an application is created

Then it appears in the application tracker.

---

## US-020 — Update Status

### Acceptance Criteria

**AC-017**

Given an existing application

When status changes

Then the updated status is reflected throughout the system.

---

## US-021 — Associate Resume

### Acceptance Criteria

**AC-018**

Given multiple resume versions

When one is selected during application creation

Then the selected version is linked to the application.

---

# EPIC-06 — Interview Management

## US-024 — Schedule Interview

### Acceptance Criteria

**AC-019**

Given an application

When interview information is entered

Then the interview schedule is saved.

---

## US-025 — Interview Notes

### Acceptance Criteria

**AC-020**

Given an interview exists

When notes are added

Then they are stored successfully.

---

# EPIC-07 — Dashboard & Insights

## US-028 — Dashboard

### Acceptance Criteria

**AC-021**

Given a logged-in user

When the dashboard loads

Then career metrics are displayed.

---

## US-030 — Next Actions

### Acceptance Criteria

**AC-022**

Given available career data

When AI generates recommendations

Then actionable next steps are displayed.

---

# EPIC-08 — AI Career Coach

## US-032 — Resume Suggestions

### Acceptance Criteria

**AC-023**

Given a resume

When AI analysis completes

Then improvement suggestions are presented.

---

## US-035 — Job Description Analysis

### Acceptance Criteria

**AC-024**

Given a job description

When analysis is requested

Then required skills and keywords are identified.

---

## US-036 — Skill Gap Analysis

### Acceptance Criteria

**AC-025**

Given the user's career profile and a job description

When AI compares both

Then missing skills are highlighted.

---

# General Acceptance Criteria

The following conditions apply to every feature:

- Only authenticated users can access protected resources.
- Users can only access their own data.
- Validation errors are displayed clearly.
- Successful actions provide confirmation.
- Failed operations return meaningful error messages.
- The UI remains responsive on desktop and mobile.
- API responses use consistent status codes.
- Sensitive data is never exposed.
- All user inputs are validated on both client and server.
- Every critical action is logged where appropriate.

---

# Definition of Done

A feature is considered complete only if:

- Acceptance criteria are satisfied.
- Code review is approved.
- Unit tests pass.
- Integration tests pass.
- No critical defects remain.
- Security validation passes.
- Documentation is updated.
- Product Owner approves the feature.

---

# References

## Depends On

- User Stories
- Epics
- MVP Definition

## Used By

- QA Testing
- Sprint Reviews
- Development
- UAT
- Release Planning

---

# Summary

This document establishes measurable conditions for verifying that each CareerOS feature behaves as expected before it is released. It ensures consistency between product requirements, development, and quality assurance.