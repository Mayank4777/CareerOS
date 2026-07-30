# PROJECT_MASTER_CONTEXT

**Project Name:** CareerOS

**Version:** 1.0

**Status:** Product Design Complete

**Last Updated:** July 29, 2026

---

# Project Overview

CareerOS is an AI-first Career Operating System designed to help users manage and improve every stage of their professional journey.

It is **not** a job portal.

It is **not** a resume builder.

It is **not** another AI chatbot.

CareerOS acts as a personal operating system for a user's career by collecting professional information, organizing it, analyzing it with AI, and guiding users toward better career decisions.

---

# Core Philosophy

CareerOS follows three principles:

```
Collect

↓

Understand

↓

Guide
```

Everything inside the product supports these three stages.

---

# Product Vision

Create the most intelligent personal career management platform that helps people organize, improve, and grow their careers using AI while keeping the user in complete control.

---

# Product Mission

Enable users to manage resumes, applications, interviews, skills, career goals, and AI recommendations from one unified platform.

---

# Product Goals

Primary goals:

- Organize career information
- Improve resumes using AI
- Track job applications
- Prepare for interviews
- Identify skill gaps
- Recommend career improvements
- Provide actionable AI guidance

---

# Non-Goals

CareerOS is NOT:

- LinkedIn
- Indeed
- Naukri
- Glassdoor
- A social network
- A learning platform
- A recruiter CRM

---

# Target Users

Primary:

- Students
- Fresh graduates
- Job seekers
- Early-career professionals

Future:

- Experienced professionals
- Career coaches
- Universities
- Recruiters

---

# MVP Modules

- Dashboard
- Career Profile
- Resume
- Jobs
- Applications
- Interviews
- AI Career Coach
- Settings

---

# Resume Strategy

An existing Resume Builder project already exists.

Technology:

- Flask
- MySQL
- HTML
- CSS
- JavaScript

Decision:

Do NOT rebuild it.

Instead:

- Refactor
- Integrate
- Gradually migrate into CareerOS

The Resume Builder becomes the Resume module.

---

# Technology Direction

Current direction:

Frontend

- React
- TypeScript
- Tailwind CSS
- Component-based architecture

Backend

- Django
- Django REST Framework

Database

- PostgreSQL

Authentication

- JWT
- Refresh Tokens

Storage

- Cloud object storage

AI

- Multiple LLM providers
- Provider abstraction layer
- Prompt management
- Context-aware AI

Deployment

- Docker
- Cloud deployment
- CI/CD

(The exact technologies will be finalized during the System Architecture phase.)

---

# Design Philosophy

CareerOS should resemble products such as:

- Linear
- GitHub
- Notion
- Stripe Dashboard
- Vercel
- Raycast
- Supabase

Avoid:

- Neon colors
- Heavy gradients
- Glassmorphism
- Oversized border radii
- AI-generated-looking UI

The interface should feel professional, timeless, and trustworthy.

---

# Completed Documentation

## Product Discovery

- Vision
- Mission
- Problem Statement
- Problem Validation
- Target Persona
- Jobs To Be Done
- User Journey
- Product Principles
- Value Proposition
- Competitor Analysis
- Market Research

---

## Product Definition

- PRD
- MVP Definition
- Feature Inventory
- Feature Prioritization
- Epics
- User Stories
- Acceptance Criteria

---

## Product Design

- Information Architecture
- User Flow
- AI Interaction Design
- Domain Model
- State Management
- Design System
- Design Tokens
- Component Library
- Screen Inventory
- Navigation Map
- Page Layout Templates
- UX Writing Guidelines
- Accessibility Checklist

---

# Product Design Summary

The design system has already been defined.

Key decisions:

- 8px spacing system
- Neutral color palette
- Professional blue primary accent
- Desktop-first
- Reusable components
- Seven page templates
- WCAG 2.2 AA compliance
- AI-first UX

---

# Development Principles

Always:

- Build reusable components
- Follow Design Tokens
- Follow Component Library
- Use semantic HTML
- Keep business logic separate from UI
- Prefer composition over duplication
- Write scalable code

Never:

- Hardcode colors
- Hardcode spacing
- Create one-off layouts
- Ignore accessibility
- Duplicate business logic

---

# AI Development Rules

When generating code:

1. Follow the Design System.
2. Use Design Tokens.
3. Reuse existing components.
4. Follow Page Layout Templates.
5. Respect the Navigation Map.
6. Keep components modular.
7. Prioritize readability over cleverness.
8. Generate production-quality code, not demos.
9. Avoid placeholder implementations unless requested.
10. Explain trade-offs when proposing architecture changes.

---

# Folder Structure (Planned)

```
careeros/

docs/
project-context/

frontend/

backend/

shared/

scripts/

docker/

.github/

README.md
```

This structure may evolve during the architecture phase.

---

# Current Phase

Completed:

✅ Product Discovery

✅ Product Definition

✅ Product Design

Current milestone:

Ready to begin System Architecture.

---

# Next Phase

System Architecture

Planned documents:

1. System Architecture Overview
2. Technology Stack
3. Database Design (ERD)
4. API Design Standards
5. Authentication & Authorization
6. AI Architecture
7. File Storage Strategy
8. Background Jobs
9. Notification Architecture
10. Security Architecture
11. Deployment Architecture
12. Monitoring & Logging

---

# Development Workflow

Recommended order:

1. Complete architecture documentation.
2. Create database schema.
3. Define APIs.
4. Produce low-fidelity wireframes.
5. Design high-fidelity UI.
6. Build frontend foundation.
7. Build backend foundation.
8. Integrate AI.
9. Connect modules.
10. Testing and deployment.

---

# Long-Term Vision

Future modules may include:

- Portfolio
- Learning Hub
- Career Analytics
- Recruiter Workspace
- University Portal
- Community
- Mobile App
- Browser Extension
- AI Mock Interviews
- White-label editions

---

# Working Agreement

When continuing this project:

- Assume all completed documentation is the source of truth.
- Maintain consistency with previous architectural decisions unless a better alternative is justified.
- Prioritize scalability, maintainability, and production readiness over short-term convenience.
- Treat CareerOS as a real SaaS product intended for long-term development rather than a demo or portfolio project.

---

# Thread Handoff Prompt

Use this prompt at the start of every new conversation:

> I am continuing the CareerOS project. Read this PROJECT_MASTER_CONTEXT.md as the authoritative context. Product Discovery, Product Definition, and Product Design are complete. Continue from the current phase without redefining previous decisions unless there is a strong architectural reason. Build production-quality documentation, architecture, and implementation suitable for a real SaaS product.