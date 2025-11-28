# Implementation Plan: Shared Core Components

**Branch**: `002-shared-core-components` | **Date**: November 20, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-shared-core-components/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create shared infrastructure components for HDMS microservices: BaseModel abstract class with UUID primary keys, soft delete functionality, and timestamps; shared HTTP client utilities for inter-service communication with retry logic and authentication; standardized logging configuration across all Django services; and proper import configuration to enable all services to use shared code without fallback mechanisms. This reduces code duplication, ensures consistency, and improves maintainability across all microservices.

## Technical Context

**Language/Version**: Python 3.12+, Django 5.x  
**Primary Dependencies**: Django 5.x, requests library (for HTTP client), python-decouple (for configuration), uuid (standard library)  
**Storage**: PostgreSQL 16 (via PgBouncer) - BaseModel uses Django ORM, no direct storage for shared code  
**Testing**: pytest, pytest-django, Django test framework for model and client testing  
**Target Platform**: Linux containers (Docker), all Django microservices  
**Project Type**: Shared infrastructure library for microservices architecture  
**Performance Goals**: Soft delete operations <50ms, HTTP client requests with 5s default timeout, retry logic with exponential backoff, model creation setup <2 minutes  
**Constraints**: Must work across all Django services, shared code must be importable without path manipulation, logging format must be human-readable structured text, HTTP client must handle authentication and retries  
**Scale/Scope**: 4 Django microservices (user-service, ticket-service, communication-service, file-service), shared code in `services/shared/core/`, all services import from shared directory

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gates

✅ **IV. DRY and SOLID Principles**: This feature directly implements DRY by creating shared code in `services/shared/core/`. All models will inherit from `BaseModel` in shared code. Service clients will use shared HTTP client utilities. This aligns perfectly with the constitution requirement.

✅ **I. Microservices Architecture**: Shared code supports microservices by providing consistent infrastructure without tight coupling. Services remain independent while sharing common utilities.

✅ **II. Layered Architecture**: BaseModel supports the model layer, HTTP client supports the service layer for inter-service communication. Maintains clear layer boundaries.

✅ **V. Official Documentation Standards**: Implementation will follow Django official documentation patterns for models, managers, querysets, and HTTP clients.

✅ **VI. Real-Time Systems Architecture**: Logging configuration supports real-time systems by providing consistent observability across services.

✅ **VII. API Optimization and Performance**: HTTP client includes timeout configuration and retry logic for performance and reliability.

✅ **VIII. Containerization and Orchestration**: Shared code works within Docker containers, configuration externalized via environment variables.

**Status**: All gates pass. No violations detected. This feature directly supports constitution principles.

### Post-Phase 1 Re-check

✅ **IV. DRY and SOLID Principles**: Maintained - shared code eliminates duplication, BaseModel and HTTP client follow SOLID principles.  
✅ **I. Microservices Architecture**: Maintained - shared utilities support microservices without creating tight coupling.  
✅ **II. Layered Architecture**: Maintained - BaseModel for models, HTTP client for service layer.  
✅ **V. Official Documentation Standards**: Maintained - following Django and Python best practices.  
✅ **VI. Real-Time Systems Architecture**: Maintained - logging supports observability.  
✅ **VII. API Optimization and Performance**: Maintained - HTTP client optimized with timeouts and retries.  
✅ **VIII. Containerization and Orchestration**: Maintained - works within Docker environment.

**Status**: All gates pass. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/002-shared-core-components/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md         # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
services/
├── shared/
│   └── core/
│       ├── __init__.py
│       ├── models.py          # BaseModel, SoftDeleteManager, SoftDeleteQuerySet
│       ├── clients.py          # HTTP client utilities for inter-service communication
│       └── logging_config.py   # Shared logging configuration
│
├── user-service/
│   └── src/
│       └── core/
│           └── settings/
│               └── base.py     # Import shared code, configure logging
│
├── ticket-service/
│   └── src/
│       └── core/
│           └── settings/
│               └── base.py     # Import shared code, configure logging
│
├── communication-service/
│   └── src/
│       └── core/
│           └── settings/
│               └── base.py     # Import shared code, configure logging
│
└── file-service/
    └── src/
        └── core/
            └── settings/
                └── base.py     # Import shared code, configure logging
```

**Structure Decision**: Using existing `services/shared/core/` directory structure. Shared code is organized in a dedicated directory accessible to all Django services. Each service imports from shared code in their settings and model files. This follows the constitution requirement for shared code placement.

## Complexity Tracking

> **No violations detected - all complexity is justified and aligned with constitution principles**
