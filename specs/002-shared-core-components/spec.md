# Feature Specification: Shared Core Components

**Feature Branch**: `002-shared-core-components`  
**Created**: November 20, 2025  
**Status**: Draft  
**Input**: User description: "Task 1.3: Create shared BaseModel abstract class in services/shared/core/models.py with UUID primary key, soft delete functionality (is_deleted, deleted_at), timestamps (created_at, updated_at), SoftDeleteManager, and SoftDeleteQuerySet. Create shared HTTP client utilities in services/shared/core/clients.py for inter-service communication. Configure each Django service to import from shared code. Set up logging configuration for each service."

## Clarifications

### Session 2025-11-20

- Q: What methods should the shared HTTP client provide? Should it be a generic client with standard HTTP methods, or service-specific client classes? → A: Generic HTTP client with standard methods (get, post, put, delete, patch) plus helper methods for common patterns (e.g., get_json, post_json)
- Q: What log format should be used across all services? JSON for machine parsing, or structured text for human readability? → A: Structured text format (human-readable with consistent fields, easier for developers to read directly)
- Q: Should the shared HTTP client implement automatic retries for failed requests and/or circuit breaker patterns? → A: Retry logic with configurable attempts and backoff strategy (defaults provided, customizable per request)
- Q: How should the HTTP client obtain authentication tokens? Should services pass tokens explicitly, or should the client retrieve them automatically? → A: HTTP client accepts tokens as optional parameters, with automatic retrieval from settings/token service when not provided
- Q: What should be the default timeout value for HTTP client requests? → A: Default timeout of 5 seconds with per-request override capability

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shared BaseModel for Consistent Data Models (Priority: P1) 🎯 MVP

Developers need a standardized base model class that all Django models can inherit from, providing consistent UUID primary keys, soft delete functionality, and automatic timestamp tracking across all microservices.

**Why this priority**: This is foundational infrastructure that enables consistent data modeling across services, reduces code duplication, and ensures uniform behavior for soft deletes and timestamps. Without this, each service would need to duplicate this logic, leading to inconsistencies and maintenance overhead.

**Independent Test**: Can be fully tested by creating a test model that inherits from BaseModel, verifying UUID generation, soft delete operations, and timestamp updates work correctly. This delivers immediate value by providing a reusable foundation for all data models.

**Acceptance Scenarios**:

1. **Given** a Django model inheriting from BaseModel, **When** an instance is created, **Then** it automatically receives a UUID primary key, created_at timestamp, and is_deleted is set to False
2. **Given** a model instance with soft delete capability, **When** soft_delete() is called, **Then** is_deleted is set to True, deleted_at is set to current timestamp, and the record is excluded from default queryset
3. **Given** a soft-deleted record, **When** restore() is called, **Then** is_deleted is set to False, deleted_at is cleared, and the record is included in default queryset
4. **Given** a model using SoftDeleteManager, **When** querying records, **Then** only non-deleted records are returned by default, with options to query deleted or all records
5. **Given** a model instance, **When** it is updated, **Then** updated_at timestamp is automatically refreshed

---

### User Story 2 - Shared HTTP Client for Inter-Service Communication (Priority: P1) 🎯 MVP

Developers need reusable HTTP client utilities to communicate between microservices, reducing code duplication and ensuring consistent error handling, timeout management, and authentication across service-to-service calls.

**Why this priority**: Inter-service communication is critical for microservices architecture. Without shared utilities, each service duplicates HTTP client logic, leading to inconsistent error handling, timeout configurations, and potential security issues. This directly impacts system reliability and maintainability.

**Independent Test**: Can be fully tested by creating a test service that uses the shared HTTP client to make requests to another service, verifying proper error handling, timeout behavior, and response parsing. This delivers immediate value by standardizing service communication patterns.

**Acceptance Scenarios**:

