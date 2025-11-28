# Quickstart: Database & Infrastructure Setup

**Date**: 2025-01-27  
**Feature**: Database & Infrastructure Setup

---

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+ installed
- Git repository cloned
- Terminal/Command Prompt access

---

## Step 1: Create Root Environment File

Create `.env` file in project root. See `docs/environment-variables.md` for complete documentation.

```bash
# PostgreSQL Configuration
POSTGRES_DB=hdms_db
POSTGRES_USER=hdms_user
POSTGRES_PASSWORD=change_me_in_production

# PgBouncer Configuration
PGBOUNCER_POOL_SIZE=25

# Redis Configuration (optional for development, required for production)
REDIS_PASSWORD=
```

**Note**: Change `POSTGRES_PASSWORD` to a secure password. For production, set `REDIS_PASSWORD`.  
**Reference**: See `docs/environment-variables.md` for all environment variables.

---

## Step 2: Create Service Environment Files

For each Django service (user-service, ticket-service, communication-service, file-service), create `.env` file in service directory:

```bash
# Database Configuration (via PgBouncer)
DB_NAME=hdms_db
DB_USER=hdms_user
DB_PASSWORD=change_me_in_production
DB_HOST=pgbouncer
DB_PORT=6432
DB_CONNECT_TIMEOUT=20

# Redis Configuration
REDIS_PASSWORD=
```

**Note**: `DB_PASSWORD` must match `POSTGRES_PASSWORD` from root `.env`. `REDIS_PASSWORD` must match root `.env` if set.

---

## Step 3: Start Infrastructure Services

From project root, start PostgreSQL, PgBouncer, and Redis:

**Option 1: Using Docker Compose directly**
```bash
docker-compose up -d postgres pgbouncer redis
```

**Option 2: Using startup script (recommended)**
```bash
./scripts/start-infrastructure.sh
```

**Expected Output**:
- PostgreSQL container starts and initializes database
- PgBouncer waits for PostgreSQL health check, then starts
- Redis starts and listens on port 6379

**Script Location**: `scripts/start-infrastructure.sh`

---

## Step 4: Verify Services Are Running

Check container status:

```bash
docker-compose ps
```

All services should show "Up" status with health check passing.

**Option 1: Using verification scripts (recommended)**
```bash
# Verify all connections
./scripts/verify-all-connections.sh

# Verify health checks
./scripts/verify-health-checks.sh
```

**Option 2: Manual verification**
```bash
# Test PostgreSQL connection (via PgBouncer)
docker-compose exec pgbouncer psql -h localhost -p 6432 -U hdms_user -d hdms_db -c "SELECT version();"

# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG
```

**Script Locations**: 
- `scripts/verify-all-connections.sh` - Comprehensive connection test
- `scripts/verify-health-checks.sh` - Health check validation
- `scripts/verify-db-connection.sh` - Database connection only
- `scripts/verify-cache-connection.sh` - Redis cache only
- `scripts/verify-celery-broker.sh` - Celery broker only
- `scripts/verify-channels-connection.sh` - Django Channels only

---

## Step 5: Configure Django Services

**Note**: Settings have already been configured in `services/*/src/core/settings/base.py`. Verify the configuration matches your environment.

The following settings are already configured:

### Database Configuration

```python
import os
from decouple import config

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='hdms_db'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': 'pgbouncer',  # Docker service name
        'PORT': 6432,  # PgBouncer port
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'connect_timeout': int(config('DB_CONNECT_TIMEOUT', default=20)),
            'options': '-c statement_timeout=0'
        }
    }
}
```

### Cache Configuration

```python
REDIS_PASSWORD = config('REDIS_PASSWORD', default='')
REDIS_URL = f"redis://:{REDIS_PASSWORD}@redis:6379/0" if REDIS_PASSWORD else "redis://redis:6379/0"

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
    }
}
```

### Django Channels Configuration (Communication Service Only)

