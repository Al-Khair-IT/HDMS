# Data Model: Shared Core Components

**Feature**: Shared Core Components  
**Date**: November 20, 2025  
**Purpose**: Define data structures and entities for shared infrastructure components

## Entities

### BaseModel (Abstract Django Model)

**Purpose**: Abstract base class that all Django models inherit from, providing consistent UUID primary keys, soft delete functionality, and automatic timestamp tracking.

**Fields**:
- `id` (UUIDField, Primary Key): UUID v4, auto-generated, non-editable, serves as primary key
- `is_deleted` (BooleanField): Indicates if record is soft-deleted, default=False, indexed for query performance
- `deleted_at` (DateTimeField): Timestamp when record was soft-deleted, nullable, blank allowed
- `created_at` (DateTimeField): Timestamp when record was created, auto-set on creation, non-editable
- `updated_at` (DateTimeField): Timestamp when record was last updated, auto-updated on save, non-editable

**Relationships**: None (abstract base class)

**Validation Rules**:
- `id` is automatically generated, cannot be manually set
- `is_deleted` defaults to False on creation
- `deleted_at` is set automatically when `soft_delete()` is called
- `created_at` and `updated_at` are managed by Django automatically

**State Transitions**:
- **Active → Soft-Deleted**: When `soft_delete()` is called, `is_deleted` becomes True, `deleted_at` is set to current timestamp
- **Soft-Deleted → Active**: When `restore()` is called, `is_deleted` becomes False, `deleted_at` is cleared (set to None)

**Manager**: SoftDeleteManager (filters out soft-deleted records by default)

**QuerySet**: SoftDeleteQuerySet (provides methods: `active()`, `deleted()`, `with_deleted()`)

### SoftDeleteManager (Custom Django Manager)

**Purpose**: Custom manager that filters querysets to exclude soft-deleted records by default.

**Methods**:
- `get_queryset()`: Returns queryset filtered to active records (is_deleted=False)
- `deleted()`: Returns queryset of deleted records (is_deleted=True)
- `with_deleted()`: Returns queryset of all records including deleted ones

**Default Behavior**: Filters to active records (is_deleted=False)

### SoftDeleteQuerySet (Custom Django QuerySet)

**Purpose**: Custom queryset that provides methods to filter records based on deletion status.

**Methods**:
- `active()`: Returns queryset filtered to non-deleted records (is_deleted=False)
- `deleted()`: Returns queryset filtered to deleted records (is_deleted=True)
- `with_deleted()`: Returns queryset of all records (no filter)

**Usage**: Used by SoftDeleteManager and can be chained with other queryset methods

### HTTPClient (Utility Class)

**Purpose**: Generic HTTP client utility for inter-service communication with authentication, timeout, retry logic, and error handling.

**Configuration** (Class-level):
- `default_timeout`: 5 seconds
- `default_retry_attempts`: 3
- `default_backoff_factor`: 0.5 (exponential backoff)

**Methods**:
- `get(url, **kwargs)`: Standard GET request
- `post(url, **kwargs)`: Standard POST request
- `put(url, **kwargs)`: Standard PUT request
- `delete(url, **kwargs)`: Standard DELETE request
- `patch(url, **kwargs)`: Standard PATCH request
- `get_json(url, **kwargs)`: GET request with JSON response parsing
- `post_json(url, data, **kwargs)`: POST request with JSON request/response handling

**Parameters** (per method):
- `url` (str, required): Target service URL and endpoint
- `token` (str, optional): Authentication token (Bearer token). If not provided, retrieved from settings
- `timeout` (int/float, optional): Request timeout in seconds. Overrides default if provided
- `retry_attempts` (int, optional): Number of retry attempts. Overrides default if provided
- `**kwargs`: Additional arguments passed to requests library (headers, data, json, etc.)

**Response Format**: Returns `requests.Response` object. Helper methods (`get_json`, `post_json`) return parsed JSON (dict/list).

**Error Handling**: 
- Raises `requests.RequestException` on failure after retries
- Retries on: connection errors, timeouts, 5xx server errors
- Does not retry on: 4xx client errors (except 429 rate limiting)

### LoggingConfiguration (Django Settings)

**Purpose**: Standardized logging configuration structure for all Django services.

**Structure**:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG',  # Environment-specific (DEBUG for dev, INFO for prod)
            'propagate': False,
        },
    },
}
```

**Components**:
- **Formatters**: Structured text format with levelname, timestamp, module, message
- **Handlers**: Console handler (can be extended with file handler)
- **Loggers**: Root logger and app-specific loggers
- **Log Levels**: Environment-specific (DEBUG for development, INFO for production)

## Relationships

- **BaseModel → SoftDeleteManager**: BaseModel uses SoftDeleteManager as default manager
- **SoftDeleteManager → SoftDeleteQuerySet**: Manager uses SoftDeleteQuerySet for queryset operations
- **Django Services → BaseModel**: All Django model classes inherit from BaseModel
- **Django Services → HTTPClient**: Services use HTTPClient for inter-service communication
- **Django Services → LoggingConfiguration**: Services import and use shared logging configuration

## Constraints

- BaseModel is abstract (`abstract = True` in Meta class) - cannot be instantiated directly
- UUID primary keys are immutable once set
- Soft-deleted records remain in database (not physically deleted)
- HTTP client requires network connectivity between services
- Logging configuration must be imported before Django apps are loaded

## Indexes

- `is_deleted` field in BaseModel has `db_index=True` for query performance on active/deleted filtering

## Notes

- BaseModel fields are inherited by all models that inherit from it
- Soft delete does not cascade to related models (foreign key relationships must be handled explicitly)
- HTTP client retry logic uses exponential backoff to prevent overwhelming failing services
- Logging format is consistent across all services for easier log analysis and debugging