1. **Given** a service needs to call another microservice, **When** using the shared HTTP client, **Then** the request includes proper authentication headers, timeout configuration, and error handling
2. **Given** a service-to-service request fails, **When** using the shared HTTP client, **Then** appropriate error responses are returned with consistent error format
3. **Given** a service needs to make authenticated requests, **When** using the shared HTTP client with a token parameter, **Then** the provided token is included in request headers
4. **Given** a service makes a request without providing a token, **When** using the shared HTTP client, **Then** the client automatically retrieves a token from configured settings or token service and includes it in request headers
5. **Given** network timeouts occur, **When** using the shared HTTP client, **Then** requests fail gracefully with timeout errors rather than hanging indefinitely
6. **Given** a transient network failure occurs, **When** using the shared HTTP client with retry logic, **Then** the request is automatically retried according to configured attempts and backoff strategy before returning failure

---

### User Story 3 - Shared Code Import Configuration (Priority: P2)

Developers need a standardized way to import shared code (BaseModel, HTTP clients) across all Django services without manual path manipulation or fallback code.

**Why this priority**: While important for maintainability, this is less critical than the core functionality. Services currently have workarounds that function, but proper import configuration improves code quality and reduces technical debt.

**Independent Test**: Can be fully tested by verifying that all Django services can successfully import BaseModel and HTTP clients from the shared directory without import errors or fallback code execution. This delivers value by eliminating code duplication and ensuring consistent imports.

**Acceptance Scenarios**:

1. **Given** a Django service model file, **When** importing BaseModel from shared code, **Then** the import succeeds without errors and no fallback code is executed
2. **Given** a Django service needs HTTP client utilities, **When** importing from shared code, **Then** the import succeeds and the client is available for use
3. **Given** all Django services are configured, **When** starting any service, **Then** no import errors occur related to shared code

---

### User Story 4 - Standardized Logging Configuration (Priority: P2)

Developers need consistent logging configuration across all Django services to ensure uniform log formats, log levels, and output destinations for easier debugging and monitoring.

**Why this priority**: Logging is important for debugging and monitoring, but it's less critical than core data modeling and service communication. However, consistent logging improves operational efficiency and troubleshooting capabilities.

**Independent Test**: Can be fully tested by verifying that all services produce logs in the expected format, with appropriate log levels configured, and logs are output to the correct destinations. This delivers value by enabling consistent log analysis and debugging across services.

**Acceptance Scenarios**:

1. **Given** a Django service is running, **When** application code generates log messages, **Then** logs are formatted consistently and output to configured destinations
2. **Given** different log levels (DEBUG, INFO, WARNING, ERROR), **When** messages are logged, **Then** they are filtered according to configured log level settings
3. **Given** multiple Django services, **When** logs are generated, **Then** all services use the same logging format and configuration structure

---

### Edge Cases

- What happens when a service tries to import shared code but the shared directory is not accessible?
- How does the system handle soft-deleted records in database queries that need to include deleted items?
- What happens when HTTP client requests timeout or fail due to network issues?
- How does the system handle logging when log destinations are unavailable?
- What happens when multiple services try to use the same shared code simultaneously?
- How does soft delete interact with database constraints and foreign key relationships?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a BaseModel abstract class with UUID primary key that all Django models can inherit from
- **FR-002**: BaseModel MUST include soft delete functionality with is_deleted boolean field and deleted_at timestamp field
- **FR-003**: BaseModel MUST automatically track created_at and updated_at timestamps for all model instances
- **FR-004**: BaseModel MUST provide SoftDeleteManager that filters out deleted records by default
- **FR-005**: BaseModel MUST provide SoftDeleteQuerySet with methods to query active, deleted, or all records
- **FR-006**: BaseModel MUST provide soft_delete() method that marks records as deleted without removing them from database
- **FR-007**: BaseModel MUST provide restore() method that unmarks soft-deleted records
- **FR-008**: System MUST provide shared HTTP client utilities for inter-service communication
- **FR-008a**: Shared HTTP client MUST provide standard HTTP methods (get, post, put, delete, patch) that accept service URLs and endpoints
- **FR-008b**: Shared HTTP client MUST provide helper methods for common patterns (e.g., get_json, post_json) that handle JSON serialization/deserialization
- **FR-009**: Shared HTTP client MUST handle authentication tokens in request headers
- **FR-009a**: Shared HTTP client MUST accept tokens as optional parameters to methods
- **FR-009b**: Shared HTTP client MUST automatically retrieve tokens from configured settings or token service when tokens are not explicitly provided
- **FR-010**: Shared HTTP client MUST implement timeout configuration for all requests
- **FR-010a**: Shared HTTP client MUST use a default timeout of 5 seconds for all requests
- **FR-010b**: Shared HTTP client MUST allow per-request timeout override when different timeout values are needed
- **FR-011**: Shared HTTP client MUST provide consistent error handling and response parsing
- **FR-011a**: Shared HTTP client MUST implement retry logic with configurable attempts and backoff strategy for handling transient failures
- **FR-011b**: Shared HTTP client MUST provide default retry configuration (attempts, backoff) that can be overridden per request
- **FR-012**: System MUST configure all Django services to successfully import shared code (BaseModel and HTTP clients)
- **FR-013**: System MUST eliminate the need for fallback code or manual path manipulation when importing shared code
- **FR-014**: System MUST provide standardized logging configuration for all Django services
- **FR-015**: Logging configuration MUST support multiple log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- **FR-016**: Logging configuration MUST provide consistent log formatting across all services using structured text format (human-readable with consistent fields)
- **FR-017**: Logging configuration MUST support multiple output destinations (console, file, etc.)

