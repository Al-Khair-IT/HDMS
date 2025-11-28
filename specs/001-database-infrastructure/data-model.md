# Data Model: Database & Infrastructure Setup

**Date**: 2025-01-27  
**Feature**: Database & Infrastructure Setup

---

## Overview

This feature sets up infrastructure components (PostgreSQL, PgBouncer, Redis) and configuration for Django services. The "data model" here refers to configuration entities and connection parameters rather than application data models.

---

## Configuration Entities

### 1. PostgreSQL Configuration

**Entity**: PostgreSQL Database Instance

**Attributes**:
- `database_name`: String, default "hdms_db", configurable via `POSTGRES_DB` environment variable
- `database_user`: String, required, configurable via `POSTGRES_USER` environment variable
- `database_password`: String, required, configurable via `POSTGRES_PASSWORD` environment variable
- `port`: Integer, default 5432 (internal), not exposed externally
- `data_directory`: String, default "/var/lib/postgresql/data" (volume mount point)
- `version`: String, "16" (PostgreSQL 16)

**Relationships**:
- Connected to by: PgBouncer (connection pooler)
- Used by: All Django services (indirectly through PgBouncer)

**Validation Rules**:
- Database name must be alphanumeric with underscores
- User and password must be non-empty
- Port must be valid (1-65535)

**State Transitions**: N/A (infrastructure component)

---

### 2. PgBouncer Configuration

**Entity**: PgBouncer Connection Pooler

**Attributes**:
- `pool_mode`: String, "transaction" (transaction pooling mode)
- `max_client_conn`: Integer, default 100 (max client connections)
- `default_pool_size`: Integer, default 25, configurable 25-50 via `PGBOUNCER_POOL_SIZE` environment variable
- `listen_port`: Integer, default 6432 (PgBouncer port)
- `admin_users`: String, default "postgres" (admin user)
- `auth_type`: String, default "md5" (password authentication)
- `config_file`: String, default "/etc/pgbouncer/pgbouncer.ini"

**Relationships**:
- Connects to: PostgreSQL (on port 5432)
- Connected to by: All Django services (on port 6432)

**Validation Rules**:
- Pool size must be between 25 and 50
- Port must be 6432 (standard PgBouncer port)
- Pool mode must be "transaction" for Django compatibility

**State Transitions**: N/A (infrastructure component)

---

### 3. Redis Configuration

**Entity**: Redis Instance

**Attributes**:
- `port`: Integer, default 6379 (Redis port)
- `password`: String, optional, configurable via `REDIS_PASSWORD` environment variable (empty for dev, set for production)
- `persistence_enabled`: Boolean, default true (data persistence)
- `save_directives`: Array of strings, default ["900 1", "300 10", "60 10000"] (Redis persistence rules)
- `data_directory`: String, default "/data" (volume mount point)
- `version`: String, "7" (Redis 7)

**Logical Databases**:
- `database_0`: Integer, 0 - Used for Django cache
- `database_1`: Integer, 1 - Used for Django Channels channel layer
- `database_2`: Integer, 2 - Used for Celery broker

**Relationships**:
- Used by: All Django services (for caching)
- Used by: Communication service (for Django Channels)
- Used by: File service (for Celery broker)

**Validation Rules**:
- Port must be 6379 (standard Redis port)
- Password optional but recommended for production
- Database numbers must be 0, 1, or 2 (as specified)

**State Transitions**: N/A (infrastructure component)

---

### 4. Django Service Database Configuration

**Entity**: Django DATABASES Setting

**Attributes**:
- `ENGINE`: String, "django.db.backends.postgresql"
- `NAME`: String, from `DB_NAME` environment variable (default "hdms_db")
- `USER`: String, from `DB_USER` environment variable
- `PASSWORD`: String, from `DB_PASSWORD` environment variable
- `HOST`: String, "pgbouncer" (Docker service name, not "postgres")
- `PORT`: Integer, 6432 (PgBouncer port, not 5432)
- `CONN_MAX_AGE`: Integer, default 0 (connection reuse within request)
- `OPTIONS`: Dictionary
  - `connect_timeout`: Integer, from `DB_CONNECT_TIMEOUT` environment variable (default 20)
  - `options`: String, "-c statement_timeout=0" (unlimited read/write timeout)

**Relationships**:
- Used by: All Django services (user-service, ticket-service, communication-service, file-service)

**Validation Rules**:
- HOST must be "pgbouncer" (not "postgres" - services connect through PgBouncer)
- PORT must be 6432 (PgBouncer port)
- Connect timeout must be positive integer
- All required environment variables must be set

