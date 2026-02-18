import logging
import uuid
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.db import transaction

logger = logging.getLogger(__name__)

class RemoteJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that:
    1. Validates the token signature (using shared secret)
    2. Extracts user data from the token payload
    3. JIT (Just-In-Time) syncs the user to the local database
    """

    def get_user(self, validated_token):
        """
        Returns a User instance from the validated token, creating it if necessary.
        """
        User = get_user_model()
        
        # 1. Extract User ID
        try:
            user_id = validated_token.get('user_id') or validated_token.get('sub')
            if not user_id:
                raise InvalidToken("Token contained no recognizable user identification")
            
            # Ensure proper UUID format
            if isinstance(user_id, str):
                try:
                    user_id = uuid.UUID(user_id)
                except ValueError:
                    # If it's not a valid UUID, maybe it's a legacy ID?
                    # For now, we assume strict UUID compliance for HDMS
                    pass
        except Exception as e:
            logger.error(f"Error parsing user_id from token: {e}")
            raise InvalidToken("Invalid user identification in token")

        # 2. Extract User Profile Data
        payload = validated_token
        
        # Extract name parts safely
        full_name = payload.get('full_name', '') or payload.get('name', '')
        names = full_name.split(' ') if full_name else []
        first_name = names[0] if names else ''
        last_name = ' '.join(names[1:]) if len(names) > 1 else ''

        # Prepare User Data for Sync
        # Support both 'employee_code' (legacy/standard) and 'code' (polymorphic)
        employee_code = payload.get('employee_code') or payload.get('code', '')
        
        defaults = {
            'employee_code': employee_code,
            'email': payload.get('email', ''),
            'first_name': first_name,
            'last_name': last_name,
            'is_active': payload.get('is_active', True),
        }

        # Handle Role: Only update role if it is explicitly in the token
        # This prevents overwriting a locally assigned 'moderator' role with a default 'requestor'
        # if the auth-service doesn't know about HDMS roles.
        if 'role' in payload:
            defaults['role'] = payload['role']
        
        # Determine strict mode (fail if critical data missing)
        # We can relax this if needed, but for now strict is safer
        if not defaults['employee_code']:
            logger.warning(f"Token for user {user_id} missing employee_code")

        # 3. JIT Sync (Get or Create/Update)
        try:
            user, created = User.objects.update_or_create(
                id=user_id,
                defaults=defaults
            )
            
            if created:
                logger.info(f"JIT Created User: {user.employee_code} ({user.id})")
            
            return user

        except Exception as e:
            # Handle duplicate email constraint violation
            # Error usually looks like: duplicate key value violates unique constraint "users_email_key"
            if "unique constraint" in str(e).lower() and "email" in str(e).lower():
                logger.warning(f"JIT User Sync Conflict: Email '{defaults['email']}' already exists. Retrying with uniqueness adjustment.")
                try:
                    # Mangle email to resolve conflict
                    defaults['email'] = f"{user_id}_{defaults['email']}"
                    user, created = User.objects.update_or_create(
                        id=user_id,
                        defaults=defaults
                    )
                    return user
                except Exception as retry_e:
                    logger.error(f"JIT Retry Failed for {user_id}: {str(retry_e)}")
            
            logger.error(f"JIT User Sync Failed for {user_id}: {str(e)}")
            # Fallback: Try to get existing user without update if DB locked/error
            try:
                return User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise AuthenticationFailed(f"Could not sync user: {str(e)}", code='jit_sync_failed')

    def __call__(self, request):
        """
        Adapter for Django Ninja compatibility.
        Ninja expects a callable that accepts request and returns user or None.
        """
        try:
            # Check if using DRF Request or Django HttpRequest
            # simplejwt's authenticate() handles both usually, but let's be safe
            auth_result = self.authenticate(request)
            
            if auth_result is not None:
                user, token = auth_result
                request.user = user  # Attach user to request
                return user
                
        except (InvalidToken, AuthenticationFailed) as e:
            # Log failure but return None so Ninja handles 401
            # logger.warning(f"Ninja Auth Failed: {e}")
            pass
        except Exception as e:
            logger.error(f"Unexpected Ninja Auth Error: {e}")
            
        return None
