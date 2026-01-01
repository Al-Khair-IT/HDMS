---
description: Fix JIT Authentication duplicate email issue and ensure proper handling of user synchronization conflicts.
---
# Task: Fix JIT Authentication Duplicate Email Conflict

## Context
The system encountered `IntegrityError` (duplicate key value violates unique constraint "users_email_key") during Just-In-Time (JIT) user synchronization in `communication-service` and `ticket-service`. This happens when a user logging for the first time (via JIT) has an email matching an existing user with a *different* ID in the local database (likely due to test data or reused emails in Auth Service).

## Objective
Update the `RemoteJWTAuthentication` (in `hdms_core`) and `JWTAuthMiddleware` (in `communication-service`) to gracefully handle duplicate email scenarios by resolving conflicts automatically, ensuring users can log in even if their email duplicates an existing stale record.

## Plan
1.  **Modify `hdms_core/authentication.py`**:
    *   Update `get_user` method.
    *   Catch `IntegrityError` or generic `Exception` during `update_or_create`.
    *   If conflict is on `email`, mangle the email (e.g., `duplicate_{uuid}_{email}`) and retry the operation.

2.  **Modify `communication-service/.../middleware.py`**:
    *   Update `get_or_sync_user` method.
    *   Implement similar retry logic for `get_or_create` / `save` operations.

3.  **Restart Services**:
    *   Restart `ticket-service` (uses `hdms_core`).
    *   Restart `communication-service` (uses `middleware.py` and `hdms_core`).
    *   Restart `file-service` (uses `hdms_core`, good measure).

4.  **Validation**:
    *   User verifies "Moderator" (previously offline) can now connect.
