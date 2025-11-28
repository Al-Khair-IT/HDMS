# Research: Shared Core Components

**Feature**: Shared Core Components  
**Date**: November 20, 2025  
**Purpose**: Document research findings and decisions for shared infrastructure components

## Research Tasks

### 1. Django BaseModel with UUID and Soft Delete

**Task**: Research best practices for Django abstract base models with UUID primary keys and soft delete functionality.

**Findings**:
- Django supports UUIDField as primary key with `default=uuid.uuid4` and `editable=False`
- Soft delete pattern typically uses `is_deleted` boolean field with `deleted_at` timestamp
- Custom Manager and QuerySet are required to filter soft-deleted records by default
- Django's `auto_now_add` and `auto_now` handle timestamp fields automatically
- `db_index=True` on `is_deleted` improves query performance

**Decision**: Use Django's built-in UUIDField, BooleanField, and DateTimeField. Implement custom SoftDeleteManager and SoftDeleteQuerySet following Django's manager/queryset pattern.

**Rationale**: Django's ORM provides all necessary functionality. Custom manager pattern is standard Django practice for filtering querysets.

**Alternatives Considered**:
- Using third-party packages (django-model-utils, django-softdelete): Rejected - adds unnecessary dependency, we can implement with standard Django
- Hard deletes only: Rejected - violates data retention requirements and audit needs

### 2. HTTP Client for Inter-Service Communication

**Task**: Research best practices for HTTP client utilities in Python microservices with retry logic and authentication.

**Findings**:
- `requests` library is standard for HTTP in Python, supports timeouts, headers, and error handling
- Retry logic with exponential backoff is standard pattern for transient failures
- `urllib3.util.retry.Retry` provides built-in retry strategies
- Authentication tokens should be passed via `Authorization` header (Bearer token pattern)
- Default timeout of 5 seconds is reasonable for microservices (prevents hanging requests)
- Configurable retry attempts (default 3) with exponential backoff (0.5s, 1s, 2s) handles transient failures

**Decision**: Use `requests` library with `urllib3.util.retry.Retry` for retry logic. Implement generic HTTP client class with standard methods (get, post, put, delete, patch) and helper methods (get_json, post_json) for JSON handling.

**Rationale**: `requests` is the de facto standard, well-tested, and widely used. Built-in retry support reduces custom code. Generic client provides flexibility while helper methods reduce boilerplate.

**Alternatives Considered**:
- `httpx` (async HTTP client): Rejected - adds async complexity, Django services use synchronous code
- Service-specific clients: Rejected - violates DRY principle, generic client is more maintainable
- No retry logic: Rejected - transient network failures are common, retries improve reliability

### 3. Logging Configuration for Django Services

**Task**: Research structured text logging format for Django services that is human-readable and consistent.

**Findings**:
- Django's logging framework supports custom formatters
- Structured text format (not JSON) is more readable for developers during development
- Standard format includes: timestamp, log level, module name, message
- Format: `{levelname} {asctime} {module} {message}` provides good readability
- Multiple handlers (console, file) can use same formatter for consistency
- Environment-specific log levels (DEBUG for dev, INFO for prod) maintain structure

**Decision**: Use Django's built-in logging with custom formatter for structured text. Format: `{levelname} {asctime} {module} {message}` with consistent style across all services.

**Rationale**: Django's logging is sufficient, no external dependencies needed. Structured text is human-readable while still parseable by log analysis tools. Consistent format enables cross-service log analysis.

**Alternatives Considered**:
- JSON logging format: Rejected - less readable for developers, structured text is sufficient
- Third-party logging libraries (structlog): Rejected - adds dependency, Django logging is sufficient
- Plain text without structure: Rejected - harder to parse and analyze

### 4. Python Import Configuration for Shared Code

**Task**: Research how to configure Python imports for shared code across Django services in Docker containers.

**Findings**:
- Python's `sys.path` manipulation is fragile and not recommended
- Better approach: Add shared directory to `PYTHONPATH` environment variable or use `sys.path.insert(0, path)` in Django settings
- Django settings can add paths before importing models
- Alternative: Install shared code as a package (requires setup.py), but adds complexity
- Simplest: Add shared path to `sys.path` in each service's `settings/base.py` before any imports
- Docker Compose services share filesystem, so relative paths work: `services/shared/core`

**Decision**: Add shared directory to `sys.path` in each service's `settings/base.py` before importing shared code. Use relative path resolution from settings file location.

**Rationale**: Simple, works in Docker environment, no package installation needed. Each service explicitly configures imports in settings, making it clear and maintainable.

**Alternatives Considered**:
- Installing shared code as Python package: Rejected - adds complexity, requires setup.py and installation steps
- Using absolute imports with PYTHONPATH: Rejected - less portable, harder to configure
- Symlinks: Rejected - Docker-specific, not portable across environments

### 5. Retry Logic Implementation Details

**Task**: Research retry logic implementation with exponential backoff for HTTP requests.

**Findings**:
- `urllib3.util.retry.Retry` provides configurable retry strategies
- Exponential backoff: initial delay doubles after each retry (0.5s, 1s, 2s, 4s)
- Default: 3 retries for transient errors (connection errors, timeouts, 5xx responses)
- Should not retry on 4xx errors (client errors) except 429 (rate limiting)
- Configurable per-request override allows flexibility for different use cases

**Decision**: Use `urllib3.util.retry.Retry` with default 3 retries, exponential backoff (backoff_factor=0.5), retry on connection errors, timeouts, and 5xx responses. Allow per-request override.

**Rationale**: Built-in retry support is well-tested and handles edge cases. Exponential backoff prevents overwhelming failing services. Configurable override provides flexibility.

**Alternatives Considered**:
- Custom retry implementation: Rejected - reinventing wheel, urllib3 is battle-tested
- Fixed retry delay: Rejected - exponential backoff is standard practice
- No retries: Rejected - transient failures are common, retries improve reliability

## Summary of Decisions

1. **BaseModel**: Django standard fields (UUIDField, BooleanField, DateTimeField) with custom Manager/QuerySet
2. **HTTP Client**: `requests` library with `urllib3.util.retry.Retry`, generic client with helper methods
3. **Logging**: Django built-in logging with structured text formatter
4. **Imports**: `sys.path` manipulation in Django settings before imports
5. **Retry Logic**: urllib3 Retry with 3 attempts, exponential backoff, configurable override

All decisions align with Django best practices, minimize dependencies, and support the microservices architecture.

