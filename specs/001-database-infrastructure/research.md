# Research: Database & Infrastructure Setup

**Date**: 2025-01-27  
**Feature**: Database & Infrastructure Setup  
**Purpose**: Resolve technical decisions and best practices for PostgreSQL, PgBouncer, Redis, and Docker Compose configuration

---

## 1. PgBouncer Configuration for Django

### Decision
Use PgBouncer in transaction pooling mode with pool size of 25-50 connections (configurable). Services connect to PgBouncer on port 6432, which forwards to PostgreSQL on port 5432.

### Rationale
- **Transaction Pooling Mode**: Recommended for Django because Django uses connection-per-request pattern. Transaction pooling allows connection reuse across requests without session state conflicts.
- **Pool Size**: 25-50 connections balances resource usage and concurrency. Can be tuned based on actual load.
- **Port 6432**: Standard PgBouncer port, separate from PostgreSQL (5432) for clear separation.

### Alternatives Considered
- **Session Pooling**: Rejected because Django's connection-per-request pattern conflicts with session state requirements.
- **Statement Pooling**: Rejected because it's too restrictive and doesn't work well with Django's transaction management.
- **Direct PostgreSQL Connection**: Rejected because it doesn't provide connection pooling, leading to connection exhaustion under load.

### Implementation Notes
- PgBouncer configuration file (`pgbouncer.ini`) must specify transaction pooling mode
- Connection string format: `postgresql://user:password@pgbouncer:6432/hdms_db`
- Pool size configured via `max_client_conn` and `default_pool_size` in pgbouncer.ini
- Health check: `pg_isready -h pgbouncer -p 6432`

### Sources
- PgBouncer Official Documentation: https://www.pgbouncer.org/config.html
- Django Database Connection Pooling: https://docs.djangoproject.com/en/5.0/ref/databases/#connection-pooling

---

## 2. Redis Multi-Database Setup

### Decision
Use single Redis instance with logical database separation: Database 0 for caching, Database 1 for Django Channels, Database 2 for Celery broker.

### Rationale
- **Single Instance**: Simpler deployment and management for MVP. Can scale to separate instances later if needed.
- **Logical Separation**: Redis databases (0-15) provide isolation without additional infrastructure.
- **Standard Ports**: All use port 6379, differentiated by database number in connection string.

### Alternatives Considered
- **Separate Redis Instances**: Rejected for MVP because it adds complexity without immediate benefit. Can migrate later if needed.
- **Redis Cluster**: Rejected for MVP because it's overkill for initial deployment and adds operational complexity.

### Implementation Notes
- Cache connection: `redis://redis:6379/0` (or with password: `redis://:password@redis:6379/0`)
- Channel layer: `redis://redis:6379/1`
- Celery broker: `redis://redis:6379/2`
- Authentication optional for development, configurable via `REDIS_PASSWORD` environment variable
- Data persistence enabled via `redis.conf` with `save` directives

### Sources
- Redis Databases: https://redis.io/docs/manual/keyspace-notifications/
- Django Cache Framework: https://docs.djangoproject.com/en/5.0/topics/cache/
- Django Channels Redis: https://channels.readthedocs.io/en/stable/topics/channel_layers.html#redis-channel-layer

---

## 3. Docker Compose Health Checks

### Decision
Use standard Docker health check configuration: 30s interval, 3 retries, 10s timeout for PostgreSQL, PgBouncer, and Redis.

### Rationale
- **30s Interval**: Balances responsiveness with resource usage. Frequent enough to detect issues quickly, not so frequent as to cause overhead.
- **3 Retries**: Allows for transient network issues without false negatives.
- **10s Timeout**: Reasonable for database connection checks without blocking too long.

### Alternatives Considered
- **More Frequent (10s)**: Rejected because it increases container overhead and may cause false positives during normal operations.
- **Less Frequent (60s)**: Rejected because it delays failure detection, impacting service startup dependencies.

### Implementation Notes
- PostgreSQL health check: `pg_isready -U postgres -d hdms_db`
- PgBouncer health check: `pg_isready -h localhost -p 6432`
- Redis health check: `redis-cli ping` (returns "PONG" if healthy)
- Health check status used for service dependencies (`depends_on` with `condition: service_healthy`)

