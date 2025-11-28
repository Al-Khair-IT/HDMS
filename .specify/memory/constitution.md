<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0
Modified principles: None (initial creation)
Added sections: Core Principles (10 principles), Technology Stack Requirements, Development Workflow, Security & Compliance
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section already exists
  ✅ .specify/templates/spec-template.md - No direct constitution references
  ✅ .specify/templates/tasks-template.md - No direct constitution references
Follow-up TODOs: None
-->

# HDMS Constitution

## Core Principles

### I. Microservices Architecture (NON-NEGOTIABLE)
HDMS MUST be built as a microservices architecture with clear service boundaries. Each service handles a specific domain and runs in its own Docker container. Services communicate via REST APIs (synchronous) and Redis pub/sub (asynchronous). Frontend MUST only call the API Gateway, never individual services directly. Service boundaries MUST be respected - inter-service validation performed via HTTP API calls, not direct database access.

**Rationale**: Enables independent deployment, scaling, and maintenance. Clear boundaries prevent tight coupling and ensure long-term maintainability.

### II. Layered Architecture (NON-NEGOTIABLE)
All services MUST follow a layered architecture pattern: Controllers (API layer) → Services (Business Logic) → Repositories/Selectors (Data Access) → Models (Data Persistence). Business logic MUST NOT reside in controllers or models. Each layer has a single responsibility and clear boundaries.

**Rationale**: Ensures separation of concerns, testability, and maintainability. Follows SOLID principles and industry best practices.

### III. Test-First Development (NON-NEGOTIABLE)
TDD is mandatory for all new features: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. Minimum 80% code coverage required. Unit tests for business logic, integration tests for workflows and inter-service communication. Tests MUST be written before implementation code.

**Rationale**: Prevents regressions, ensures code quality, and provides living documentation. Critical for microservices where services must work independently.

