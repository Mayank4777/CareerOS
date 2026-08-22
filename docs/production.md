# CareerOS — Production Operational Hardening & Backup Guide

This document outlines deployment standards, operational persistence architecture, database backup requirements, and disaster recovery procedures for CareerOS.

---

## 1. Production Architecture Overview

- **Backend Application Server**: Django 5.2 running under Gunicorn WSGI (`config.wsgi:application`) on Python 3.13.
- **Frontend Web Server**: React single-page application compiled via Vite and served via Nginx.
- **Database (Source of Truth)**: PostgreSQL 16 (`career_os` database).
- **Cache & Message Broker**: Redis 7 (`redis://redis:6379/1` for Django Cache, `redis://redis:6379/0` for Celery broker).
- **Process Orchestration**: Docker Compose (`docker-compose.yml` + `docker-compose.prod.yml`).

---

## 2. PostgreSQL Persistence & Volume Management

In the Docker Compose setup, PostgreSQL data is persisted via a named Docker volume:

```yaml
volumes:
  postgres_data:
    name: careeros_postgres_data
```

> [!IMPORTANT]
> **Docker Volume Persistence is NOT a Backup.**
> A Docker volume preserves data across container restarts and rebuilds. However, Docker volume storage does not protect against host disk corruption, accidental volume removal (`docker compose down -v`), database corruption, or regional infrastructure failures.

---

## 3. Database Backup & Disaster Recovery Strategy

PostgreSQL contains all persistent candidate user profiles, saved jobs, resumes, career roadmaps, and analysis records.

### Recommended Backup Frequency
- **Automated Full Backup**: Daily snapshot (off-peak hours).
- **Transaction Logs (WAL / PITR)**: Point-in-time recovery enabled with continuous archive retention (7 to 30 days).
- **Pre-Deployment Backup**: Mandatory full database snapshot executed immediately before applying database schema migrations.

### Backup Methods

#### Option A: Managed Cloud Provider Snapshots (Recommended for Production)
When deployed on cloud infrastructure (e.g., AWS RDS, GCP Cloud SQL, Azure Database for PostgreSQL):
1. Enable automated daily snapshots with a minimum 14-day retention window.
2. Enable multi-AZ replication and Point-In-Time Recovery (PITR).
3. Test cloud snapshot restoration in an isolated staging environment quarterly.

#### Option B: Self-Hosted `pg_dump` Backup Script (Example)
For self-hosted Docker deployments:

```bash
#!/usr/bin/env bash
# Example automated pg_dump backup script
set -euo pipefail

BACKUP_DIR="/var/backups/careeros"
TIMESTAMP=$(date +"%Y%m%m_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/careeros_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

docker exec careeros-postgres pg_dump \
  -U "${POSTGRES_USER:-career_os}" \
  -d "${POSTGRES_DB:-career_os}" \
  --format=plain \
  --no-owner \
  --no-acl | gzip -9 > "${BACKUP_FILE}"

echo "Database backup completed successfully: ${BACKUP_FILE}"
```

---

## 4. Disaster Recovery & Restoration Procedure

> [!WARNING]
> Restoration overwrites existing database state. Always verify the target database environment before executing a restore operation.

### Restoration Steps (Self-Hosted Example)

1. Stop application traffic to prevent concurrent database writes:
   ```bash
   docker compose stop backend
   ```

2. Restore the PostgreSQL database from a gzipped SQL dump:
   ```bash
   gunzip -c /var/backups/careeros/careeros_db_YYYYMMDD_HHMMSS.sql.gz | \
     docker exec -i careeros-postgres psql -U career_os -d career_os
   ```

3. Run database migrations to ensure schema alignment:
   ```bash
   docker compose exec backend python manage.py migrate
   ```

4. Verify backend health via the unauthenticated health endpoint:
   ```bash
   curl -f http://localhost:8000/api/v1/health/
   ```

5. Restart the application backend:
   ```bash
   docker compose start backend
   ```

---

## 5. Health Monitoring & Observability

CareerOS provides a lightweight production health endpoint:

- **URL**: `GET /api/v1/health/`
- **Authentication**: None (`AllowAny`)
- **HTTP 200 (Healthy Response)**:
  ```json
  {
    "status": "ok",
    "database": "ok",
    "redis": "ok"
  }
  ```
- **HTTP 503 (Unhealthy Response)**:
  ```json
  {
    "status": "unhealthy",
    "database": "error",
    "redis": "ok"
  }
  ```

---

## 6. Pre-Production Launch Checklist

- [ ] `DJANGO_SETTINGS_MODULE` set to `config.settings.prod`.
- [ ] `DJANGO_SECRET_KEY` injected from secret manager (50+ random characters).
- [ ] `DJANGO_ALLOWED_HOSTS` restricted to valid production domain names.
- [ ] SSL termination & HTTPS redirect enabled (`DJANGO_SECURE_SSL_REDIRECT=True`).
- [ ] Automated PostgreSQL database backups configured and verified via test restore.
- [ ] Production healthcheck (`/api/v1/health/`) responding HTTP 200 OK.
