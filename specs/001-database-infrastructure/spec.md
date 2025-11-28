# Feature Specification: Database & Infrastructure Setup

**Feature Branch**: `001-database-infrastructure`  
**Created**: 2025-12-19  
**Status**: Draft  
**Input**: User description: "Task 1.2: Database & Infrastructure Setup - Set up PostgreSQL 16 and Redis 7 in Docker Compose for HDMS microservices. Configure database connections for all 5 Django services. Set up Redis for caching, Celery broker, and Django Channels."

## Clarifications

### Session 2025-01-27

- Q: Should PgBouncer connection pooling be included in this infrastructure setup? → A: Yes, include PgBouncer setup in Docker Compose with connection pooling configuration
- Q: Should Redis require password authentication? → A: No authentication for development, but make it configurable via environment variable for production
- Q: What should be the default database name for PostgreSQL? → A: Use "hdms_db" as default name, configurable via environment variable
- Q: What should be the database connection timeout values? → A: Use standard Django defaults (20s connect timeout, 0s read/write timeout), configurable via environment variables
- Q: What should be the health check intervals and retry policies for containers? → A: Standard Docker health checks: 30s interval, 3 retries, 10s timeout

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Database Connection Setup (Priority: P1)

As a developer setting up the HDMS microservices system, I need all services to connect to a shared PostgreSQL database so that data can be persisted and accessed consistently across all services.

**Why this priority**: Without database connectivity, no service can function. This is the foundation for all data operations.

**Independent Test**: Can be fully tested by starting Docker Compose, verifying PostgreSQL container is running, and confirming each service can execute a simple database query. This delivers immediate value by enabling all subsequent database operations.

**Acceptance Scenarios**:

1. **Given** Docker Compose is running, **When** I start PostgreSQL container, **Then** it initializes with the configured database, user, and password
2. **Given** Docker Compose is running, **When** I start PgBouncer container, **Then** it initializes and connects to PostgreSQL for connection pooling
3. **Given** PostgreSQL and PgBouncer are running, **When** I start any Django service (user-service, ticket-service, communication-service, file-service), **Then** the service successfully connects to the database through PgBouncer
4. **Given** a service is connected to the database through PgBouncer, **When** I run database migrations, **Then** migrations execute successfully without connection errors
5. **Given** database connection is configured, **When** I restart a service, **Then** it reconnects to the database through PgBouncer automatically

---

### User Story 2 - Redis Configuration for Caching (Priority: P1)

As a developer, I need Redis configured for caching so that services can improve performance by storing frequently accessed data in memory.

**Why this priority**: Caching is essential for performance and is used by all services. Without it, services will be slower and may fail under load.

**Independent Test**: Can be fully tested by starting Redis container, configuring a service to use Redis cache, and verifying cache read/write operations work. This delivers immediate value by enabling performance optimizations.

**Acceptance Scenarios**:

1. **Given** Docker Compose is running, **When** I start Redis container, **Then** it initializes and listens on port 6379
2. **Given** Redis is running, **When** I configure a Django service to use Redis cache (port 6379/0), **Then** the service can read from and write to the cache
3. **Given** cache is configured, **When** I restart a service, **Then** it reconnects to Redis cache automatically

---

### User Story 3 - Redis Configuration for Celery Broker (Priority: P1)

As a developer, I need Redis configured as a Celery message broker so that file-service can process background tasks (antivirus scanning, file conversion) asynchronously.

**Why this priority**: Background task processing is critical for file operations. Without it, file uploads will block and user experience will degrade.

**Independent Test**: Can be fully tested by starting Redis container, configuring Celery to use Redis broker (port 6379/2), and verifying Celery worker can connect and receive tasks. This delivers immediate value by enabling asynchronous file processing.

**Acceptance Scenarios**:

1. **Given** Redis is running, **When** I configure Celery broker URL to use Redis (port 6379/2), **Then** Celery worker can connect to the broker
2. **Given** Celery is connected to Redis broker, **When** I submit a background task, **Then** the task is queued and processed by Celery worker
3. **Given** broker connection is configured, **When** I restart Celery worker, **Then** it reconnects to Redis broker automatically

---

### User Story 4 - Redis Configuration for Django Channels (Priority: P1)

As a developer, I need Redis configured as a channel layer for Django Channels so that communication-service can handle WebSocket connections for real-time chat and notifications.

**Why this priority**: Real-time communication is a core feature. Without channel layer, WebSocket connections cannot be maintained across multiple instances.

**Independent Test**: Can be fully tested by starting Redis container, configuring Django Channels to use Redis channel layer (port 6379/1), and verifying WebSocket connections can be established. This delivers immediate value by enabling real-time features.

**Acceptance Scenarios**:

1. **Given** Redis is running, **When** I configure Django Channels channel layer to use Redis (port 6379/1), **Then** communication-service can establish WebSocket connections
2. **Given** channel layer is configured, **When** I send a message via WebSocket, **Then** it is broadcast to all connected clients
3. **Given** channel layer connection is configured, **When** I restart communication-service, **Then** it reconnects to Redis channel layer automatically

---

### User Story 5 - Environment Configuration (Priority: P2)

As a developer, I need environment variables configured for database and Redis connections so that services can be easily configured for different environments (development, production).

**Why this priority**: Environment configuration enables proper deployment across different environments and improves maintainability.

**Independent Test**: Can be fully tested by creating .env.example files with database credentials and verifying services read configuration from environment variables. This delivers immediate value by standardizing configuration management.