```python
REDIS_PASSWORD = config('REDIS_PASSWORD', default='')
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

### Celery Configuration (File Service Only)

```python
REDIS_PASSWORD = config('REDIS_PASSWORD', default='')
if REDIS_PASSWORD:
    CELERY_BROKER_URL = f"redis://:{REDIS_PASSWORD}@redis:6379/2"
else:
    CELERY_BROKER_URL = "redis://redis:6379/2"
```

---

## Step 6: Test Database Connection from Django Service

**Note**: All Django services are already configured to connect through PgBouncer. Test the connection:

**Option 1: Using verification script**
```bash
./scripts/verify-db-connection.sh
```

**Option 2: Using Django management command**
```bash
# From within a Django service container or with service running
docker-compose exec user-service python manage.py dbshell
# Should connect to PostgreSQL via PgBouncer
# Type \q to exit
```

**Option 3: Programmatic test**
```bash
docker-compose exec user-service python manage.py shell
>>> from django.db import connection
>>> connection.ensure_connection()
>>> print("Database connection successful!")
```

---

## Step 7: Test Redis Cache

Test cache from Django shell:

```bash
python manage.py shell
>>> from django.core.cache import cache
>>> cache.set('test_key', 'test_value', 60)
>>> cache.get('test_key')
# Should return: 'test_value'
```

---

## Step 8: Verify Health Checks

Check health status:

```bash
docker-compose ps
```

All services should show "healthy" status.

View health check logs:

```bash
docker inspect hdms_postgres | grep -A 10 Health
docker inspect hdms_pgbouncer | grep -A 10 Health
docker inspect hdms_redis | grep -A 10 Health
```

---

## Troubleshooting

### PostgreSQL Connection Failed

**Symptoms**: Django service cannot connect to database

**Solutions**:
1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Verify PgBouncer is healthy: `docker-compose ps pgbouncer`
4. Check environment variables match: `DB_PASSWORD` must equal `POSTGRES_PASSWORD`
5. Verify service is using PgBouncer host (`pgbouncer:6432`), not PostgreSQL directly

### Redis Connection Failed

**Symptoms**: Cache operations fail or Celery cannot connect

**Solutions**:
1. Verify Redis is running: `docker-compose ps redis`
2. Check Redis logs: `docker-compose logs redis`
3. Test Redis directly: `docker-compose exec redis redis-cli ping`
4. Verify password matches if authentication enabled
5. Check Redis database number (0 for cache, 1 for Channels, 2 for Celery)

### PgBouncer Connection Pool Exhausted

**Symptoms**: "too many clients" errors

**Solutions**:
1. Increase pool size: Set `PGBOUNCER_POOL_SIZE` to 50 in root `.env`
2. Restart PgBouncer: `docker-compose restart pgbouncer`
3. Check active connections: `docker-compose exec pgbouncer psql -h localhost -p 6432 -U postgres pgbouncer -c "SHOW POOLS;"`

### Health Check Failing

**Symptoms**: Services show "unhealthy" status

**Solutions**:
1. Check service logs: `docker-compose logs [service-name]`
2. Verify health check command works manually
3. Increase start_period if service needs more time to initialize
4. Check network connectivity between containers

---

## Next Steps

After infrastructure is set up:

1. Run database migrations: `python manage.py migrate`
2. Create superuser: `python manage.py createsuperuser`
3. Start Django services: `docker-compose up -d [service-name]`
4. Verify all services can connect to database and Redis

---

## Production Considerations

For production deployment:

1. **Change Default Passwords**: Update all passwords in `.env` files
2. **Enable Redis Authentication**: Set `REDIS_PASSWORD` to a strong password
3. **Increase Pool Size**: Set `PGBOUNCER_POOL_SIZE` to 50 for higher concurrency
4. **Backup Strategy**: Set up regular backups for PostgreSQL and Redis volumes
5. **Monitoring**: Add monitoring for database connections, Redis memory usage, and pool utilization
6. **SSL/TLS**: Configure SSL connections for production (outside this feature scope)

---

## Reference

- Docker Compose file: `docker-compose.yml`
- Environment variables: `.env` files in root and each service directory
- Configuration schemas: `contracts/docker-compose-schema.md`
- Data model: `data-model.md`

