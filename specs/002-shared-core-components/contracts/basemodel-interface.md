# BaseModel Interface Contract

**Feature**: Shared Core Components  
**Date**: November 20, 2025  
**Purpose**: Define the interface contract for the shared BaseModel abstract class

## Overview

BaseModel is an abstract Django model class that provides consistent UUID primary keys, soft delete functionality, and automatic timestamp tracking for all models in the HDMS microservices architecture.

## Interface Specification

### Class: BaseModel

**Location**: `services/shared/core/models.py`

**Purpose**: Abstract base class for all Django models

**Inheritance**: `django.db.models.Model`

**Meta Configuration**: `abstract = True` (cannot be instantiated directly)

## Fields

### `id` (UUIDField, Primary Key)

- **Type**: `models.UUIDField`
- **Primary Key**: Yes
- **Default**: `uuid.uuid4` (auto-generated UUID v4)
- **Editable**: False
- **Description**: Unique identifier for each model instance

### `is_deleted` (BooleanField)

- **Type**: `models.BooleanField`
- **Default**: `False`
- **Indexed**: Yes (`db_index=True`)
- **Description**: Indicates if the record is soft-deleted

### `deleted_at` (DateTimeField)

- **Type**: `models.DateTimeField`
- **Nullable**: Yes (`null=True`)
- **Blank**: Yes (`blank=True`)
- **Description**: Timestamp when the record was soft-deleted. `None` for active records.

### `created_at` (DateTimeField)

- **Type**: `models.DateTimeField`
- **Auto-set**: Yes (`auto_now_add=True`)
- **Editable**: False
- **Description**: Timestamp when the record was created. Automatically set on creation.

### `updated_at` (DateTimeField)

- **Type**: `models.DateTimeField`
- **Auto-update**: Yes (`auto_now=True`)
- **Editable**: False
- **Description**: Timestamp when the record was last updated. Automatically updated on save.

## Manager

### `objects` (SoftDeleteManager)

- **Type**: `SoftDeleteManager`
- **Default Behavior**: Returns only active records (is_deleted=False)
- **Methods**:
  - `objects.all()`: Returns active records only
  - `objects.deleted()`: Returns deleted records only
  - `objects.with_deleted()`: Returns all records (active + deleted)

## Methods

### `soft_delete() -> None`

**Description**: Marks the record as soft-deleted without removing it from the database.

**Behavior**:
- Sets `is_deleted = True`
- Sets `deleted_at = timezone.now()`
- Saves the record (updates only `is_deleted` and `deleted_at` fields)

**Returns**: `None`

**Example**:
```python
user = User.objects.get(id=user_id)
user.soft_delete()  # Record is now soft-deleted
```

### `restore() -> None`

**Description**: Restores a soft-deleted record to active status.

**Behavior**:
- Sets `is_deleted = False`
- Sets `deleted_at = None`
- Saves the record (updates only `is_deleted` and `deleted_at` fields)

**Returns**: `None`

**Example**:
```python
user = User.objects.deleted().get(id=user_id)
user.restore()  # Record is now active again
```

## QuerySet Methods

### `active() -> SoftDeleteQuerySet`

**Description**: Returns queryset filtered to non-deleted records.

**Returns**: `SoftDeleteQuerySet` with `is_deleted=False` filter

**Example**:
```python
# These are equivalent:
active_users = User.objects.active()
active_users = User.objects.filter(is_deleted=False)
```

### `deleted() -> SoftDeleteQuerySet`

**Description**: Returns queryset filtered to deleted records.

**Returns**: `SoftDeleteQuerySet` with `is_deleted=True` filter

**Example**:
```python
deleted_users = User.objects.deleted()
```

### `with_deleted() -> SoftDeleteQuerySet`

**Description**: Returns queryset of all records including deleted ones.

**Returns**: `SoftDeleteQuerySet` with no `is_deleted` filter

**Example**:
```python
all_users = User.objects.with_deleted()
```

## Usage Examples

### Creating a Model that Inherits from BaseModel

```python
from shared.core.models import BaseModel
from django.db import models

class User(BaseModel):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    
    class Meta:
        db_table = 'users'
```

### Querying Active Records (Default)

```python
# Default manager returns only active records
active_users = User.objects.all()  # Only non-deleted users

# Explicit active query
active_users = User.objects.active()
```

### Querying Deleted Records

```python
# Get deleted users
deleted_users = User.objects.deleted()
```

### Querying All Records (Including Deleted)

```python
# Get all users including deleted
all_users = User.objects.with_deleted()
```

### Soft Deleting a Record

```python
user = User.objects.get(id=user_id)
user.soft_delete()  # Marks as deleted, sets deleted_at timestamp

# Record is now excluded from default queryset
active_users = User.objects.all()  # user is not in this queryset
deleted_users = User.objects.deleted()  # user is in this queryset
```

### Restoring a Soft-Deleted Record

```python
# Get deleted user
user = User.objects.deleted().get(id=user_id)
user.restore()  # Marks as active, clears deleted_at

# Record is now included in default queryset
active_users = User.objects.all()  # user is now in this queryset
```

### Accessing Timestamps

```python
user = User.objects.create(name="John", email="john@example.com")

# Timestamps are automatically set
print(user.created_at)  # Current timestamp
print(user.updated_at)  # Current timestamp

# Update the record
user.name = "Jane"
user.save()

# updated_at is automatically refreshed
print(user.updated_at)  # New timestamp
print(user.created_at)  # Original timestamp (unchanged)
```

## Constraints and Notes

1. **Abstract Class**: BaseModel cannot be instantiated directly. All models must inherit from it.

2. **UUID Primary Key**: The `id` field is immutable once set. Cannot be changed after creation.

3. **Soft Delete**: Soft-deleted records remain in the database. They are excluded from default querysets but can be accessed using `objects.deleted()` or `objects.with_deleted()`.

4. **Foreign Key Relationships**: Soft delete does not cascade to related models. Foreign key relationships to soft-deleted records remain valid. Handle cascading soft deletes explicitly if needed.

5. **Timestamps**: `created_at` and `updated_at` are managed automatically by Django. Do not set them manually.

6. **Indexing**: `is_deleted` field is indexed for query performance on active/deleted filtering.

7. **Database Queries**: Use `objects.with_deleted()` when you need to query all records regardless of deletion status (e.g., for admin interfaces or audit purposes).

## Migration Considerations

When migrating existing models to use BaseModel:
- Existing integer primary keys need to be migrated to UUID
- Existing records need `is_deleted=False` and `deleted_at=None` set
- Timestamps (`created_at`, `updated_at`) may need to be backfilled from existing data
- Foreign key relationships may need to be updated to reference UUID instead of integer IDs