### Key Entities *(include if feature involves data)*

- **BaseModel**: Abstract Django model class that provides UUID primary key, soft delete fields (is_deleted, deleted_at), and timestamp fields (created_at, updated_at). All domain models inherit from this to ensure consistency.
- **SoftDeleteManager**: Custom Django manager that filters querysets to exclude soft-deleted records by default, with methods to access deleted or all records.
- **SoftDeleteQuerySet**: Custom Django queryset that provides methods (active(), deleted(), with_deleted()) to filter records based on deletion status.
- **HTTP Client**: Generic utility class for making HTTP requests between microservices, providing standard HTTP methods (get, post, put, delete, patch) and helper methods for common patterns (e.g., get_json, post_json). Handles authentication, timeouts, and error responses consistently.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All Django services can successfully import and use BaseModel without import errors or fallback code execution (100% success rate)
- **SC-002**: Developers can create new models inheriting from BaseModel in under 2 minutes without writing boilerplate code
- **SC-003**: Soft delete operations complete in under 50ms for standard database operations
- **SC-004**: All inter-service HTTP requests use shared client utilities, eliminating duplicate HTTP client code across services (100% adoption)
- **SC-005**: Service-to-service HTTP requests complete successfully with proper error handling in 95% of cases under normal network conditions
- **SC-006**: All Django services use consistent structured text logging format, enabling developers to read logs directly and log analysis tools to parse logs from any service using the same format
- **SC-007**: Logging configuration setup time for new services reduces from 15 minutes to under 2 minutes by using shared configuration
- **SC-008**: Code duplication for base model functionality reduces by 100% (from duplicated in each service to single shared implementation)

## Assumptions

- Shared code directory (`services/shared/`) is accessible to all Django services in the microservices architecture
- All Django services use the same Python environment and can import from shared paths
- Soft delete functionality is preferred over hard deletes for data retention and audit purposes
- UUID primary keys are acceptable for all models (no requirement for integer auto-increment keys)
- Inter-service communication uses HTTP/REST protocols (not gRPC or other protocols)
- Logging configuration can be environment-specific (development vs production) while maintaining consistent structure
- All services run in the same Docker network and can resolve service hostnames for HTTP client requests

## Dependencies

- Django 5.x framework installed in all services
- Python path configuration allows importing from shared directory
- Existing microservices architecture with multiple Django services (user-service, ticket-service, communication-service, file-service)
- Network connectivity between services for HTTP client functionality

## Out of Scope

- Hard delete functionality (only soft delete is in scope)
- Database migration scripts for existing models to use BaseModel (migration is separate work)
- Log aggregation or centralized logging infrastructure (only configuration is in scope)
- HTTP client implementation for non-Django services (only Django services are in scope)
- Authentication token generation or management (only token usage in HTTP clients is in scope)
- Log storage or retention policies (only logging configuration is in scope)
