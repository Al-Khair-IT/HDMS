# Quickstart: Shared Core Components

**Feature**: Shared Core Components  
**Date**: November 20, 2025  
**Purpose**: Step-by-step guide for setting up and using shared infrastructure components

## Prerequisites

- Django 5.x installed in all services
- Python 3.12+
- All Django services running in Docker containers
- Shared directory accessible: `services/shared/core/`

## Setup Steps

### Step 1: Verify Shared Directory Structure

Ensure the shared directory exists and has the correct structure:

```bash
services/shared/core/
├── __init__.py
├── models.py          # BaseModel, SoftDeleteManager, SoftDeleteQuerySet
├── clients.py          # HTTPClient
└── logging_config.py   # Logging configuration
```

### Step 2: Configure Python Imports in Each Service

Add shared directory to Python path in each service's `settings/base.py`:

**File**: `services/{service-name}/src/core/settings/base.py`

```python
import sys
from pathlib import Path

# Add shared directory to Python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
SHARED_PATH = BASE_DIR.parent.parent / 'shared' / 'core'
if str(SHARED_PATH) not in sys.path:
    sys.path.insert(0, str(SHARED_PATH))

# Now you can import from shared
from models import BaseModel
from clients import HTTPClient
from logging_config import get_logging_config
```

### Step 3: Configure Logging in Each Service

Import and use shared logging configuration:

**File**: `services/{service-name}/src/core/settings/base.py`

```python
from logging_config import get_logging_config

LOGGING = get_logging_config()
```

Or customize for environment:

**File**: `services/{service-name}/src/core/settings/dev.py`

```python
from logging_config import get_logging_config

LOGGING = get_logging_config()
LOGGING['loggers']['apps']['level'] = 'DEBUG'  # Override for development
```

**File**: `services/{service-name}/src/core/settings/prod.py`

```python
from logging_config import get_logging_config

LOGGING = get_logging_config()
LOGGING['loggers']['apps']['level'] = 'INFO'  # Override for production
```

### Step 4: Update Models to Inherit from BaseModel

Replace existing model base classes with BaseModel:

**Before**:
```python
from django.db import models

class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    # ...
```

**After**:
```python
from shared.core.models import BaseModel
from django.db import models

class User(BaseModel):
    name = models.CharField(max_length=100)
    # id, is_deleted, deleted_at, created_at, updated_at are inherited
```

### Step 5: Create and Run Migrations

After updating models to use BaseModel, create migrations:

```bash
# In each service
cd services/user-service/src
python manage.py makemigrations
python manage.py migrate
```

**Note**: If migrating existing models, you may need to:
- Convert integer primary keys to UUID
- Add soft delete fields to existing models
- Backfill timestamps if not already present

## Usage Examples

### Using BaseModel in Your Models

```python
from shared.core.models import BaseModel
from django.db import models

class Department(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    
    class Meta:
        db_table = 'departments'
```

**Benefits**:
- Automatic UUID primary key
- Soft delete functionality
- Automatic timestamps
- No need to define common fields

### Querying with Soft Delete

```python
# Get only active departments (default)
active_departments = Department.objects.all()

# Get only deleted departments
deleted_departments = Department.objects.deleted()

# Get all departments including deleted
all_departments = Department.objects.with_deleted()

# Soft delete a department
department = Department.objects.get(id=dept_id)
department.soft_delete()  # Marks as deleted, sets deleted_at

# Restore a deleted department
deleted_dept = Department.objects.deleted().get(id=dept_id)
deleted_dept.restore()  # Marks as active, clears deleted_at
```

### Using HTTP Client for Inter-Service Communication

```python
from shared.core.clients import HTTPClient

# Initialize client
client = HTTPClient()

# GET request with authentication
user_data = client.get_json(
    "http://user-service:8000/api/v1/users/123",
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)

# POST request with JSON data
new_ticket = client.post_json(
    "http://ticket-service:8000/api/v1/tickets/",
    json={
        "title": "New Issue",
        "description": "Problem description",
        "priority": "high"
    },
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)

# Request with custom timeout and retry attempts
response = client.get(
    "http://communication-service:8000/api/v1/notifications/",
    timeout=10,  # 10 second timeout
    retry_attempts=5  # Retry 5 times
)
```

