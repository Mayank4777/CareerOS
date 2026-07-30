# UX Writing Guidelines

**Product:** CareerOS  
**Document Version:** 1.0  
**Status:** Approved  
**Last Updated:** July 29, 2026

---

# Purpose

This document defines the writing standards used throughout CareerOS.

The goal is to ensure every screen, button, notification, AI recommendation, and system message uses a consistent voice that is clear, professional, and helpful.

---

# Writing Principles

CareerOS communication should always be:

- Clear
- Concise
- Professional
- Friendly
- Action-oriented
- Honest
- Encouraging

Users should immediately understand:

- What happened
- Why it happened
- What to do next

---

# Brand Voice

CareerOS is:

- Professional, not corporate
- Friendly, not casual
- Helpful, not overly conversational
- Confident, not arrogant
- Supportive, not patronizing

---

# Tone by Context

| Situation | Tone |
|-----------|------|
| Dashboard | Informative |
| AI Advice | Supportive |
| Errors | Calm |
| Success | Positive |
| Forms | Direct |
| Settings | Neutral |
| Empty States | Encouraging |

---

# General Writing Rules

Always:

- Use sentence case.
- Use active voice.
- Write short sentences.
- Prefer common words.
- Explain technical concepts simply.
- Be specific.

Avoid:

- Jargon
- Buzzwords
- Marketing language
- Unnecessary punctuation
- Emoji inside the application
- ALL CAPS

---

# Button Labels

Use verbs.

Good examples:

- Save
- Create
- Continue
- Edit
- Delete
- Upload
- Download
- Apply
- Schedule
- Cancel
- Retry

Avoid:

- Submit Data
- Proceed Now
- Click Here
- Okay
- Go

---

# Navigation Labels

Use short nouns.

Examples:

- Dashboard
- Profile
- Resume
- Jobs
- Applications
- Interviews
- AI Coach
- Settings

---

# Form Labels

Use clear nouns.

Good:

- Full Name
- Email Address
- Company Name
- Job Title
- Start Date

Avoid:

- Name Here
- Enter Company
- Your Email

---

# Helper Text

Explain only when necessary.

Example:

Password

Use at least 8 characters including one number.

---

# Placeholder Text

Use examples instead of repeating labels.

Good:

```
Software Engineer
```

```
Google
```

```
jane@example.com
```

Avoid:

```
Enter job title
```

---

# Validation Messages

Good:

- Email address is required.
- Please enter a valid email address.
- Password must contain at least 8 characters.
- End date cannot be before the start date.

Avoid:

- Invalid input.
- Something went wrong.
- Error 400.

---

# Success Messages

Short and reassuring.

Examples:

- Profile updated successfully.
- Resume saved.
- Application created.
- Interview scheduled.
- Settings updated.

---

# Error Messages

Structure:

Problem

↓

Reason (if helpful)

↓

Solution

Example:

Unable to upload your resume.

The file exceeds the maximum size of 10 MB.

Please upload a smaller PDF or DOCX file.

---

# Empty States

Every empty state should contain:

- Title
- Description
- Primary Action

Example:

## No applications yet

Track every application in one place.

[ Create Application ]

---

# Loading Messages

Avoid unnecessary text.

Prefer:

- Skeleton loading
- Progress indicators

If text is required:

- Loading applications...
- Analyzing your resume...
- Generating recommendations...

---

# Confirmation Dialogs

Use for destructive actions only.

Example:

Delete Resume?

This action cannot be undone.

[ Cancel ]

[ Delete ]

---

# Notifications

Keep to one sentence.

Examples:

- Resume exported successfully.
- Application archived.
- Interview reminder created.

---

# Search

Empty results example:

No matching applications found.

Try changing your search terms or filters.

---

# AI Writing Style

AI recommendations should:

- Explain reasoning
- Suggest actions
- Avoid certainty when uncertain
- Never exaggerate

Good:

Your resume could be stronger by highlighting measurable project outcomes.

Consider adding metrics where possible.

Avoid:

This resume is terrible.

You will not get hired.

---

# AI Confidence

When confidence is moderate or low, indicate uncertainty.

Examples:

- This recommendation may improve your resume.
- Based on your profile, this role appears to be a good match.
- Consider reviewing this suggestion before applying.

---

# Date & Time Format

Use:

```
29 Jul 2026
```

Time:

```
3:30 PM
```

---

# Numbers

Use commas for large numbers.

Example:

```
1,250
```

Percentages:

```
85%
```

---

# File Names

Use descriptive names.

Examples:

Resume-Mayank-Parmar.pdf

Resume-Frontend-v2.pdf

Avoid:

resume.pdf

finalfinalresume.pdf

---

# Accessibility Writing

Avoid:

- Click here
- Read more
- Learn more

Prefer:

- View resume
- Open application
- Review interview details

Links should describe the destination.

---

# Inclusive Language

Use:

- They / Them
- User
- Candidate

Avoid assumptions about:

- Gender
- Experience level
- Background
- Employment status

---

# Microcopy Checklist

Before publishing, verify:

- Is it clear?
- Is it concise?
- Is it helpful?
- Is it actionable?
- Is it consistent?
- Does it match the product tone?

---

# References

## Depends On

- Design System
- Component Library

## Used By

- UI Design
- Frontend Development
- QA
- AI Responses
- Product Content

---

# Summary

The UX Writing Guidelines establish a consistent voice for CareerOS across every interaction. By using clear, professional, and supportive language, the product helps users accomplish tasks with confidence while maintaining a cohesive experience throughout the platform.