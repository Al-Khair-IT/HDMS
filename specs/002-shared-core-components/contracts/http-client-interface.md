# HTTP Client Interface Contract

**Feature**: Shared Core Components  
**Date**: November 20, 2025  
**Purpose**: Define the interface contract for the shared HTTP client utility

## Overview

The HTTP client provides a generic interface for inter-service communication in the HDMS microservices architecture. It handles authentication, timeouts, retry logic, and error handling consistently across all services.

## Interface Specification

### Class: HTTPClient

**Location**: `services/shared/core/clients.py`

**Purpose**: Generic HTTP client for making requests between microservices

### Methods

#### Standard HTTP Methods

##### `get(url, token=None, timeout=None, retry_attempts=None, **kwargs) -> requests.Response`

**Description**: Performs a GET request to the specified URL.

**Parameters**:
- `url` (str, required): Target service URL and endpoint (e.g., "http://user-service:8000/api/v1/users/123")
- `token` (str, optional): Bearer authentication token. If not provided, retrieved from settings
- `timeout` (int/float, optional): Request timeout in seconds. Default: 5 seconds
- `retry_attempts` (int, optional): Number of retry attempts. Default: 3
- `**kwargs`: Additional arguments passed to `requests.get()` (headers, params, etc.)

**Returns**: `requests.Response` object

**Raises**: `requests.RequestException` on failure after retries

**Example**:
```python
from shared.core.clients import HTTPClient

client = HTTPClient()
response = client.get(
    "http://user-service:8000/api/v1/users/123",
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    timeout=10
)
```

##### `post(url, data=None, json=None, token=None, timeout=None, retry_attempts=None, **kwargs) -> requests.Response`

**Description**: Performs a POST request to the specified URL.

**Parameters**:
- `url` (str, required): Target service URL and endpoint
- `data` (dict/str, optional): Form data or raw data to send
- `json` (dict, optional): JSON data to send (automatically serialized)
- `token` (str, optional): Bearer authentication token
- `timeout` (int/float, optional): Request timeout in seconds. Default: 5 seconds
- `retry_attempts` (int, optional): Number of retry attempts. Default: 3
- `**kwargs`: Additional arguments passed to `requests.post()`

**Returns**: `requests.Response` object

**Raises**: `requests.RequestException` on failure after retries

##### `put(url, data=None, json=None, token=None, timeout=None, retry_attempts=None, **kwargs) -> requests.Response`

**Description**: Performs a PUT request to the specified URL.

**Parameters**: Same as `post()` method

**Returns**: `requests.Response` object

**Raises**: `requests.RequestException` on failure after retries

##### `delete(url, token=None, timeout=None, retry_attempts=None, **kwargs) -> requests.Response`

**Description**: Performs a DELETE request to the specified URL.

**Parameters**: Same as `get()` method (no data/json parameters)

**Returns**: `requests.Response` object

**Raises**: `requests.RequestException` on failure after retries

##### `patch(url, data=None, json=None, token=None, timeout=None, retry_attempts=None, **kwargs) -> requests.Response`

**Description**: Performs a PATCH request to the specified URL.

**Parameters**: Same as `post()` method

**Returns**: `requests.Response` object

**Raises**: `requests.RequestException` on failure after retries

#### Helper Methods (JSON)

##### `get_json(url, token=None, timeout=None, retry_attempts=None, **kwargs) -> dict | list`

**Description**: Performs a GET request and returns parsed JSON response.

**Parameters**: Same as `get()` method

**Returns**: Parsed JSON (dict or list)

**Raises**: 
- `requests.RequestException` on HTTP failure after retries
- `ValueError` if response is not valid JSON

**Example**:
```python
from shared.core.clients import HTTPClient

client = HTTPClient()
user_data = client.get_json(
    "http://user-service:8000/api/v1/users/123",
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)
# user_data is a dict: {"id": "...", "name": "...", ...}
```

##### `post_json(url, data=None, json=None, token=None, timeout=None, retry_attempts=None, **kwargs) -> dict | list`

**Description**: Performs a POST request with JSON data and returns parsed JSON response.

**Parameters**: Same as `post()` method

**Returns**: Parsed JSON (dict or list)

**Raises**: 
- `requests.RequestException` on HTTP failure after retries
- `ValueError` if response is not valid JSON

**Example**:
```python
from shared.core.clients import HTTPClient

client = HTTPClient()
new_user = client.post_json(
    "http://user-service:8000/api/v1/users/",
    json={"name": "John Doe", "email": "john@example.com"},
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)
# new_user is a dict with created user data
```

## Authentication

### Token Handling

1. **Explicit Token**: If `token` parameter is provided, it is used directly
2. **Automatic Retrieval**: If `token` is not provided, client retrieves token from:
   - Django settings: `SERVICE_AUTH_TOKEN` or `AUTH_TOKEN`
   - Token service endpoint (if configured)
3. **Header Format**: Token is sent as `Authorization: Bearer {token}` header

### Token Source Priority

1. Explicit `token` parameter (highest priority)
2. Django settings (`SERVICE_AUTH_TOKEN`)
3. Token service (if configured)

## Retry Logic

### Default Behavior

- **Retry Attempts**: 3 (configurable)
- **Backoff Strategy**: Exponential backoff (0.5s, 1s, 2s)
- **Retry On**: Connection errors, timeouts, 5xx server errors
- **No Retry On**: 4xx client errors (except 429 rate limiting)

### Retry Configuration

Retry behavior can be overridden per request using `retry_attempts` parameter:

```python
# Use default retries (3 attempts)
response = client.get("http://service/api/endpoint")

# Override retry attempts
response = client.get("http://service/api/endpoint", retry_attempts=5)

# Disable retries
response = client.get("http://service/api/endpoint", retry_attempts=0)
```

## Timeout Configuration

### Default Timeout

- **Default**: 5 seconds
- **Override**: Per-request using `timeout` parameter

### Timeout Behavior

- Request fails with `requests.Timeout` exception if timeout is exceeded
- Retry logic applies to timeout errors (retries the request)

## Error Handling

### Exception Types

- `requests.ConnectionError`: Network connection failure
- `requests.Timeout`: Request timeout exceeded
- `requests.HTTPError`: HTTP error response (4xx, 5xx)
- `requests.RequestException`: Base exception for all request errors

### Error Response Format

When a request fails after retries, the exception contains:
- Original exception information
- Request URL and method
- Number of retry attempts made
- Final response (if available)

## Usage Examples

### Basic GET Request

```python
from shared.core.clients import HTTPClient

client = HTTPClient()
response = client.get("http://user-service:8000/api/v1/users/123")
if response.status_code == 200:
    data = response.json()
```

### Authenticated Request

```python
from shared.core.clients import HTTPClient

client = HTTPClient()
response = client.get(
    "http://ticket-service:8000/api/v1/tickets/456",
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
)
```

### JSON Helper Method

```python
from shared.core.clients import HTTPClient

client = HTTPClient()
user = client.get_json("http://user-service:8000/api/v1/users/123")
# user is already a dict, no need to call response.json()
```

### POST with JSON Data

```python
from shared.core.clients import HTTPClient

client = HTTPClient()
new_ticket = client.post_json(
    "http://ticket-service:8000/api/v1/tickets/",
    json={
        "title": "New Issue",
        "description": "Problem description",
        "priority": "high"
    }
)
```

## Notes

- All methods support standard `requests` library parameters via `**kwargs`
- Helper methods (`get_json`, `post_json`) automatically handle JSON serialization/deserialization
- Retry logic uses exponential backoff to prevent overwhelming failing services
- Timeout and retry configuration can be overridden per request for flexibility

