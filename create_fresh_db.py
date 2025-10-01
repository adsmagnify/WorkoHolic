import os
import shutil
from app import write_excel_data

# Create a completely new database
new_data = {
    'employees': [
        {
            'email': 'admin@workholic.in',
            'name': 'Admin',
            'role': 'admin',
            'schedule': 'general',
            'password': 'admin123'
        },
        {
            'email': 'shreyas@adsmagnify.in',
            'name': 'Shreyas',
            'role': 'employee',
            'schedule': 'shreyas',
            'password': 'shreyas@123'
        },
        {
            'email': 'srushti@adsmagnify.in',
            'name': 'Srushti',
            'role': 'employee',
            'schedule': 'srushti',
            'password': 'srushti@123'
        },
        {
            'email': 'vinay@adsmagnify.in',
            'name': 'Vinay',
            'role': 'employee',
            'schedule': 'vinay',
            'password': 'vinay@123'
        }
    ],
    'attendance': [],
    'leaderboard': []
}

# Remove old file if it exists
if os.path.exists('./data/workholic-data.xlsx'):
    try:
        os.remove('./data/workholic-data.xlsx')
        print("Removed old Excel file")
    except:
        print("Could not remove old file, but continuing...")

# Create new file
try:
    success = write_excel_data(new_data)
    if success:
        print("✅ Successfully created new Excel file!")
        print("\n=== LOGIN CREDENTIALS ===")
        print("Admin Login:")
        print("Email: admin@workholic.in")
        print("Password: admin123")
        print("\nEmployee Logins:")
        for user in new_data['employees']:
            if user['role'] == 'employee':
                print(f"Email: {user['email']}, Password: {user['password']}")
    else:
        print("❌ Failed to create Excel file")
except Exception as e:
    print(f"❌ Error: {e}")