### Automatic Token Retrieval

If token is not provided, HTTP client automatically retrieves from settings:

```python
# In settings/base.py
SERVICE_AUTH_TOKEN = "your-service-token-here"

# In your service code
client = HTTPClient()
# Token is automatically retrieved from SERVICE_AUTH_TOKEN
response = client.get("http://user-service:8000/api/v1/users/123")
```

### Using Logging

Logging is automatically configured when you import the shared logging config:

```python
# In your service code
import logging

logger = logging.getLogger('apps')

# Log messages
logger.debug("Debug message")
logger.info("Information message")
logger.warning("Warning message")
logger.error("Error message")
```

**Output Format** (structured text):
```
INFO 2025-11-20 10:30:45,123 apps.services User created successfully
ERROR 2025-11-20 10:31:12,456 apps.api Failed to process request
```

## Verification

### Verify BaseModel Import

```python
# In Django shell
python manage.py shell

>>> from shared.core.models import BaseModel
>>> print(BaseModel.__name__)
BaseModel
```

### Verify HTTP Client Import

```python
# In Django shell
python manage.py shell

>>> from shared.core.clients import HTTPClient
>>> client = HTTPClient()
>>> print(client.default_timeout)
5
```

### Verify Logging Configuration

```python
# In Django shell
python manage.py shell

>>> import logging
>>> logger = logging.getLogger('apps')
>>> logger.info("Test message")
# Should output: INFO 2025-11-20 ... apps Test message
```

### Test Soft Delete Functionality

```python
# In Django shell
python manage.py shell

>>> from apps.users.models import User
>>> user = User.objects.create(name="Test", email="test@example.com")
>>> print(user.is_deleted)
False
>>> user.soft_delete()
>>> print(user.is_deleted)
True
>>> print(user.deleted_at)
2025-11-20 10:30:45.123456+00:00
```

## Troubleshooting

### Import Error: "No module named 'shared'"

**Problem**: Python cannot find the shared module.

**Solution**: Verify that you've added the shared directory to `sys.path` in `settings/base.py`:

```python
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SHARED_PATH = BASE_DIR.parent.parent / 'shared' / 'core'
if str(SHARED_PATH) not in sys.path:
    sys.path.insert(0, str(SHARED_PATH))
```

### Import Error: "No module named 'models'"

**Problem**: Import statement is incorrect.

**Solution**: Use the correct import after adding to sys.path:

```python
# Correct
from models import BaseModel

# Incorrect (don't use)
from shared.core.models import BaseModel  # This won't work with sys.path approach
```

### HTTP Client Timeout Errors

**Problem**: Requests are timing out.

**Solution**: Increase timeout or check network connectivity:

```python
# Increase timeout
response = client.get(url, timeout=30)

# Check service is accessible
# Verify service is running and network is configured correctly
```

### Soft Delete Not Working

**Problem**: Deleted records still appear in queries.

**Solution**: Use the correct manager method:

```python
# Default manager filters deleted records
active_users = User.objects.all()  # Only active

# To see deleted records
deleted_users = User.objects.deleted()

# To see all records
all_users = User.objects.with_deleted()
```

### Logging Not Appearing

**Problem**: Log messages are not being output.

**Solution**: Check log level configuration:

```python
# In settings
LOGGING['loggers']['apps']['level'] = 'DEBUG'  # For development
LOGGING['loggers']['apps']['level'] = 'INFO'   # For production
```

## Next Steps

1. **Update All Models**: Migrate all existing models to inherit from BaseModel
2. **Replace HTTP Clients**: Replace existing inter-service HTTP client code with shared HTTPClient
3. **Standardize Logging**: Ensure all services use the shared logging configuration
4. **Remove Fallback Code**: Remove any fallback code that was used before shared code was available
5. **Run Tests**: Verify all functionality works correctly with shared components

## Additional Resources

- [BaseModel Interface Contract](./contracts/basemodel-interface.md)
- [HTTP Client Interface Contract](./contracts/http-client-interface.md)
- [Data Model Documentation](./data-model.md)
- [Research Findings](./research.md)

