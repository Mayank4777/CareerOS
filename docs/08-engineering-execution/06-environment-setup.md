# Environment Setup

## Purpose

This document defines the standard development environment for CareerOS.

Its purpose is to ensure every developer and AI coding agent uses a consistent environment, minimizing setup issues and environment-specific bugs.

This document is the official reference for local development setup.

---

# Supported Operating Systems

CareerOS officially supports:

- Windows 11
- Windows 10 (Latest Stable)
- Ubuntu LTS
- macOS (Latest Stable)

Development should primarily target Docker-based environments to maintain consistency across platforms.

---

# Development Prerequisites

Install the following software before setting up the project.

## Required

- Git
- Docker Desktop
- Docker Compose
- Node.js (LTS)
- Python 3.12+
- PostgreSQL (Optional if using Docker)
- Redis (Optional if using Docker)
- VS Code (Recommended)

---

# Recommended VS Code Extensions

Recommended extensions include:

- Python
- Pylance
- Docker
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (or Postman)

---

# Repository Setup

Clone the repository.

```bash
git clone <repository-url>
```

Move into the project directory.

```bash
cd CareerOS
```

---

# Project Structure

The repository should contain:

```text
CareerOS/

backend/
frontend/
docker/
docs/
scripts/

docker-compose.yml
.env.example
README.md
```

---

# Environment Variables

Create local environment files from the provided examples.

Backend

```text
backend/.env
```

Frontend

```text
frontend/.env
```

Do not commit local environment files.

Only `.env.example` files should be committed to version control.

---

# Docker Setup

Start the complete development environment.

```bash
docker compose up --build
```

Run in detached mode.

```bash
docker compose up -d
```

Stop containers.

```bash
docker compose down
```

Rebuild containers.

```bash
docker compose up --build
```

---

# Backend Setup

Move to backend directory.

```bash
cd backend
```

Create virtual environment if running without Docker.

```bash
python -m venv venv
```

Activate virtual environment.

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Apply migrations.

```bash
python manage.py migrate
```

Create administrator.

```bash
python manage.py createsuperuser
```

Run backend server.

```bash
python manage.py runserver
```

---

# Frontend Setup

Move to frontend directory.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Run development server.

```bash
npm run dev
```

Build production assets.

```bash
npm run build
```

---

# Database Setup

The primary database is PostgreSQL.

When using Docker:

- Database is created automatically.
- Connection is managed through Docker Compose.

When running locally:

- Create PostgreSQL database.
- Configure credentials in `.env`.
- Run migrations.

---

# Redis Setup

Redis is required for:

- Celery
- Background jobs
- Caching

When using Docker, Redis starts automatically.

When running locally, ensure Redis is running before starting the backend.

---

# Celery Setup

Start Celery worker.

```bash
celery -A config worker -l info
```

Start Celery Beat (if enabled).

```bash
celery -A config beat -l info
```

---

# Running the Complete Application

Using Docker:

```bash
docker compose up
```

Without Docker:

1. Start PostgreSQL
2. Start Redis
3. Start Backend
4. Start Celery Worker
5. Start Frontend

---

# Default Development Ports

| Service | Port |
|----------|------|
| Frontend | 5173 |
| Backend API | 8000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Nginx | 80 (Production) |

These ports may be changed through environment configuration if required.

---

# Initial Verification Checklist

Verify the following after setup:

- Docker containers are running.
- Backend starts successfully.
- Frontend starts successfully.
- PostgreSQL connection works.
- Redis connection works.
- Database migrations complete successfully.
- Admin user can log in.
- Health endpoint returns success.

---

# Updating Dependencies

Backend

```bash
pip install <package>
```

Update requirements.

```bash
pip freeze > requirements.txt
```

Frontend

```bash
npm install <package>
```

Commit updated lock files after dependency changes.

---

# Troubleshooting

## Docker Issues

- Restart Docker Desktop.
- Rebuild containers.
- Check Docker logs.
- Remove unused containers and volumes if necessary.

---

## Database Issues

- Verify PostgreSQL is running.
- Check environment variables.
- Re-run migrations.

---

## Redis Issues

- Verify Redis is running.
- Check Redis connection configuration.

---

## Frontend Issues

- Delete `node_modules`.
- Reinstall dependencies.
- Clear package manager cache if necessary.

---

## Backend Issues

- Verify Python version.
- Activate the virtual environment.
- Reinstall dependencies.
- Apply pending migrations.

---

# Development Best Practices

- Use Docker whenever possible.
- Keep dependencies up to date.
- Never commit secrets.
- Use environment variables for configuration.
- Test changes before committing.
- Keep local environments synchronized with the main branch.

---

# Related Documents

Before setting up the environment, refer to:

- @01-ai-context.md
- @02-development-roadmap.md
- @01-backend-structure.md
- @02-frontend-structure.md
- @05-devops-ci-cd.md

---

# End of Document