**State Transitions**: N/A (configuration)

---

### 5. Django Service Cache Configuration

**Entity**: Django CACHES Setting

**Attributes**:
- `BACKEND`: String, "django.core.cache.backends.redis.RedisCache"
- `LOCATION`: String, format "redis://[:password@]redis:6379/0"
  - Password optional (empty for dev, from `REDIS_PASSWORD` for production)
  - Host: "redis" (Docker service name)
  - Port: 6379
  - Database: 0 (cache database)
- `OPTIONS`: Dictionary (optional, for connection pooling)

**Relationships**:
- Used by: All Django services that require caching

**Validation Rules**:
- LOCATION must use Redis database 0
- Password must match Redis configuration if authentication enabled

**State Transitions**: N/A (configuration)

---

### 6. Django Channels Configuration

**Entity**: Django CHANNEL_LAYERS Setting

**Attributes**:
- `BACKEND`: String, "channels_redis.core.RedisChannelLayer"
- `CONFIG`: Dictionary
  - `hosts`: List, format [("redis", 6379)] or [("redis", 6379, {"password": "..."})]
  - `capacity`: Integer, default 100 (channel capacity)
  - `expiry`: Integer, default 60 (message expiry in seconds)

**Relationships**:
- Used by: Communication service only

**Validation Rules**:
- Must use Redis database 1 (Django Channels)
- Password must match Redis configuration if authentication enabled

**State Transitions**: N/A (configuration)

---

### 7. Celery Configuration

**Entity**: Celery Broker Configuration

**Attributes**:
- `CELERY_BROKER_URL`: String, format "redis://[:password@]redis:6379/2"
  - Password optional (empty for dev, from `REDIS_PASSWORD` for production)
  - Host: "redis" (Docker service name)
  - Port: 6379
  - Database: 2 (Celery broker database)
- `CELERY_RESULT_BACKEND`: String, same as `CELERY_BROKER_URL` (optional, for result storage)

**Relationships**:
- Used by: File service only

**Validation Rules**:
- Must use Redis database 2 (Celery broker)
- Password must match Redis configuration if authentication enabled

**State Transitions**: N/A (configuration)

---

## Environment Variable Schema

### PostgreSQL Environment Variables
- `POSTGRES_DB`: String, default "hdms_db"
- `POSTGRES_USER`: String, required
- `POSTGRES_PASSWORD`: String, required

### PgBouncer Environment Variables
- `PGBOUNCER_POOL_SIZE`: Integer, default 25, range 25-50
- `PGBOUNCER_USER`: String, default "postgres"
- `PGBOUNCER_PASSWORD`: String, from `POSTGRES_PASSWORD`

### Redis Environment Variables
- `REDIS_PASSWORD`: String, optional (empty for dev, set for production)

### Django Service Environment Variables (per service)
- `DB_NAME`: String, default "hdms_db"
- `DB_USER`: String, required
- `DB_PASSWORD`: String, required
- `DB_HOST`: String, "pgbouncer" (fixed)
- `DB_PORT`: Integer, 6432 (fixed)
- `DB_CONNECT_TIMEOUT`: Integer, default 20
- `REDIS_PASSWORD`: String, optional (empty for dev, set for production)

---

## Docker Compose Service Definitions

### Service: postgres
- Image: `postgres:16`
- Environment: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- Volumes: `postgres_data:/var/lib/postgresql/data`
- Health check: `pg_isready -U postgres -d hdms_db` (30s interval, 3 retries, 10s timeout)

### Service: pgbouncer
- Image: `pgbouncer/pgbouncer:latest`
- Environment: `PGBOUNCER_POOL_SIZE`, `PGBOUNCER_USER`, `PGBOUNCER_PASSWORD`
- Depends on: `postgres` (condition: `service_healthy`)
- Volumes: `pgbouncer_data:/etc/pgbouncer`
- Health check: `pg_isready -h localhost -p 6432` (30s interval, 3 retries, 10s timeout)

### Service: redis
- Image: `redis:7`
- Environment: `REDIS_PASSWORD` (optional)
- Volumes: `redis_data:/data`
- Health check: `redis-cli ping` (30s interval, 3 retries, 10s timeout)

---

## Validation Summary

All configuration entities must:
1. Have required attributes set (non-empty strings, valid integers)
2. Use correct connection endpoints (PgBouncer for database, not PostgreSQL directly)
3. Use correct ports (6432 for PgBouncer, 6379 for Redis)
4. Use correct Redis database numbers (0 for cache, 1 for Channels, 2 for Celery)
5. Have environment variables externalized (no hardcoded values)
6. Support optional authentication for development, required for production