### IV. DRY and SOLID Principles
Code MUST follow DRY (Don't Repeat Yourself) and SOLID principles. Shared code MUST be placed in `services/shared/core/`. All models inherit from `BaseModel` in shared code. Service clients for inter-service communication MUST use shared client utilities. Complexity MUST be justified - simpler alternatives considered first.

**Rationale**: Reduces maintenance burden, improves code quality, and ensures consistency across services. Shared code prevents duplication and ensures uniform behavior.

### V. Official Documentation Standards
All implementations MUST follow official documentation for each technology stack. Use official folder/file structures (e.g., Next.js app router structure, Django app structure). When available, use code examples from official documentation. Technology choices MUST be justified and align with project requirements.

**Rationale**: Ensures compatibility, maintainability, and leverages community best practices. Official docs provide tested, supported patterns.

### VI. Real-Time Systems Architecture
Real-time features MUST use appropriate technologies: Redis pub/sub for asynchronous events, Django Channels for WebSocket connections, Celery for background tasks. WebSocket authentication MUST validate JWT tokens. Real-time updates MUST be delivered within 3 seconds of the event. All real-time systems MUST handle connection failures gracefully with retry logic.

**Rationale**: Provides responsive user experience and reliable event delivery. Proper architecture ensures scalability and fault tolerance.

### VII. API Optimization and Performance
APIs MUST be optimized for speed and scalability. Response times MUST be <250ms for major routes. Implement caching using Cache-Aside pattern with Redis. Use database connection pooling (PgBouncer). Implement rate limiting per role. Query optimization MUST be performed before deployment using Django Debug Toolbar and query analysis tools.

**Rationale**: Ensures system responsiveness and scalability. Performance is critical for user experience and system efficiency.

### VIII. Containerization and Orchestration
All services MUST be containerized using Docker. Docker Compose MUST be used for local development and production deployment. Kubernetes manifests MUST be provided for each service (future deployment). Services MUST be stateless and environment-agnostic. Configuration MUST be externalized via environment variables.

**Rationale**: Enables consistent deployments, scalability, and environment parity. Containerization simplifies deployment and operations.

### IX. CI/CD Integration
CI/CD hooks MUST be included when relevant. Automated testing MUST run in CI pipeline. Failed tests MUST block deployment. Database migrations MUST be tested in CI before production. Deployment automation MUST be configured for staging and production environments.

**Rationale**: Ensures code quality, prevents regressions, and enables rapid, reliable deployments. Automation reduces human error and accelerates delivery.

### X. Professional UI/UX Design
Frontend MUST follow best practices of UI and UX design as a professional UX specialist. User interfaces MUST be intuitive, accessible, and responsive. Design system MUST be consistent (using ShadCN/UI components). User feedback MUST be considered in design decisions. Performance metrics MUST be monitored (dashboard load <2 seconds).

**Rationale**: Ensures user adoption and satisfaction. Professional design improves productivity and reduces training requirements.

## Technology Stack Requirements

### Backend Services
- **Framework**: Django 5.x (Python 3.12+)
- **API Layer**: Django Ninja 1.2+
- **Database**: PostgreSQL 16
- **Real-time**: Django Channels + Redis 7
- **Background Tasks**: Celery 5.3.x + Redis
- **State Machine**: django-fsm
- **Authentication**: JWT (djangorestframework-simplejwt)

### Frontend Service
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4
- **Components**: ShadCN/UI + Lucide React Icons
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **API Gateway**: Nginx
- **Connection Pooling**: PgBouncer
- **File Storage**: Local (development), AWS S3 or Cloudflare R2 (production)
- **Monitoring**: Celery Flower (background tasks)

### Development Tools
- **Version Control**: Git + GitHub
- **AI-Powered IDE**: Cursor AI
- **Linting**: ESLint + Prettier (Frontend), Black (Backend)
- **Testing**: Jest (Frontend), Pytest + pytest-django (Backend)

## Development Workflow

### Service Structure
Each microservice MUST follow this structure:
```
service-name/
├── Dockerfile
├── requirements.txt (or package.json)
├── .env.example
└── src/
    ├── manage.py (Django services)
    ├── core/
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py (or asgi.py for WebSocket services)
    │   └── clients/ (inter-service HTTP clients)
    └── apps/
        └── [app-name]/
            ├── models.py
            ├── api.py (Django Ninja endpoints)
            ├── schemas.py (Pydantic schemas)
            ├── services.py (business logic)
            └── tests.py
```

### Code Organization
- **Models**: Inherit from `shared.core.models.BaseModel`
- **Business Logic**: MUST be in service layer, not controllers or models
- **API Endpoints**: Django Ninja routers organized by version (`/api/v1/`)
- **Inter-Service Calls**: Use shared HTTP client utilities from `services/shared/core/clients.py`
- **Shared Code**: Place in `services/shared/core/` and import across services

### Testing Requirements
- **Unit Tests**: Model tests, service layer tests, API endpoint tests
- **Integration Tests**: End-to-end workflow tests, inter-service communication tests, WebSocket tests
- **Coverage**: Minimum 80% code coverage
- **Test Execution**: Tests MUST run in CI/CD pipeline, failed tests block deployment

### Database Migrations
- **Migration Strategy**: All schema changes via Django migrations
- **Version Control**: Migrations MUST be version-controlled and reviewed
- **Zero-Downtime**: Preferred for production migrations
- **Rollback**: Each migration MUST include reverse operation
- **Testing**: Migrations MUST be tested in staging before production

## Security & Compliance

### Authentication & Authorization
- **JWT Tokens**: Access and refresh tokens with rotation
- **Rate Limiting**: Token Bucket algorithm, role-based limits
- **Password Security**: Argon2 hashing
- **WebSocket Auth**: JWT validation on connection

### Data Protection
- **Soft Deletes**: All deletions are soft deletes (is_deleted=True)
- **Audit Logging**: All state changes logged with user, timestamp, before/after state
- **Audit Retention**: 7 years active, indefinite archived
- **Data Encryption**: Encrypted at rest, secure file uploads with antivirus scanning

### Input Validation
- **Multi-Layer**: Client-side (UX), server-side (security), database constraints
- **Sanitization**: HTML sanitization for user-generated content
- **File Validation**: MIME type, extension, and content validation
- **SQL Injection**: Prevented via Django ORM (parameterized queries)

### API Security
- **Versioning**: `/api/v1/` prefix, URL-based versioning
- **CORS**: Configured for frontend origin only
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting**: Per-role limits, login endpoint: 10/min

## Governance

### Constitution Supremacy
This constitution supersedes all other practices and documentation. All development decisions MUST align with these principles. When conflicts arise, constitution principles take precedence.

### Amendment Process
Amendments to this constitution require:
1. **Documentation**: Clear rationale for the change
2. **Approval**: Review and approval by project stakeholders
3. **Migration Plan**: If breaking changes, provide migration strategy
4. **Version Update**: Increment version according to semantic versioning:
   - **MAJOR**: Backward incompatible governance/principle removals or redefinitions
   - **MINOR**: New principle/section added or materially expanded guidance
   - **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review
- All PRs/reviews MUST verify compliance with constitution principles
- Complexity MUST be justified if it violates simplicity principles
- Test coverage MUST meet minimum requirements before merge
- Architecture decisions MUST align with microservices principles

### Development Guidance
- Use this constitution for runtime development guidance
- Reference `.specify/templates/` for feature specification and planning
- Follow implementation task list in `Docs/11-Implementation-Task-List.md`
- Consult technical architecture in `Docs/03-Technical-Architecture.md`

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
