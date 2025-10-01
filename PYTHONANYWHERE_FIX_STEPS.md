# PythonAnywhere Login Fix - Step by Step

## 🚨 If NO users can login on PythonAnywhere

This means the Excel database file is missing or empty. Follow these steps:

### Step 1: Upload the Fix Script

1. **Upload `fix_pythonanywhere.py`** to your PythonAnywhere project directory
2. **Make sure it's in the same folder as `app.py`**

### Step 2: Run the Fix Script

1. **Open a Bash console** on PythonAnywhere
2. **Navigate to your project**:
   ```bash
   cd ~/WorkoHolic
   ```

3. **Run the fix script**:
   ```bash
   python3.10 fix_pythonanywhere.py
   ```

### Step 3: Test the Database

1. **Run the test script**:
   ```bash
   python3.10 test_login.py
   ```

2. **You should see**:
   ```
   ✅ admin@workholic.in - Login successful (Role: admin)
   ✅ vinay@workoholic.in - Login successful (Role: admin)
   ✅ shreyas@adsmagnify.in - Login successful (Role: employee)
   ✅ srushti@adsmagnify.in - Login successful (Role: employee)
   ```

### Step 4: Reload Your Web App

1. **Go to the Web tab** in PythonAnywhere
2. **Click "Reload"** to restart your application

### Step 5: Test Login

1. **Visit your website**
2. **Try logging in with**:
   - **Email**: `admin@workholic.in`
   - **Password**: `admin123`

## 🔐 All Available Login Credentials

### Admin Logins:
- **Email**: `admin@workholic.in` | **Password**: `admin123`
- **Email**: `vinay@workoholic.in` | **Password**: `vinay@123`

### Employee Logins:
- **Email**: `shreyas@adsmagnify.in` | **Password**: `shreyas@123`
- **Email**: `srushti@adsmagnify.in` | **Password**: `srushti@123`
- **Email**: `vinay@adsmagnify.in` | **Password**: `vinay@123`
- **Email**: `pooja@adsmagnify.in` | **Password**: `pooja@123`
- **Email**: `ketan@adsmagnify.in` | **Password**: `ketan@123`
- **Email**: `omkar@adsmagnify.in` | **Password**: `omkar@123`

## 🚨 If Still Not Working

### Check File Permissions:
```bash
ls -la data/
chmod 644 data/workholic-data.xlsx
```

### Check if Database Exists:
```bash
ls -la data/workholic-data.xlsx
```

### Check PythonAnywhere Logs:
1. **Go to Web tab**
2. **Check error logs** for any error messages
3. **Look for permission errors**

## ✅ Success Indicators

You'll know it's working when:
- ✅ The fix script runs without errors
- ✅ The test script shows all logins successful
- ✅ You can login to your website
- ✅ No error messages in the logs

## 🆘 Emergency Fallback

If nothing works, try this manual approach:

1. **Create a simple database**:
   ```bash
   python3.10 -c "
   from app import write_excel_data
   data = {
       'employees': [{'email': 'admin@workholic.in', 'name': 'Admin', 'role': 'admin', 'schedule': 'general', 'password': 'admin123'}],
       'attendance': [],
       'leaderboard': []
   }
   write_excel_data(data)
   print('Database created!')
   "
   ```

2. **Test the login** with `admin@workholic.in` / `admin123`

---

**This should fix your PythonAnywhere login issues completely!** 🎉
