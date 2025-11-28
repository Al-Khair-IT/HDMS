"""
Department model for User Service.
"""
import sys
from pathlib import Path
from django.db import models

# Add shared directory to Python path (needed before model imports)
docker_shared_path = Path('/shared/core')
local_shared_path = Path(__file__).resolve().parent.parent.parent.parent.parent.parent / 'shared' / 'core'
shared_path = docker_shared_path if docker_shared_path.exists() else local_shared_path
if str(shared_path) not in sys.path:
    sys.path.insert(0, str(shared_path))

from models import BaseModel


class Department(BaseModel):
    """
    Department model.
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    head_id = models.UUIDField(null=True, blank=True, db_index=True)  # Reference to User
    active_tickets = models.IntegerField(default=0)
    total_capacity = models.IntegerField(default=100)
    queue_enabled = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['code']),
            models.Index(fields=['head_id']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        return self.name