**Acceptance Scenarios**:

1. **Given** .env.example files exist, **When** I copy them to .env and set values, **Then** services read configuration from environment variables
2. **Given** environment variables are set, **When** I start a service, **Then** it uses the configured database and Redis connection strings
3. **Given** different environment configurations, **When** I deploy to different environments, **Then** services connect to environment-specific databases and Redis instances

---

### Edge Cases

- What happens when PostgreSQL container fails to start? System should log clear error messages and services should fail gracefully with connection errors
- What happens when Redis container is unavailable? Services should handle connection failures gracefully, with fallback behavior (e.g., cache misses, task queue failures)
- What happens when Redis password is incorrect in production? Services should log authentication errors clearly and fail to connect
- What happens when database credentials are incorrect? Services should log authentication errors clearly and fail to start
- What happens when multiple services try to connect simultaneously? PgBouncer handles connection pooling (25-50 connections), and services should retry connections with exponential backoff if pool is exhausted
- What happens when PgBouncer container fails? Services should detect connection failure and log clear error messages indicating PgBouncer unavailability
- What happens when Docker Compose volumes are not configured? Database data should persist across container restarts
- What happens when network connectivity is lost? Services should detect connection loss and attempt reconnection automatically

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST set up PostgreSQL 16 database server in Docker Compose with database name "hdms_db" (configurable via environment variable), user, and password
- **FR-002**: System MUST set up PgBouncer connection pooler in Docker Compose with transaction pooling mode configured
- **FR-003**: System MUST set up Redis 7 server in Docker Compose with data persistence configured. Redis authentication MUST be optional (disabled for development, configurable via environment variable for production)
- **FR-004**: System MUST configure all 5 Django services (user-service, ticket-service, communication-service, file-service) to connect to PostgreSQL through PgBouncer (not directly)
- **FR-005**: System MUST configure Redis cache connection (port 6379, database 0) for all Django services that require caching
- **FR-006**: System MUST configure Redis Celery broker connection (port 6379, database 2) for file-service background task processing
- **FR-007**: System MUST configure Redis Django Channels layer connection (port 6379, database 1) for communication-service WebSocket support
- **FR-008**: System MUST update DATABASES setting in each Django service's settings to use PgBouncer connection string (pointing to PgBouncer, not PostgreSQL directly). Connection timeouts MUST use Django defaults (20s connect, 0s read/write) and be configurable via environment variables
- **FR-009**: System MUST update CACHES setting in each Django service's settings to use Redis cache
- **FR-010**: System MUST update CELERY_BROKER_URL setting in file-service to use Redis broker
- **FR-011**: System MUST update CHANNEL_LAYERS setting in communication-service to use Redis channel layer
- **FR-012**: System MUST create .env.example files for each service with database (PgBouncer) and Redis connection credentials. Database name MUST default to "hdms_db" (configurable). Redis password MUST be optional (empty for development, set for production)
- **FR-013**: System MUST configure Docker Compose volumes for PostgreSQL, PgBouncer, and Redis data persistence
- **FR-014**: System MUST include health checks for PostgreSQL, PgBouncer, and Redis containers in Docker Compose. Health checks MUST use standard configuration: 30s interval, 3 retries, 10s timeout
- **FR-015**: System MUST configure PgBouncer pool size (25-50 connections, configurable via environment variable)
- **FR-016**: System MUST enable database connection testing from each service to verify connectivity through PgBouncer
- **FR-017**: System MUST handle connection failures gracefully with appropriate error logging

### Key Entities *(include if feature involves data)*

- **PostgreSQL Database**: Shared database instance used by all microservices. Stores all application data including users, tickets, chat messages, files, and notifications. Default database name: "hdms_db" (configurable via environment variable). Configured with user credentials and connection parameters. Services connect to PostgreSQL through PgBouncer, not directly.

- **PgBouncer Connection Pooler**: External connection pooler that sits between Django services and PostgreSQL. Reduces database connection overhead by pooling connections. Configured with transaction pooling mode (recommended for Django). Pool size: 25-50 connections (configurable). Services connect to PgBouncer on port 6432, which forwards to PostgreSQL.

- **Redis Instance**: Shared Redis server used for multiple purposes. Database 0 for caching, database 1 for Django Channels, database 2 for Celery broker. Configured with data persistence and connection parameters. Authentication is optional - disabled for development, configurable via environment variable for production.

- **Service Configuration**: Environment-specific settings for each Django service including PgBouncer connection strings (not direct PostgreSQL), Redis URLs, and connection timeouts. Database connection timeouts: 20 seconds connect timeout (configurable), 0 seconds read/write timeout (unlimited, configurable). Stored in .env files and loaded by Django settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 Django services can successfully connect to PostgreSQL database through PgBouncer within 10 seconds of container startup
- **SC-002**: All services can read from and write to Redis cache with operations completing in under 50 milliseconds
- **SC-003**: Celery worker can connect to Redis broker and process background tasks without connection errors
- **SC-004**: Django Channels can establish WebSocket connections through Redis channel layer for real-time communication
- **SC-005**: Database and Redis connections remain stable for 24 hours of continuous operation without manual intervention
- **SC-006**: Services automatically reconnect to database and Redis after container restarts within 5 seconds
- **SC-007**: Configuration changes can be applied by updating .env files without code modifications
- **SC-008**: All database and Redis connection errors are logged with sufficient detail for troubleshooting
