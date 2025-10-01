# PythonAnywhere Troubleshooting Guide

## 🚨 Login Issues on PythonAnywhere

If you're getting "Invalid credentials" errors on PythonAnywhere, follow these steps:

### Step 1: Initialize the Database

1. **Open a Bash console** on PythonAnywhere
2. **Navigate to your project directory**:
   ```bash
   cd ~/WorkoHolic
   ```

3. **Run the initialization script**:
   ```bash
   python3.10 init_pythonanywhere.py
   ```

### Step 2: Check File Permissions

1. **Check if the data directory exists**:
   ```bash
   ls -la data/
   ```

2. **If the directory doesn't exist, create it**:
   ```bash
   mkdir -p data
   chmod 755 data
   ```

3. **Check Excel file permissions**:
   ```bash
   ls -la data/workholic-data.xlsx
   ```

### Step 3: Manual Database Creation

If the script doesn't work, create the database manually:

1. **Create a Python script**:
   ```bash
   nano create_db.py
   ```

2. **Add this content**:
   ```python
   from app import write_excel_data
   
   data = {
       'employees': [
           {
               'email': 'admin@workholic.in',
               'name': 'Admin',
               'role': 'admin',
               'schedule': 'general',
               'password': 'admin123'
           }
       ],
       'attendance': [],
       'leaderboard': []
   }
   
   write_excel_data(data)
   print("Database created!")
   ```

3. **Run the script**:
   ```bash
   python3.10 create_db.py
   ```

### Step 4: Test the Application

1. **Reload your web app** in the PythonAnywhere dashboard
2. **Visit your website** and try logging in with:
   - **Email**: `admin@workholic.in`
   - **Password**: `admin123`

### Step 5: Check Logs

If login still doesn't work:

1. **Check error logs** in the Web tab
2. **Check console logs** in the Files tab
3. **Look for any error messages** about file permissions

### Step 6: Alternative Admin Login

If the admin user still doesn't work, try these existing users:

**Admin User:**
- Email: `vinay@workoholic.in`
- Password: `vinay@123`

**Employee Users:**
- Email: `shreyas@adsmagnify.in` | Password: `shreyas@123`
- Email: `srushti@adsmagnify.in` | Password: `srushti@123`
- Email: `vinay@adsmagnify.in` | Password: `vinay@123`

### Step 7: File Permission Issues

If you get permission errors:

1. **Check file ownership**:
   ```bash
   ls -la data/
   ```

2. **Fix permissions**:
   ```bash
   chmod 644 data/workholic-data.xlsx
   chown $USER:$USER data/workholic-data.xlsx
   ```

3. **Make sure the directory is writable**:
   ```bash
   chmod 755 data/
   ```

### Step 8: Restart Web App

After making changes:

1. **Go to the Web tab** in PythonAnywhere
2. **Click "Reload"** to restart your application
3. **Test the login** again

## 🔧 Common Issues and Solutions

### Issue 1: "Permission denied" errors
**Solution**: Check file permissions and ownership

### Issue 2: "File not found" errors
**Solution**: Make sure the data directory exists and has the Excel file

### Issue 3: "Invalid credentials" still appears
**Solution**: Use the alternative admin login (`vinay@workoholic.in` / `vinay@123`)

### Issue 4: Excel file is locked
**Solution**: Restart the web app and try again

## 📞 Support

If you're still having issues:

1. **Check the PythonAnywhere console** for error messages
2. **Verify all files are uploaded** correctly
3. **Make sure the WSGI file** points to the correct path
4. **Check that all dependencies** are installed

## ✅ Success Indicators

You'll know it's working when:
- ✅ The initialization script runs without errors
- ✅ You can see users in the database
- ✅ Login works with the provided credentials
- ✅ No permission errors in the logs

---

**Remember**: The most reliable login is `vinay@workoholic.in` with password `vinay@123` as it's already in your existing database!
