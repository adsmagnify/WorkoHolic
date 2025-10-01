#!/usr/bin/env python3
"""
PythonAnywhere Database Fix Script
This script will create a complete database with all users
"""

import os
import sys
from app import write_excel_data

def create_complete_database():
    """Create a complete database with all users"""
    
    # Complete user data
    complete_data = {
        'employees': [
            # Admin users
            {
                'email': 'admin@workholic.in',
                'name': 'Admin',
                'role': 'admin',
                'schedule': 'general',
                'password': 'admin123'
            },
            {
                'email': 'vinay@workoholic.in',
                'name': 'Vinay',
                'role': 'admin',
                'schedule': 'general',
                'password': 'vinay@123'
            },
            # Employee users
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
            },
            {
                'email': 'pooja@adsmagnify.in',
                'name': 'Pooja',
                'role': 'employee',
                'schedule': 'general',
                'password': 'pooja@123'
            },
            {
                'email': 'ketan@adsmagnify.in',
                'name': 'Ketan',
                'role': 'employee',
                'schedule': 'general',
                'password': 'ketan@123'
            },
            {
                'email': 'omkar@adsmagnify.in',
                'name': 'Omkar',
                'role': 'employee',
                'schedule': 'shreyas',
                'password': 'omkar@123'
            }
        ],
        'attendance': [],
        'leaderboard': []
    }
    
    return complete_data

def main():
    print("=== PythonAnywhere Database Fix ===")
    
    # Ensure data directory exists
    if not os.path.exists('./data'):
        os.makedirs('./data')
        print("✅ Created data directory")
    
    # Remove any existing Excel file
    excel_file = './data/workholic-data.xlsx'
    if os.path.exists(excel_file):
        try:
            os.remove(excel_file)
            print("✅ Removed old Excel file")
        except Exception as e:
            print(f"⚠️  Could not remove old file: {e}")
    
    # Create complete database
    print("Creating complete database...")
    data = create_complete_database()
    
    try:
        success = write_excel_data(data)
        if success:
            print("✅ Database created successfully!")
        else:
            print("❌ Failed to create database")
            return
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return
    
    # Verify the database
    print("\n=== Verifying Database ===")
    try:
        from app import read_excel_data
        verify_data = read_excel_data()
        
        if not verify_data['employees']:
            print("❌ Database is empty!")
            return
        
        print(f"✅ Database verified - {len(verify_data['employees'])} users found")
        
    except Exception as e:
        print(f"❌ Error verifying database: {e}")
        return
    
    # Display login credentials
    print("\n=== LOGIN CREDENTIALS ===")
    print("🔐 ADMIN LOGINS:")
    for user in data['employees']:
        if user['role'] == 'admin':
            print(f"   Email: {user['email']}")
            print(f"   Password: {user['password']}")
            print()
    
    print("👥 EMPLOYEE LOGINS:")
    for user in data['employees']:
        if user['role'] == 'employee':
            print(f"   Email: {user['email']} | Password: {user['password']}")
    
    print("\n=== RECOMMENDED LOGIN ===")
    print("Try this first:")
    print("Email: admin@workholic.in")
    print("Password: admin123")
    
    print("\n✅ Database fix complete!")
    print("Now reload your web app and try logging in.")

if __name__ == "__main__":
    main()
