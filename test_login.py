#!/usr/bin/env python3
"""
Test login functionality
"""

from app import read_excel_data

def test_login(email, password):
    """Test login for a specific user"""
    data = read_excel_data()
    
    for user in data['employees']:
        if user['email'] == email:
            if user['password'] == password:
                return True, user['role']
            else:
                return False, "Wrong password"
    
    return False, "User not found"

def main():
    print("=== Login Test ===")
    
    # Test cases
    test_cases = [
        ("admin@workholic.in", "admin123"),
        ("vinay@workoholic.in", "vinay@123"),
        ("shreyas@adsmagnify.in", "shreyas@123"),
        ("srushti@adsmagnify.in", "srushti@123")
    ]
    
    for email, password in test_cases:
        success, result = test_login(email, password)
        if success:
            print(f"✅ {email} - Login successful (Role: {result})")
        else:
            print(f"❌ {email} - Login failed: {result}")
    
    print("\n=== Database Status ===")
    data = read_excel_data()
    print(f"Total users: {len(data['employees'])}")
    
    if data['employees']:
        print("Users in database:")
        for user in data['employees']:
            print(f"  - {user['email']} ({user['role']})")
    else:
        print("❌ No users found in database!")

if __name__ == "__main__":
    main()
