"""
Chat API endpoints.
"""
from ninja import Router
from typing import List
from apps.chat.schemas import ChatMessageOut, ChatMessageIn
from apps.chat.models import ChatMessage

from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            auth = JWTAuthentication()
            validated_token = auth.get_validated_token(token)
            
            # JIT Sync: Ensure user exists locally
            user_id = validated_token.get('user_id')
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                # Provision user from token
                payload = validated_token
                full_name = payload.get('full_name', '')
                names = full_name.split(' ')
                user = User.objects.create(
                    id=user_id,
                    employee_code=payload.get('employee_code'),
                    first_name=names[0] if names else '',
                    last_name=' '.join(names[1:]) if len(names) > 1 else '',
                    email=payload.get('email'),
                    role=payload.get('role', 'requestor'),
                    is_active=payload.get('is_active', True)
                )
                print(f"✅ JIT synced user in API: {user.employee_code}")
                
            return user
        except Exception as e:
            print(f"DEBUG API: Auth failed: {str(e)}")
            return None

router = Router(tags=["chat"], auth=JWTAuth())


@router.get("/messages/ticket/{ticket_id}", response=List[ChatMessageOut])
def list_messages(request, ticket_id: str):
    """List chat messages for a ticket."""
    messages = ChatMessage.objects.filter(ticket_id=ticket_id, is_deleted=False)
    return [ChatMessageOut.from_orm(msg) for msg in messages]


@router.post("/messages", response=ChatMessageOut)
def create_message(request, payload: ChatMessageIn):
    """Create a chat message."""
    # Use authenticated user's ID if available
    # User model has 'id' (UUID) and 'employee_code'
    sender_id = request.auth.id
    
    print(f"DEBUG: create_message payload: {payload.dict()}, sender: {sender_id}", flush=True)
    message = ChatMessage.objects.create(
        ticket_id=payload.ticket_id,
        sender_id=sender_id,
        message=payload.message,
        mentions=payload.mentions or []
    )
    return ChatMessageOut.from_orm(message)


