from app import read_excel_data

# Check database
data = read_excel_data()
print("=== DATABASE CHECK ===")
print(f"Total users: {len(data['employees'])}")
print("\nUsers in database:")
for i, user in enumerate(data['employees'], 1):
    print(f"{i}. Email: {user['email']}")
    print(f"   Role: {user['role']}")
    print(f"   Password: {user['password']}")
    print(f"   Name: {user['name']}")
    print()

# Test specific login
print("=== LOGIN TEST ===")
test_email = "admin@workholic.in"
test_password = "admin123"

# Find user
found_user = None
for user in data['employees']:
    if user['email'] == test_email:
        found_user = user
        break

if found_user:
    print(f"User found: {found_user['email']}")
    print(f"Stored password: '{found_user['password']}'")
    print(f"Test password: '{test_password}'")
    print(f"Passwords match: {found_user['password'] == test_password}")
    print(f"User role: {found_user['role']}")
else:
    print(f"User {test_email} NOT FOUND in database")
    print("Available emails:")
    for user in data['employees']:
        print(f"  - {user['email']}")
