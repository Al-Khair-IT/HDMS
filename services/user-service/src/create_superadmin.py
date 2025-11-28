"""
Script to create a Django superadmin with custom fields.
Reads from environment variables and auto-generates employee_code with pattern S-YY-####.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Add the apps path to sys.path
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
apps_path = BASE_DIR / 'apps'
if str(apps_path) not in sys.path:
    sys.path.insert(0, str(apps_path))

django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_superadmin():
    """
    Create a superadmin user with CNIC and phone number.
    Employee code is auto-generated with pattern S-YY-####.
    """
    # Read from environment variables
    first_name = os.getenv('SUPERADMIN_FIRST_NAME', 'Admin')
    last_name = os.getenv('SUPERADMIN_LAST_NAME', 'User')
    email = os.getenv('SUPERADMIN_EMAIL', 'admin@hdms.com')
    password = os.getenv('SUPERADMIN_PASSWORD', 'admin123')
    cnic = os.getenv('SUPERADMIN_CNIC')
    phone_number = os.getenv('SUPERADMIN_PHONE')
    
    try:
        # Check if a superadmin already exists
        existing_superadmins = User.objects.filter(is_superuser=True)
        if existing_superadmins.exists():
            print(f"Superadmin(s) already exist:")
            for su in existing_superadmins:
                print(f"  - {su.employee_code}: {su.get_full_name() or su.email}")
            return
        
        # Create superadmin (employee_code will be auto-generated)
        print("Creating superadmin...")
        user = User.objects.create_superuser(
            employee_code=None,  # Will be auto-generated
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            cnic=cnic,
            phone_number=phone_number,
        )
        
        print(f"✓ Superadmin created successfully!")
        print(f"  Employee Code: {user.employee_code}")
        print(f"  Name: {user.get_full_name()}")
        print(f"  Email: {user.email}")
        print(f"  CNIC: {user.cnic or 'Not provided'}")
        print(f"  Phone: {user.phone_number or 'Not provided'}")
        
    except Exception as e:
        print(f"✗ Error creating superadmin: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_superadmin()
