document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    
    // Check if user is already logged in
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // User is already logged in, redirect to appropriate dashboard
                window.location.href = data.user.role === 'admin' ? '/admin.html' : '/employee.html';
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
        });
    
    function showMessage(message, type = 'error') {
        messageDiv.textContent = message;
        messageDiv.className = `mt-4 p-3 rounded-lg text-center ${type === 'success' ? 'message-success' : type === 'info' ? 'message-info' : 'message-error'}`;
        messageDiv.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showMessage('Please enter both email and password');
            return;
        }
        
        // Add loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.firstLogin) {
                    showMessage('Welcome! Your password has been set successfully.', 'success');
                    setTimeout(() => {
                        window.location.href = data.role === 'admin' ? '/' : '/';
                    }, 2000);
                } else {
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                }
            } else {
                showMessage(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Connection error. Please try again.');
        } finally {
            // Remove loading state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
    
    // Demo account quick login
    const demoAccounts = document.querySelectorAll('p');
    demoAccounts.forEach(p => {
        if (p.innerHTML.includes('@workholic.in')) {
            p.style.cursor = 'pointer';
            p.addEventListener('click', function() {
                const text = p.textContent;
                if (text.includes('admin@workholic.in')) {
                    document.getElementById('email').value = 'admin@workholic.in';
                    document.getElementById('password').value = 'admin123';
                    showMessage('Demo admin credentials filled. Click Sign In to continue.', 'info');
                }
            });
        }
    });
});