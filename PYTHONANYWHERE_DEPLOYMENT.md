# WorkoHolic - PythonAnywhere Deployment Guide

This guide will help you deploy your WorkoHolic Flask application to PythonAnywhere.

## 🚀 Prerequisites

1. **PythonAnywhere Account**: Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)
2. **Python Version**: Ensure you're using Python 3.10 (recommended)

## 📋 Step-by-Step Deployment

### 1. Upload Your Project

1. **Create a new directory** in your PythonAnywhere home directory:
   ```bash
   mkdir WorkoHolic
   cd WorkoHolic
   ```

2. **Upload all project files** to this directory:
   - `app.py`
   - `wsgi.py`
   - `requirements.txt`
   - `templates/` folder
   - `static/` folder
   - `data/` folder (create if it doesn't exist)

### 2. Install Dependencies

1. **Open a Bash console** in PythonAnywhere
2. **Navigate to your project directory**:
   ```bash
   cd ~/WorkoHolic
   ```

3. **Install Python dependencies**:
   ```bash
   pip3.10 install --user -r requirements.txt
   ```

### 3. Configure WSGI File

1. **Update the wsgi.py file** with your actual username:
   ```python
   #!/usr/bin/python3.10
   
   import sys
   import os
   
   # Add the project directory to the Python path
   sys.path.insert(0, '/home/YOURUSERNAME/WorkoHolic')
   
   # Import the Flask app
   from app import app
   
   # This is the WSGI application that PythonAnywhere will use
   application = app
   
   if __name__ == "__main__":
       app.run()
   ```

2. **Replace `YOURUSERNAME`** with your actual PythonAnywhere username

### 4. Configure Web App

1. **Go to the Web tab** in your PythonAnywhere dashboard
2. **Click "Add a new web app"**
3. **Choose "Flask"** as the framework
4. **Select Python 3.10**
5. **Set the source code directory** to `/home/YOURUSERNAME/WorkoHolic`
6. **Set the WSGI file** to `/home/YOURUSERNAME/WorkoHolic/wsgi.py`

### 5. Configure Static Files

1. **In the Web tab**, scroll down to "Static files"
2. **Add static file mapping**:
   - URL: `/static/`
   - Directory: `/home/YOURUSERNAME/WorkoHolic/static/`

### 6. Set Up Data Directory

1. **Create the data directory**:
   ```bash
   mkdir -p ~/WorkoHolic/data
   ```

2. **Set proper permissions**:
   ```bash
   chmod 755 ~/WorkoHolic/data
   ```

### 7. Initialize the Application

1. **Open a Bash console** and run:
   ```bash
   cd ~/WorkoHolic
   python3.10 init_pythonanywhere.py
   ```

   This will:
   - Create the data directory if it doesn't exist
   - Initialize the Excel database
   - Add the admin user (`admin@workholic.in` / `admin123`)
   - Show you all available login credentials

### 8. Reload Your Web App

1. **Go to the Web tab**
2. **Click "Reload"** to restart your application

## 🔧 Configuration Details

### Environment Variables (Optional)

You can set environment variables in the Web tab:
- `FLASK_ENV=production`
- `SECRET_KEY=your-secret-key-here`

### Database Configuration

The application uses Excel files for data storage:
- **Location**: `/home/YOURUSERNAME/WorkoHolic/data/workholic-data.xlsx`
- **Auto-created**: Yes, on first run
- **Backup**: Manual (recommended to download periodically)

## 🌐 Accessing Your Application

1. **Your app will be available at**: `https://YOURUSERNAME.pythonanywhere.com`
2. **Default admin credentials**:
   - Email: `admin@workholic.in`
   - Password: `admin123`

## 🔒 Security Considerations

1. **Change the secret key** in `app.py`:
   ```python
   app.secret_key = 'your-very-secure-secret-key-here'
   ```

2. **Use HTTPS** (PythonAnywhere provides this automatically)

3. **Regular backups** of your Excel data file

## 📊 Monitoring and Maintenance

### Logs
- **Error logs**: Available in the Web tab
- **Console logs**: Check the Files tab for any issues

### Backups
1. **Download your data file** regularly:
   ```bash
   # In Files tab, navigate to /home/YOURUSERNAME/WorkoHolic/data/
   # Download workholic-data.xlsx
   ```

### Updates
1. **Upload new files** to replace existing ones
2. **Reload the web app** after changes
3. **Test thoroughly** before going live

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**:
   - Check that all dependencies are installed
   - Verify the Python path in wsgi.py

2. **File Permission Errors**:
   - Ensure the data directory has proper permissions
   - Check file ownership

3. **Static Files Not Loading**:
   - Verify static file mapping in Web tab
   - Check that files are in the correct directory

4. **Excel File Issues**:
   - Ensure the data directory exists
   - Check file permissions
   - Verify the application can write to the directory

### Debug Mode

For debugging, you can temporarily enable debug mode in `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True)
```

## 📈 Performance Optimization

1. **Enable gzip compression** (automatic on PythonAnywhere)
2. **Optimize images** in the static folder
3. **Use CDN** for external resources if needed

## 🔄 Updates and Maintenance

### Updating the Application

1. **Upload new files** to replace existing ones
2. **Reload the web app**
3. **Test all functionality**

### Data Migration

If you need to migrate data:
1. **Download current Excel file**
2. **Make changes locally**
3. **Upload the updated file**

## 📞 Support

- **PythonAnywhere Documentation**: [help.pythonanywhere.com](https://help.pythonanywhere.com)
- **Flask Documentation**: [flask.palletsprojects.com](https://flask.palletsprojects.com)
- **Project Issues**: Create an issue in the repository

---

**Your WorkoHolic application is now ready for production on PythonAnywhere!** 🚀
