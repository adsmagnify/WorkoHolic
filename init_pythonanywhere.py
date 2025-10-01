#!/usr/bin/env python3
"""
PythonAnywhere Database Initialization Script
Run this script on PythonAnywhere to set up the database properly
"""

import os
import sys
from app import read_excel_data, write_excel_data, initialize_excel_file

def main():
    print("=== PythonAnywhere Database Initialization ===")
    
    # Check if data directory exists
    if not os.path.exists('./data'):
        os.makedirs('./data')
        print("✅ Created data directory")
    
    # Initialize Excel file
    print("Initializing Excel database...")
    initialize_excel_file()
    
    # Read and display current users
    print("\n=== Current Database Users ===")
    data = read_excel_data()
    
    if not data['employees']:
        print("❌ No users found in database!")
        return
    
    print(f"✅ Found {len(data['employees'])} users:")
    for i, user in enumerate(data['employees'], 1):
        print(f"{i}. {user['email']} ({user['role']})")
    
    # Check for admin user
    admin_found = False
    for user in data['employees']:
        if user['email'] == 'admin@workholic.in':
            admin_found = True
            break
    
    if not admin_found:
        print("\n⚠️  Admin user (admin@workholic.in) not found!")
        print("Adding admin user...")
        
        admin_user = {
            'email': 'admin@workholic.in',
            'name': 'Admin',
            'role': 'admin',
            'schedule': 'general',
            'password': 'admin123'
        }
        
        data['employees'].append(admin_user)
        
        try:
            write_excel_data(data)
            print("✅ Admin user added successfully!")
        except Exception as e:
            print(f"❌ Error adding admin user: {e}")
    else:
        print("\n✅ Admin user found!")
    
    print("\n=== Login Credentials ===")
    print("Admin Login:")
    print("Email: admin@workholic.in")
    print("Password: admin123")
    
    # Show alternative admin if exists
    for user in data['employees']:
        if user['role'] == 'admin' and user['email'] != 'admin@workholic.in':
            print(f"\nAlternative Admin:")
            print(f"Email: {user['email']}")
            print(f"Password: {user['password']}")
            break
    
    print("\n=== Employee Logins ===")
    for user in data['employees']:
        if user['role'] == 'employee':
            print(f"Email: {user['email']}, Password: {user['password']}")
    
    print("\n✅ Database initialization complete!")
    print("You can now login to your WorkoHolic application.")

if __name__ == "__main__":
    main()
