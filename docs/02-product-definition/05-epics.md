# Epics

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document groups related features into Epics.

An Epic represents a major business capability that delivers value to users and can be broken down into multiple user stories.

---

# Epic Overview

| Epic ID | Epic Name | MVP | Priority |
|----------|-----------|-----|----------|
| EPIC-01 | Authentication & User Management | ✅ | High |
| EPIC-02 | Career Profile Management | ✅ | High |
| EPIC-03 | Resume Management | ✅ | High |
| EPIC-04 | Job Opportunity Management | ✅ | High |
| EPIC-05 | Application Tracking | ✅ | High |
| EPIC-06 | Interview Management | ✅ | High |
| EPIC-07 | Dashboard & Insights | ✅ | High |
| EPIC-08 | AI Career Coach | ✅ | High |
| EPIC-09 | Notifications | ❌ | Medium |
| EPIC-10 | Third-Party Integrations | ❌ | Medium |
| EPIC-11 | Analytics & Reports | ❌ | Low |

---

# EPIC-01 — Authentication & User Management

## Goal

Allow users to securely access and manage their CareerOS account.

### Features

- Registration
- Login
- Logout
- Password Reset
- Email Verification
- Profile Management

### Success Criteria

Users can securely create and access their workspace.

---

# EPIC-02 — Career Profile Management

## Goal

Provide a centralized profile containing all career-related information.

### Features

- Personal Details
- Education
- Skills
- Experience
- Projects
- Certifications
- Career Goals
- Portfolio Links

### Success Criteria

Users maintain an up-to-date career profile.

---

# EPIC-03 — Resume Management

## Goal

Allow users to manage, review, and improve resumes.

### Features

- Resume Upload
- Resume Preview
- Resume Version History
- Resume Metadata
- AI Resume Review
- Resume Editing & Generation

### Success Criteria

Users can manage multiple resume versions and improve resume quality.

---

# EPIC-04 — Job Opportunity Management

## Goal

Collect and organize job opportunities.

### Features

- Manual Job Entry
- Browser-Assisted Job Capture
- Company Details
- Job Details
- Bookmarks

### Success Criteria

Users can save and organize relevant opportunities.

---

# EPIC-05 — Application Tracking

## Goal

Track every job application from submission to final outcome.

### Features

- Application Creation
- Status Tracking
- Resume Association
- Notes
- Timeline
- Filters

### Success Criteria

Users no longer need spreadsheets to manage applications.

---

# EPIC-06 — Interview Management

## Goal

Help users prepare for and learn from interviews.

### Features

- Interview Scheduling
- Interview Notes
- Outcomes
- Lessons Learned

### Success Criteria

Users retain interview history and continuously improve.

---

# EPIC-07 — Dashboard & Insights

## Goal

Provide a complete overview of career progress.

### Features

- Career Overview
- Career Readiness Score
- Statistics
- Recent Activity
- Next Actions
- Career Insights

### Success Criteria

Users understand their current status and next priorities.

---

# EPIC-08 — AI Career Coach

## Goal

Provide personalized career guidance.

### Features

- Resume Feedback
- Skill Recommendations
- Career Recommendations
- Interview Guidance
- Job Description Analysis
- Skill Gap Analysis

### Success Criteria

Users receive actionable recommendations tailored to their profile.

---

# EPIC-09 — Notifications

## Goal

Keep users informed about important activities.

### Features

- In-App Notifications
- Email Notifications
- Reminders

### MVP

No

---

# EPIC-10 — Third-Party Integrations

## Goal

Connect CareerOS with external platforms.

### Features

- GitHub
- LinkedIn
- Gmail
- Google Calendar

### MVP

No

---

# EPIC-11 — Analytics & Reports

## Goal

Provide advanced analytics and reporting.

### Features

- Career Analytics
- Weekly Reports
- Progress Reports

### MVP

No

---

# Epic Dependencies

| Epic | Depends On |
|-------|------------|
| EPIC-01 | None |
| EPIC-02 | EPIC-01 |
| EPIC-03 | EPIC-01, EPIC-02 |
| EPIC-04 | EPIC-01 |
| EPIC-05 | EPIC-03, EPIC-04 |
| EPIC-06 | EPIC-05 |
| EPIC-07 | EPIC-02, EPIC-03, EPIC-04, EPIC-05, EPIC-06 |
| EPIC-08 | EPIC-02, EPIC-03, EPIC-04, EPIC-05, EPIC-06 |
| EPIC-09 | EPIC-01 |
| EPIC-10 | EPIC-01 |
| EPIC-11 | EPIC-07 |

---

# Recommended Development Order

### Phase 1

- EPIC-01 Authentication
- EPIC-02 Career Profile

---

### Phase 2

- EPIC-03 Resume Management

---

### Phase 3

- EPIC-04 Job Opportunity Management
- EPIC-05 Application Tracking

---

### Phase 4

- EPIC-06 Interview Management

---

### Phase 5

- EPIC-07 Dashboard & Insights

---

### Phase 6

- EPIC-08 AI Career Coach

---

### Future Phases

- Notifications
- Integrations
- Analytics

---

# References

## Depends On

- Product Requirements Document
- MVP Definition
- Feature Inventory
- Feature Prioritization

## Used By

- User Stories
- Acceptance Criteria
- Sprint Planning
- SRS
- Development Planning

---

# Summary

The CareerOS MVP is organized into eight core epics that deliver a complete end-to-end career management experience. Future epics expand platform capabilities after validating the core product.