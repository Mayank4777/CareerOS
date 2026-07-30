# AI Interaction Design

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines how Artificial Intelligence operates within CareerOS.

Rather than functioning as a standalone chatbot, AI acts as an intelligent career assistant that continuously analyzes user data, understands career progress, and provides contextual recommendations.

This document establishes the responsibilities, boundaries, workflows, and architecture of the AI system before implementation begins.

---

# AI Design Philosophy

CareerOS follows an **AI-first** approach.

The AI should:

- Understand the user's career journey.
- Reduce manual work.
- Explain recommendations.
- Adapt to the user's evolving profile.
- Assist rather than replace decision-making.

The AI is a decision-support system, not an autonomous decision-maker.

---

# Core AI Responsibilities

The AI is responsible for:

- Resume analysis
- Resume improvement suggestions
- Job description analysis
- Skill gap identification
- Career readiness assessment
- Personalized career guidance
- Interview preparation
- Daily and weekly recommendations
- Application insights
- Career trend interpretation

The AI is **not** responsible for:

- Automatically applying for jobs
- Sending emails without user approval
- Editing user data without confirmation
- Making hiring predictions
- Guaranteeing interview success
- Fabricating information

---

# AI Context Model

Every AI request should be generated using available user context.

```
User

↓

Career Profile

↓

Resume

↓

Projects

↓

Skills

↓

Applications

↓

Interview History

↓

Career Goals

↓

Current Request

↓

AI
```

The AI should never respond using only the user's latest message if richer context is available.

---

# AI Knowledge Sources

The AI may use:

### Internal Context

- Career Profile
- Resume Versions
- Skills
- Projects
- Certifications
- Application History
- Interview Notes
- Career Goals

### External Context

- Job Descriptions
- Industry Best Practices
- Public Career Information
- Technology Trends

The AI must never permanently store external information as user data.

---

# AI Interaction Modes

## 1. Proactive AI

The system initiates recommendations.

Examples:

- Resume score decreased.
- Missing required skill.
- Upcoming interview.
- Application inactive for 30 days.

---

## 2. Reactive AI

The user requests assistance.

Examples:

- Review my resume.
- Analyze this job description.
- Suggest interview questions.
- Recommend skills.

---

## 3. Contextual AI

The AI automatically uses surrounding data.

Example:

User opens an application.

AI automatically considers:

- Resume used
- Job description
- Company
- Skills
- Previous interview outcomes

before generating advice.

---

# AI Workflow

```
User Action

↓

Collect Context

↓

Validate Context

↓

Construct Prompt

↓

Select Model

↓

Generate Response

↓

Validate Output

↓

Display Result

↓

Optional User Confirmation

↓

Persist if Required
```

---

# AI Capabilities

## Resume Review

Input

- Resume
- Career Profile

Output

- Grammar
- Formatting
- Missing sections
- Weak bullet points
- ATS suggestions
- Improvement ideas

---

## Job Analysis

Input

- Job Description

Output

- Required skills
- Preferred skills
- Responsibilities
- Resume alignment
- Missing qualifications

---

## Skill Gap Analysis

Input

- Career Profile
- Job Description

Output

- Missing skills
- Recommended learning priorities
- Strength areas

---

## Interview Preparation

Input

- Job
- Company
- Resume

Output

- Expected questions
- Technical topics
- Behavioral questions
- Preparation checklist

---

## Career Guidance

Input

Entire user profile.

Output

- Next career action
- Suggested projects
- Learning roadmap
- Resume improvements
- Application strategy

---

# AI Memory Strategy

CareerOS maintains structured memory instead of unrestricted conversation memory.

Persistent memory includes:

- Career goals
- Skills
- Experience
- Education
- Resume versions
- Applications
- Interview history

Temporary memory includes:

- Current conversation
- Current task
- Current uploaded files

Temporary memory expires after the interaction unless explicitly saved.

---

# AI Prompt Strategy

Prompt generation should follow a layered approach.

```
System Prompt

↓

Product Rules

↓

User Profile

↓

Current Context

↓

Current Request

↓

Output Instructions
```

Prompts should never be hardcoded into application logic.

Prompt templates should be centrally managed and version-controlled.

---

# Model Routing Strategy

Different AI tasks require different models.

| Task | Suggested Model Type |
|------|----------------------|
| Resume Review | Large Language Model |
| Skill Extraction | Lightweight LLM |
| Job Parsing | Lightweight LLM |
| Interview Guidance | Large Language Model |
| Career Advice | Large Language Model |
| Text Classification | Small Local Model |

The routing layer should determine the appropriate model based on task complexity.

---

# AI Response Principles

Every AI response should be:

- Relevant
- Actionable
- Transparent
- Explainable
- Context-aware
- Concise
- Non-deceptive

The AI should clearly distinguish between facts, assumptions, and suggestions.

---

# Confidence Handling

When confidence is high:

Provide direct recommendations.

When confidence is moderate:

Provide recommendations with explanation.

When confidence is low:

Request additional information before proceeding.

The AI should avoid presenting uncertain information as fact.

---

# Human Approval Requirements

The following actions always require user confirmation:

- Resume modifications
- Profile updates
- Data deletion
- External integrations
- Email generation
- Calendar events

AI may recommend actions but must not execute them automatically.

---

# Error Handling

If AI cannot complete a task:

- Explain the issue.
- Preserve user data.
- Suggest alternative actions.
- Allow retry.

Errors should never expose internal implementation details.

---

# Privacy & Security

The AI must:

- Use only authorized user data.
- Respect user permissions.
- Avoid sharing information between users.
- Never fabricate stored data.
- Never retain sensitive information beyond defined retention policies.

Users retain ownership of all uploaded documents and generated content.

---

# Future AI Capabilities

Potential future enhancements include:

- Mock interview simulations
- Voice interview coaching
- Portfolio analysis
- GitHub repository review
- LinkedIn profile optimization
- Personalized learning plans
- Salary negotiation guidance
- Career market trend forecasting

These are outside the MVP.

---

# Design Implications

This document influences:

- AI service architecture
- Prompt management
- Backend orchestration
- API design
- Database schema
- Cost optimization
- Security model
- User experience

Any changes to AI behavior should be evaluated against this document before implementation.

---

# References

## Depends On

- Product Requirements Document
- Information Architecture
- User Flows
- User Stories

## Used By

- AI Service Architecture
- Prompt Library
- Backend Development
- Frontend Development
- API Design
- Security Design

---

# Summary

CareerOS treats AI as an integrated career intelligence layer rather than a standalone chatbot. By combining structured user data, contextual analysis, and controlled AI workflows, the platform delivers personalized, explainable, and actionable guidance while maintaining user control, privacy, and trust.