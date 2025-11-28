"""
HTTP client for User Service (self-reference for consistency).
"""
from django.conf import settings
from clients import HTTPClient


class UserClient:
    """Client for User Service API calls."""
    
    BASE_URL = settings.USER_SERVICE_URL
    _client = HTTPClient()
    
    @classmethod
    def get_user(cls, user_id: str, token: str = None):
        """Get user by ID."""
        return cls._client.get_json(
            f'{cls.BASE_URL}/api/v1/users/{user_id}',
            token=token
        )
    
    @classmethod
    def validate_user(cls, user_id: str, token: str = None) -> bool:
        """Validate if user exists."""
        try:
            cls.get_user(user_id, token)
            return True
        except Exception:
            return False


