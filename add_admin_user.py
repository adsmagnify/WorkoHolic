from app import read_excel_data, write_excel_data
import os

# Read current data
data = read_excel_data()

# Check if admin@workholic.in exists
admin_exists = False
for user in data['employees']:
    if user['email'] == 'admin@workholic.in':
        admin_exists = True
        print("Admin user already exists!")
        break

if not admin_exists:
    # Add the admin user you want
    admin_user = {
        'email': 'admin@workholic.in',
        'name': 'Admin',
        'role': 'admin',
        'schedule': 'general',
        'password': 'admin123'
    }
    
    data['employees'].append(admin_user)
    print("Added admin@workholic.in user")
    
    # Try to write to Excel file
    try:
        # First, let's try to close any open file handles
        import gc
        gc.collect()
        
        success = write_excel_data(data)
        if success:
            print("✅ Successfully saved admin user to database!")
        else:
            print("❌ Failed to save to Excel file")
    except Exception as e:
        print(f"❌ Error saving to Excel: {e}")
        print("But the user is added to memory and will work for this session")

print("\n=== CURRENT USERS ===")
for user in data['employees']:
    print(f"Email: {user['email']}, Role: {user['role']}")

print("\n=== LOGIN CREDENTIALS ===")
print("Admin Login:")
print("Email: admin@workholic.in")
print("Password: admin123")
print("\nAlternative Admin Login:")
print("Email: vinay@workoholic.in") 
print("Password: vinay@123")
