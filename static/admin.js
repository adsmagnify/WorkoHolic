document.addEventListener('DOMContentLoaded', function() {
    let currentUser = null;
    
    // DOM elements
    const logoutBtn = document.getElementById('logoutBtn');
    const taskForm = document.getElementById('taskForm');
    const employeeSelect = document.getElementById('employeeSelect');
    const taskType = document.getElementById('taskType');
    const taskCount = document.getElementById('taskCount');
    const taskMessage = document.getElementById('taskMessage');
    const dateFilter = document.getElementById('dateFilter');
    const employeeFilter = document.getElementById('employeeFilter');
    const attendanceTable = document.getElementById('attendanceTable');
    const fullLeaderboard = document.getElementById('fullLeaderboard');
    const usersTable = document.getElementById('usersTable');
    const addUserBtn = document.getElementById('addUserBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const userModal = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const modalTitle = document.getElementById('modalTitle');
    const userId = document.getElementById('userId');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userRole = document.getElementById('userRole');
    const userSchedule = document.getElementById('userSchedule');
    const userPassword = document.getElementById('userPassword');
    const passwordField = document.getElementById('passwordField');
    const closeModal = document.getElementById('closeModal');
    const cancelUser = document.getElementById('cancelUser');
    
    // Initialize
    init();
    
    async function init() {
        try {
            // Check authentication
            const authResponse = await fetch('/api/user');
            const authData = await authResponse.json();
            
            if (!authData.success || authData.user.role !== 'admin') {
                window.location.href = '/';
                return;
            }
            
            currentUser = authData.user;
            
            // Load employees
            await loadEmployees();
            
            // Load users
            await loadUsers();
            
            // Load attendance data
            await loadAttendance();
            
            // Load full leaderboard
            await loadFullLeaderboard();
            
            // Set today's date as default filter
            dateFilter.valueAsDate = new Date();
            
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    async function loadEmployees() {
        try {
            const response = await fetch('/api/admin/employees');
            const data = await response.json();
            
            if (data.success) {
                // Populate employee select for tasks
                employeeSelect.innerHTML = '<option value="">Select Employee</option>';
                data.employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.email;
                    option.textContent = `${employee.name || 'Unknown'} (${employee.email})`;
                    employeeSelect.appendChild(option);
                });
                
                // Populate employee filter for attendance
                employeeFilter.innerHTML = '<option value="">All Employees</option>';
                data.employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.email;
                    option.textContent = `${employee.name || 'Unknown'}`;
                    employeeFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }
    
    async function loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            
            if (data.success) {
                renderUsers(data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }
    
    function renderUsers(users) {
        usersTable.innerHTML = '';
        
        if (!users || users.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No users found</td></tr>';
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${user.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${user.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${user.schedule}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button 
                            onclick="editUser('${user.email}')" 
                            class="text-blue-600 hover:text-blue-900"
                        >
                            Edit
                        </button>
                        <button 
                            onclick="deleteUser('${user.email}')" 
                            class="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            `;
            
            usersTable.appendChild(row);
        });
    }
    
    async function loadAttendance() {
        try {
            const response = await fetch('/api/admin/attendance');
            const data = await response.json();
            
            if (data.success) {
                renderAttendance(data.attendance);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }
    
    function renderAttendance(attendance) {
        attendanceTable.innerHTML = '';
        
        if (!attendance || attendance.length === 0) {
            attendanceTable.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No attendance records found</td></tr>';
            return;
        }
        
        // Apply filters
        let filteredAttendance = attendance;
        
        const selectedDate = dateFilter.value;
        const selectedEmployee = employeeFilter.value;
        
        if (selectedDate) {
            filteredAttendance = filteredAttendance.filter(record => record.date === selectedDate);
        }
        
        if (selectedEmployee) {
            filteredAttendance = filteredAttendance.filter(record => record.email === selectedEmployee);
        }
        
        // Sort by date (newest first)
        filteredAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render records
        filteredAttendance.forEach(record => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            const clockInTime = record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '-';
            const clockOutTime = record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '-';
            
            const statusMap = {
                'FD': { text: 'Full Day', class: 'status-fd' },
                'HD': { text: 'Half Day', class: 'status-hd' },
                'A': { text: 'Absent', class: 'status-a' }
            };
            const status = statusMap[record.status] || { text: record.status, class: 'bg-gray-100 text-gray-700' };
            
            // Format breaks
            let breaksInfo = '-';
            if (record.breaks && record.breaks.length > 0) {
                const totalBreakTime = record.breaks.reduce((total, brk) => {
                    if (brk.start && brk.end) {
                        return total + (new Date(brk.end) - new Date(brk.start));
                    }
                    return total;
                }, 0);
                
                const breakMinutes = Math.floor(totalBreakTime / (1000 * 60));
                breaksInfo = `${record.breaks.length} breaks (${breakMinutes} min)`;
            }
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${record.name || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(record.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${clockInTime}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${clockOutTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${status.class}">${status.text}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${breaksInfo}</td>
            `;
            
            attendanceTable.appendChild(row);
        });
    }
    
    async function loadFullLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            const data = await response.json();
            
            if (data.success) {
                renderFullLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Error loading full leaderboard:', error);
        }
    }
    
    function renderFullLeaderboard(entries) {
        fullLeaderboard.innerHTML = '';
        
        if (!entries || entries.length === 0) {
            fullLeaderboard.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No leaderboard data available</td></tr>';
            return;
        }
        
        entries.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.className = `hover:bg-gray-50 ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : ''}`;
            
            const rankDisplay = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${entry.rank}`;
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    <span class="text-lg">${rankDisplay}</span> ${entry.rank}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${entry.name || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    ${entry.totalPoints || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${entry.smallTasks || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${entry.regularTasks || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${entry.bigTasks || 0}
                </td>
            `;
            
            fullLeaderboard.appendChild(row);
        });
    }
    
    function showTaskMessage(message, type = 'error') {
        taskMessage.textContent = message;
        taskMessage.className = `mt-4 p-3 rounded-lg text-center ${type === 'success' ? 'message-success' : type === 'info' ? 'message-info' : 'message-error'}`;
        taskMessage.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            taskMessage.classList.add('hidden');
        }, 5000);
    }
    
    // Event listeners
    taskForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = employeeSelect.value;
        const type = taskType.value;
        const count = parseInt(taskCount.value);
        
        if (!email || !type || !count) {
            showTaskMessage('Please fill in all fields');
            return;
        }
        
        if (count <= 0) {
            showTaskMessage('Task count must be greater than 0');
            return;
        }
        
        try {
            const response = await fetch('/api/admin/update-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, taskType: type, count })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showTaskMessage(`Successfully added ${count} ${type} task(s) for ${employeeSelect.options[employeeSelect.selectedIndex].text}`, 'success');
                taskForm.reset();
                
                // Reload leaderboard
                await loadFullLeaderboard();
            } else {
                showTaskMessage(data.message || 'Failed to update tasks');
            }
        } catch (error) {
            console.error('Task update error:', error);
            showTaskMessage('Network error. Please try again.');
        }
    });
    
    dateFilter.addEventListener('change', () => {
        loadAttendance();
    });
    
    employeeFilter.addEventListener('change', () => {
        loadAttendance();
    });
    
    // User management event listeners
    addUserBtn.addEventListener('click', () => {
        openUserModal();
    });
    
    closeModal.addEventListener('click', () => {
        closeUserModal();
    });
    
    cancelUser.addEventListener('click', () => {
        closeUserModal();
    });
    
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUser();
    });
    
    userRole.addEventListener('change', () => {
        if (userRole.value === 'admin') {
            passwordField.classList.remove('hidden');
            userPassword.required = true;
        } else {
            passwordField.classList.add('hidden');
            userPassword.required = false;
        }
    });
    
    // Excel export
    exportExcelBtn.addEventListener('click', async () => {
        await exportToExcel();
    });
    
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
    
    // User management functions
    function openUserModal(user = null) {
        if (user) {
            modalTitle.textContent = 'Edit User';
            userId.value = user.email;
            userName.value = user.name;
            userEmail.value = user.email;
            userRole.value = user.role;
            userSchedule.value = user.schedule;
            userEmail.disabled = true;
            
            if (user.role === 'admin') {
                passwordField.classList.remove('hidden');
                userPassword.required = true;
            }
        } else {
            modalTitle.textContent = 'Add User';
            userForm.reset();
            userId.value = '';
            userEmail.disabled = false;
            passwordField.classList.add('hidden');
            userPassword.required = false;
        }
        
        userModal.classList.remove('hidden');
    }
    
    function closeUserModal() {
        userModal.classList.add('hidden');
        userForm.reset();
        userId.value = '';
        userEmail.disabled = false;
        passwordField.classList.add('hidden');
        userPassword.required = false;
    }
    
    async function saveUser() {
        const userData = {
            name: userName.value,
            email: userEmail.value,
            role: userRole.value,
            schedule: userSchedule.value
        };
        
        if (userPassword.value) {
            userData.password = userPassword.value;
        }
        
        const isEdit = userId.value;
        const url = isEdit ? '/api/admin/users/update' : '/api/admin/users/create';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showTaskMessage(`User ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                closeUserModal();
                await loadUsers();
                await loadEmployees(); // Refresh employee lists
            } else {
                showTaskMessage(data.message || 'Failed to save user');
            }
        } catch (error) {
            console.error('Save user error:', error);
            showTaskMessage('Network error. Please try again.');
        }
    }
    
    async function exportToExcel() {
        try {
            const response = await fetch('/api/admin/export-excel');
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-export-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showTaskMessage('Excel file downloaded successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showTaskMessage('Failed to export Excel file');
        }
    }
    
    // Global functions for user actions
    window.editUser = async function(email) {
        try {
            const response = await fetch(`/api/admin/users/${email}`);
            const data = await response.json();
            
            if (data.success) {
                openUserModal(data.user);
            } else {
                showTaskMessage('Failed to load user data');
            }
        } catch (error) {
            console.error('Edit user error:', error);
            showTaskMessage('Network error. Please try again.');
        }
    };
    
    window.deleteUser = async function(email) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        try {
            const response = await fetch('/api/admin/users/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showTaskMessage('User deleted successfully', 'success');
                await loadUsers();
                await loadEmployees(); // Refresh employee lists
            } else {
                showTaskMessage(data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            showTaskMessage('Network error. Please try again.');
        }
    };
});