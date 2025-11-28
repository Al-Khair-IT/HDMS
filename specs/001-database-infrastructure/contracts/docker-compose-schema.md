# Docker Compose Configuration Schema

**Date**: 2025-01-27  
**Feature**: Database & Infrastructure Setup

---

## Overview

This document defines the structure and configuration for `docker-compose.yml` file that orchestrates PostgreSQL, PgBouncer, and Redis containers for HDMS microservices.

---

## Service Definitions

### PostgreSQL Service

```yaml
postgres:
  image: postgres:16
  container_name: hdms_postgres
  environment:
    POSTGRES_DB: ${POSTGRES_DB:-hdms_db}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB:-hdms_db}"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 10s
  networks:
    - hdms_network
```

### PgBouncer Service

```yaml
pgbouncer:
  image: pgbouncer/pgbouncer:latest
  container_name: hdms_pgbouncer
  environment:
    PGBOUNCER_POOL_SIZE: ${PGBOUNCER_POOL_SIZE:-25}
    PGBOUNCER_USER: ${POSTGRES_USER}
    PGBOUNCER_PASSWORD: ${POSTGRES_PASSWORD}
    DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-hdms_db}
  volumes:
    - pgbouncer_data:/etc/pgbouncer
  ports:
    - "6432:6432"
  depends_on:
    postgres:
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -h localhost -p 6432"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 5s
  networks:
    - hdms_network
```

### Redis Service

```yaml
redis:
  image: redis:7
  container_name: hdms_redis
  command: >
    sh -c "
    if [ -n \"$$REDIS_PASSWORD\" ]; then
      redis-server --requirepass $$REDIS_PASSWORD --appendonly yes
    else
      redis-server --appendonly yes
    fi
    "
  environment:
    REDIS_PASSWORD: ${REDIS_PASSWORD:-}
  volumes:
    - redis_data:/data
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 5s
  networks:
    - hdms_network
```

---

## Volume Definitions

```yaml
volumes:
  postgres_data:
    driver: local
  pgbouncer_data:
    driver: local
  redis_data:
    driver: local
```

---

## Network Definition

```yaml
networks:
  hdms_network:
    driver: bridge
```

---

## Environment Variable Reference

### Root .env File (docker-compose.yml)

```bash
# PostgreSQL Configuration
POSTGRES_DB=hdms_db
POSTGRES_USER=hdms_user
POSTGRES_PASSWORD=change_me_in_production

# PgBouncer Configuration
PGBOUNCER_POOL_SIZE=25

# Redis Configuration (optional for development)
REDIS_PASSWORD=
```

---

## Connection String Formats

### Django DATABASES Setting

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'hdms_db'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': 'pgbouncer',  # Docker service name
        'PORT': 6432,  # PgBouncer port
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'connect_timeout': int(os.getenv('DB_CONNECT_TIMEOUT', 20)),
            'options': '-c statement_timeout=0'
        }
    }
}
```

### Django CACHES Setting

```python
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
REDIS_URL = f"redis://:{REDIS_PASSWORD}@redis:6379/0" if REDIS_PASSWORD else "redis://redis:6379/0"

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
    }
}
```

### Django Channels CHANNEL_LAYERS Setting

```python
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
if REDIS_PASSWORD:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                'hosts': [('redis', 6379, {'password': REDIS_PASSWORD})],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                'hosts': [('redis', 6379)],
            },
        },
    }
```

### Celery CELERY_BROKER_URL Setting

```python
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
if REDIS_PASSWORD:
    CELERY_BROKER_URL = f"redis://:{REDIS_PASSWORD}@redis:6379/2"
else:
    CELERY_BROKER_URL = "redis://redis:6379/2"
```

---

## Validation Rules

1. **PostgreSQL**: All environment variables must be set (POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD)
2. **PgBouncer**: PGBOUNCER_POOL_SIZE must be between 25 and 50
3. **Redis**: REDIS_PASSWORD optional for development, should be set for production
4. **Service Dependencies**: PgBouncer depends on PostgreSQL health check
5. **Ports**: PgBouncer exposed on 6432, Redis on 6379 (PostgreSQL not exposed externally)
6. **Networks**: All services on same Docker network for service discovery

---

## Health Check Specifications

All health checks use:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 5-10 seconds (allows service initialization)

### Health Check Commands
- PostgreSQL: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
- PgBouncer: `pg_isready -h localhost -p 6432`
- Redis: `redis-cli ping` (returns "PONG" if healthy)