### Sources
- Docker Compose Health Checks: https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck
- PostgreSQL Health Check: https://www.postgresql.org/docs/16/app-pg-isready.html

---

## 4. Environment Variable Management

### Decision
Use `.env.example` files per service with `python-decouple` or `django-environ` for environment variable loading. All sensitive values (passwords, connection strings) externalized.

### Rationale
- **Per-Service .env Files**: Allows service-specific configuration while maintaining consistency.
- **python-decouple/django-environ**: Standard Django libraries for environment variable management with type conversion and validation.
- **Externalized Secrets**: Follows 12-factor app principles and enables different configurations for dev/staging/production.

### Alternatives Considered
- **Single .env File**: Rejected because services may have different configuration needs and it's harder to manage.
- **Hardcoded Values**: Rejected because it violates security best practices and makes environment-specific deployment difficult.

### Implementation Notes
- `.env.example` files contain placeholder values with comments
- Actual `.env` files excluded from version control (in `.gitignore`)
- Environment variables loaded in Django `settings.py` using `decouple.config()` or `environ.Env()`
- Default values provided for development, overridden in production

### Sources
- python-decouple: https://github.com/henriquebastos/python-decouple
- django-environ: https://django-environ.readthedocs.io/
- 12-Factor App: https://12factor.net/config

---

## 5. Connection String Format and Configuration

### Decision
Use PostgreSQL connection string format: `postgresql://user:password@host:port/database?options`. Connection timeouts: 20s connect (Django default), 0s read/write (unlimited).

### Rationale
- **Standard Format**: PostgreSQL URI format is widely supported and readable.
- **Django Defaults**: 20s connect timeout is reasonable for network delays. 0s read/write timeout prevents premature disconnections during long operations.
- **Configurable**: All values can be overridden via environment variables for different environments.

### Implementation Notes
- Connection string format: `postgresql://${DB_USER}:${DB_PASSWORD}@pgbouncer:6432/${DB_NAME}`
- Timeout configuration via Django `DATABASES` setting `OPTIONS`:
  ```python
  'OPTIONS': {
      'connect_timeout': int(os.getenv('DB_CONNECT_TIMEOUT', 20)),
      'options': '-c statement_timeout=0'
  }
  ```
- Redis connection strings: `redis://[:password@]host:port/db_number`

### Sources
- Django Database Settings: https://docs.djangoproject.com/en/5.0/ref/settings/#databases
- PostgreSQL Connection Strings: https://www.postgresql.org/docs/16/libpq-connect.html#LIBPQ-CONNSTRING

---

## 6. Docker Volume Persistence

### Decision
Use named Docker volumes for PostgreSQL, PgBouncer, and Redis data persistence. Volumes mounted at standard data directories.

### Rationale
- **Named Volumes**: Docker-managed volumes provide better portability and backup capabilities than bind mounts.
- **Data Persistence**: Ensures data survives container restarts and updates.
- **Standard Directories**: Using standard PostgreSQL (`/var/lib/postgresql/data`), Redis (`/data`), and PgBouncer (`/etc/pgbouncer`) directories.

### Implementation Notes
- PostgreSQL volume: `postgres_data:/var/lib/postgresql/data`
- Redis volume: `redis_data:/data`
- PgBouncer volume: `pgbouncer_data:/etc/pgbouncer` (for configuration)
- Volumes defined in `docker-compose.yml` under `volumes:` section
- Backup strategy: Regular volume backups for production (outside this feature scope)

### Sources
- Docker Volumes: https://docs.docker.com/storage/volumes/
- PostgreSQL Data Directory: https://www.postgresql.org/docs/16/storage-file-layout.html

---

## Summary

All technical decisions align with HDMS constitution principles:
- ✅ **Microservices Architecture**: Shared infrastructure with independent service containers
- ✅ **Containerization**: Docker and Docker Compose as required
- ✅ **Official Documentation Standards**: Following official PostgreSQL, Redis, PgBouncer, and Docker documentation
- ✅ **API Optimization**: PgBouncer connection pooling for performance
- ✅ **Real-Time Systems**: Redis configured for Django Channels and Celery

No unresolved technical questions remain. Ready to proceed to Phase 1 design.

