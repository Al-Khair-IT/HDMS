# Implementation Plan: Database & Infrastructure Setup

**Branch**: `001-database-infrastructure` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-database-infrastructure/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Set up PostgreSQL 16 and Redis 7 infrastructure in Docker Compose for HDMS microservices architecture. Configure PgBouncer connection pooling between Django services and PostgreSQL. Set up Redis for three purposes: caching (database 0), Django Channels (database 1), and Celery broker (database 2). Configure all 5 Django services (user-service, ticket-service, communication-service, file-service) to connect through PgBouncer. Implement environment-based configuration via .env files with health checks and data persistence.

## Technical Context

**Language/Version**: Python 3.12+, Docker, Docker Compose  
**Primary Dependencies**: PostgreSQL 16, Redis 7, PgBouncer (latest), Django 5.x (for service configuration)  
**Storage**: PostgreSQL 16 (shared database), Redis 7 (in-memory cache/queue), Docker volumes for persistence  
**Testing**: Docker Compose health checks, connection verification scripts, integration tests for service connectivity  
**Target Platform**: Linux containers (Docker), development and production environments  
**Project Type**: Infrastructure setup for microservices architecture  
**Performance Goals**: Database connections within 10 seconds of startup, Redis cache operations <50ms, 24-hour stability, automatic reconnection within 5 seconds  
**Constraints**: All services must connect through PgBouncer (not directly to PostgreSQL), Redis authentication optional for dev but configurable for production, environment-based configuration required  
**Scale/Scope**: 5 Django microservices, shared PostgreSQL database, shared Redis instance with 3 logical databases, PgBouncer connection pool (25-50 connections)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gates

✅ **I. Microservices Architecture**: Infrastructure setup aligns with microservices - shared database and Redis, but services remain independent containers.  
✅ **VIII. Containerization and Orchestration**: Using Docker and Docker Compose as required. Configuration externalized via environment variables.  
✅ **VII. API Optimization and Performance**: PgBouncer connection pooling included for performance optimization.  
✅ **VI. Real-Time Systems Architecture**: Redis configured for Django Channels and Celery as required.  
✅ **V. Official Documentation Standards**: Using official Docker Compose, PostgreSQL, Redis, and PgBouncer documentation patterns.

**Status**: All gates pass. No violations detected.

### Post-Phase 1 Re-check

✅ **I. Microservices Architecture**: Maintained - services remain independent containers with shared infrastructure.  
✅ **VIII. Containerization and Orchestration**: Maintained - Docker Compose configuration complete with health checks and volumes.  
✅ **VII. API Optimization and Performance**: Maintained - PgBouncer connection pooling configured.  
✅ **VI. Real-Time Systems Architecture**: Maintained - Redis configured for Channels (database 1) and Celery (database 2).  
✅ **V. Official Documentation Standards**: Maintained - following official documentation for all components.

**Status**: All gates pass. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-database-infrastructure/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
docker-compose.yml       # Main Docker Compose file with all services
docker-compose.dev.yml   # Development overrides (optional)
docker-compose.prod.yml  # Production overrides (optional)

services/
├── user-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       └── core/
│           └── settings/
│               └── base.py (DATABASES, CACHES config)
├── ticket-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       └── core/
│           └── settings/
│               └── base.py (DATABASES, CACHES config)
├── communication-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       └── core/
│           └── settings/
│               └── base.py (DATABASES, CACHES, CHANNEL_LAYERS config)
├── file-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       └── core/
│           ├── settings/
│           │   └── base.py (DATABASES, CACHES, CELERY_BROKER_URL config)
│           └── celery.py (Celery configuration)
└── frontend-service/
    ├── Dockerfile
    ├── package.json
    └── .env.example

scripts/
├── verify-db-connection.sh
├── verify-cache-connection.sh
├── verify-celery-broker.sh
├── verify-channels-connection.sh
├── verify-all-connections.sh
├── verify-health-checks.sh
├── start-infrastructure.sh
└── stop-infrastructure.sh

config/
└── pgbouncer/
    └── pgbouncer.ini.example

docs/
└── environment-variables.md

volumes/
├── postgres_data/        # PostgreSQL data persistence
├── redis_data/          # Redis data persistence
└── pgbouncer_data/      # PgBouncer configuration persistence
```

**Structure Decision**: Infrastructure setup follows microservices architecture. Docker Compose orchestrates PostgreSQL, PgBouncer, and Redis containers. Each Django service has its own directory with Dockerfile and settings configuration. Shared infrastructure (database, Redis) is defined in root docker-compose.yml. Environment configuration via .env files per service. Verification scripts in `scripts/` directory for connection testing.

## Phase 0: Research Complete

**Status**: ✅ Complete

All technical decisions resolved in `research.md`:
- PgBouncer configuration (transaction pooling mode)
- Redis multi-database setup (databases 0, 1, 2)
- Docker Compose health checks (30s interval, 3 retries, 10s timeout)
- Environment variable management (python-decouple/django-environ)
- Connection string formats and timeouts
- Docker volume persistence

**Research Document**: [research.md](./research.md)

---

## Phase 1: Design & Contracts Complete

**Status**: ✅ Complete

### Data Model
Configuration entities defined for PostgreSQL, PgBouncer, Redis, and Django service settings.

**Data Model Document**: [data-model.md](./data-model.md)

### API Contracts
Docker Compose service definitions and configuration schemas.

**Contract Documents**:
- [contracts/docker-compose-schema.md](./contracts/docker-compose-schema.md)

### Quickstart Guide
Step-by-step setup instructions for developers.

**Quickstart Document**: [quickstart.md](./quickstart.md)

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All design decisions align with HDMS constitution principles.
