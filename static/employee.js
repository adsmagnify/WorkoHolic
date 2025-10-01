document.addEventListener('DOMContentLoaded', function() {
    let currentUser = null;
    let todayRecord = null;
    let workStartTime = null;
    let breakStartTime = null;
    let totalBreakTime = 0;
    let isOnBreak = false;
    let timerInterval = null;
    let currentCalendarDate = new Date();
    let attendanceData = [];
    
    // DOM elements
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const clockInBtn = document.getElementById('clockInBtn');
    const breakBtn = document.getElementById('breakBtn');
    const breakBtnText = document.getElementById('breakBtnText');
    const clockOutBtn = document.getElementById('clockOutBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const currentStatus = document.getElementById('currentStatus');
    const statusDetails = document.getElementById('statusDetails');
    const workTime = document.getElementById('workTime');
    const breakTime = document.getElementById('breakTime');
    const attendanceStatus = document.getElementById('attendanceStatus');
    const liveWorkTimer = document.getElementById('liveWorkTimer');
    const liveBreakTimer = document.getElementById('liveBreakTimer');
    const workTimerIndicator = document.getElementById('workTimerIndicator');
    const breakTimerIndicator = document.getElementById('breakTimerIndicator');
    const attendanceHistory = document.getElementById('attendanceHistory');
    const leaderboard = document.getElementById('leaderboard');
    const userRank = document.getElementById('userRank');
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonth = document.getElementById('currentMonth');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const todaySchedule = document.getElementById('todaySchedule');
    
    // Initialize
    init();
    
    async function init() {
        try {
            // Check authentication
            const authResponse = await fetch('/api/user');
            const authData = await authResponse.json();
            
            if (!authData.success || authData.user.role !== 'employee') {
                window.location.href = '/';
                return;
            }
            
            currentUser = authData.user;
            userName.textContent = currentUser.name;
            
            // Load today's record
            await loadTodayRecord();
            
            // Load attendance history
            await loadAttendanceHistory();
            
            // Load calendar data
            await loadCalendarData();
            
            // Test server connection first
            await testServerConnection();
            
            // Load today's schedule
            await loadTodaySchedule();
            
            // Fallback: If schedule doesn't load, try again after a short delay
            setTimeout(async () => {
                if (todaySchedule.innerHTML.includes('Loading schedule')) {
                    console.log('Retrying schedule load...');
                    await loadTodaySchedule();
                }
            }, 1000);
            
            // Load leaderboard
            await loadLeaderboard();
            
            // Start timer updates
            startTimerUpdates();
            
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    async function loadTodayRecord() {
        try {
            const response = await fetch('/api/attendance/today');
            const data = await response.json();
            
            if (data.success) {
                todayRecord = data.record;
                updateUI();
            }
        } catch (error) {
            console.error('Error loading today record:', error);
        }
    }
    
    function updateUI() {
        if (!todayRecord) {
            // No record for today
            currentStatus.textContent = 'Not Started';
            statusDetails.textContent = 'Ready to clock in';
            statusIndicator.className = 'w-3 h-3 rounded-full bg-gray-400';
            
            clockInBtn.disabled = false;
            breakBtn.disabled = true;
            clockOutBtn.disabled = true;
            
            attendanceStatus.innerHTML = '<span class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">Not Marked</span>';
            return;
        }
        
        // Calculate current state
        const hasClockIn = !!todayRecord.clockIn;
        const hasClockOut = !!todayRecord.clockOut;
        const currentBreak = todayRecord.breaks ? todayRecord.breaks.find(b => b.start && !b.end) : null;
        
        isOnBreak = !!currentBreak;
        
        if (hasClockOut) {
            // Clocked out
            currentStatus.textContent = 'Clocked Out';
            const clockOutTime = new Date(todayRecord.clockOut);
            statusDetails.textContent = `Clocked out at ${clockOutTime.toLocaleTimeString()}`;
            statusIndicator.className = 'w-3 h-3 rounded-full bg-gray-400';
            
            clockInBtn.disabled = true;
            breakBtn.disabled = true;
            clockOutBtn.disabled = true;
            
            workStartTime = null;
            breakStartTime = null;
        } else if (hasClockIn) {
            if (isOnBreak) {
                currentStatus.textContent = 'On Break';
                const breakStart = new Date(currentBreak.start);
                statusDetails.textContent = `Break started at ${breakStart.toLocaleTimeString()}`;
                statusIndicator.className = 'w-3 h-3 rounded-full bg-yellow-500';
                
                breakBtnText.textContent = 'End Break';
                breakStartTime = new Date(currentBreak.start);
            } else {
                currentStatus.textContent = 'Clocked In';
                const clockInTime = new Date(todayRecord.clockIn);
                statusDetails.textContent = `Clocked in at ${clockInTime.toLocaleTimeString()}`;
                statusIndicator.className = 'w-3 h-3 rounded-full bg-green-500';
                
                breakBtnText.textContent = 'Start Break';
                workStartTime = new Date(todayRecord.clockIn);
            }
            
            clockInBtn.disabled = true;
            breakBtn.disabled = false;
            clockOutBtn.disabled = false;
        } else {
            // Not clocked in
            currentStatus.textContent = 'Not Started';
            statusDetails.textContent = 'Ready to clock in';
            statusIndicator.className = 'w-3 h-3 rounded-full bg-gray-400';
            
            clockInBtn.disabled = false;
            breakBtn.disabled = true;
            clockOutBtn.disabled = true;
        }
        
        // Update attendance status
        if (todayRecord.status) {
            const statusMap = {
                'FD': { text: 'Full Day', class: 'status-fd' },
                'HD': { text: 'Half Day', class: 'status-hd' },
                'A': { text: 'Absent', class: 'status-a' }
            };
            const status = statusMap[todayRecord.status] || { text: todayRecord.status, class: 'bg-gray-100 text-gray-700' };
            attendanceStatus.innerHTML = `<span class="status-badge ${status.class}">${status.text}</span>`;
        }
        
        // Calculate total break time
        if (todayRecord.breaks) {
            totalBreakTime = todayRecord.breaks.reduce((total, brk) => {
                if (brk.start && brk.end) {
                    return total + (new Date(brk.end) - new Date(brk.start));
                }
                return total;
            }, 0);
        }
    }
    
    function startTimerUpdates() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            updateTimers();
        }, 1000);
        
        updateTimers(); // Initial update
    }
    
    function updateTimers() {
        const now = new Date();
        
        // Work timer
        if (workStartTime && !isOnBreak && todayRecord && !todayRecord.clockOut) {
            const elapsed = now - workStartTime;
            const totalWorkTime = elapsed - totalBreakTime;
            liveWorkTimer.textContent = formatTime(Math.max(0, totalWorkTime));
            workTimerIndicator.className = 'w-3 h-3 rounded-full bg-green-500 pulse-animation';
        } else if (todayRecord && todayRecord.clockIn && todayRecord.clockOut) {
            // Show final work time
            const clockIn = new Date(todayRecord.clockIn);
            const clockOut = new Date(todayRecord.clockOut);
            const totalTime = clockOut - clockIn - totalBreakTime;
            liveWorkTimer.textContent = formatTime(Math.max(0, totalTime));
            workTimerIndicator.className = 'w-3 h-3 rounded-full bg-gray-400';
        } else {
            liveWorkTimer.textContent = '00:00:00';
            workTimerIndicator.className = 'w-3 h-3 rounded-full bg-gray-400';
        }
        
        // Break timer
        if (breakStartTime && isOnBreak) {
            const breakElapsed = now - breakStartTime;
            liveBreakTimer.textContent = formatTime(breakElapsed);
            breakTimerIndicator.className = 'w-3 h-3 rounded-full bg-red-500 pulse-animation';
        } else {
            liveBreakTimer.textContent = '00:00:00';
            breakTimerIndicator.className = 'w-3 h-3 rounded-full bg-gray-400';
        }
        
        // Update summary times
        if (todayRecord && todayRecord.clockIn) {
            if (todayRecord.clockOut) {
                const clockIn = new Date(todayRecord.clockIn);
                const clockOut = new Date(todayRecord.clockOut);
                const totalTime = clockOut - clockIn - totalBreakTime;
                workTime.textContent = formatTime(Math.max(0, totalTime), true);
            } else if (!isOnBreak) {
                const elapsed = now - new Date(todayRecord.clockIn);
                const totalWorkTime = elapsed - totalBreakTime;
                workTime.textContent = formatTime(Math.max(0, totalWorkTime), true);
            }
        }
        
        breakTime.textContent = Math.floor(totalBreakTime / (1000 * 60)) + ' min';
    }
    
    function formatTime(milliseconds, compact = false) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (compact) {
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    async function performClockAction(action) {
        try {
            const response = await fetch('/api/clock-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action })
            });
            
            const data = await response.json();
            
            if (data.success) {
                todayRecord = data.record;
                updateUI();
                
                if (action === 'clock-in') {
                    workStartTime = new Date(todayRecord.clockIn);
                } else if (action === 'break-start') {
                    const currentBreak = todayRecord.breaks[todayRecord.breaks.length - 1];
                    breakStartTime = new Date(currentBreak.start);
                } else if (action === 'break-end') {
                    breakStartTime = null;
                    // Recalculate total break time
                    totalBreakTime = todayRecord.breaks.reduce((total, brk) => {
                        if (brk.start && brk.end) {
                            return total + (new Date(brk.end) - new Date(brk.start));
                        }
                        return total;
                    }, 0);
                } else if (action === 'clock-out') {
                    workStartTime = null;
                    breakStartTime = null;
                    await loadLeaderboard(); // Refresh leaderboard after clock out
                }
            } else {
                alert('Error: ' + (data.message || 'Action failed'));
            }
        } catch (error) {
            console.error('Clock action error:', error);
            alert('Network error. Please try again.');
        }
    }
    
    async function loadAttendanceHistory() {
        try {
            const response = await fetch('/api/attendance/history');
            const data = await response.json();
            
            if (data.success) {
                renderAttendanceHistory(data.attendance);
            }
        } catch (error) {
            console.error('Error loading attendance history:', error);
        }
    }
    
    async function loadCalendarData() {
        try {
            const response = await fetch('/api/attendance/history');
            const data = await response.json();
            
            if (data.success) {
                attendanceData = data.attendance;
                renderCalendar();
            }
        } catch (error) {
            console.error('Error loading calendar data:', error);
        }
    }
    
    function renderCalendar() {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        // Update month display
        currentMonth.textContent = currentCalendarDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Clear calendar
        calendarGrid.innerHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'h-12 bg-gray-50 rounded-lg';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const attendanceRecord = attendanceData.find(record => record.date === dateString);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'h-12 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100 transition relative';
            dayElement.textContent = day;
            
            // Set background color based on attendance status
            if (attendanceRecord) {
                const status = attendanceRecord.status;
                if (status === 'FD') {
                    dayElement.className += ' bg-green-500 text-white hover:bg-green-600';
                } else if (status === 'HD') {
                    dayElement.className += ' bg-yellow-500 text-white hover:bg-yellow-600';
                } else if (status === 'A') {
                    dayElement.className += ' bg-red-500 text-white hover:bg-red-600';
                } else if (status === 'H') {
                    dayElement.className += ' bg-gray-400 text-white hover:bg-gray-500';
                }
            } else {
                // Check if it's a weekend
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    dayElement.className += ' bg-gray-100 text-gray-400';
                }
            }
            
            // Add tooltip
            if (attendanceRecord) {
                const clockInTime = attendanceRecord.clockIn ? new Date(attendanceRecord.clockIn).toLocaleTimeString() : 'N/A';
                const clockOutTime = attendanceRecord.clockOut ? new Date(attendanceRecord.clockOut).toLocaleTimeString() : 'N/A';
                
                // Calculate break duration
                let breakDuration = '0 min';
                if (attendanceRecord.breaks && attendanceRecord.breaks.length > 0) {
                    const totalBreakTime = attendanceRecord.breaks.reduce((total, brk) => {
                        if (brk.start && brk.end) {
                            return total + (new Date(brk.end) - new Date(brk.start));
                        }
                        return total;
                    }, 0);
                    breakDuration = Math.floor(totalBreakTime / (1000 * 60)) + ' min';
                }
                
                const tooltipContent = `
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 whitespace-nowrap">
                        <div class="font-semibold">${date.toLocaleDateString()}</div>
                        <div>Status: ${attendanceRecord.status}</div>
                        <div>Clock In: ${clockInTime}</div>
                        <div>Clock Out: ${clockOutTime}</div>
                        <div>Break: ${breakDuration}</div>
                    </div>
                `;
                
                dayElement.innerHTML = day + tooltipContent;
                dayElement.className += ' group';
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    async function testServerConnection() {
        try {
            console.log('Testing server connection...');
            const response = await fetch('/api/test');
            const data = await response.json();
            console.log('Server test response:', data);
        } catch (error) {
            console.error('Server connection test failed:', error);
        }
    }
    
    async function loadTodaySchedule() {
        try {
            console.log('Loading today schedule...');
            const response = await fetch('/api/schedule/today');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Schedule API response:', data);
            
            if (data.success) {
                console.log('Schedule data:', data.schedule);
                renderTodaySchedule(data.schedule);
            } else {
                console.error('Schedule API error:', data.message);
                // Show fallback schedule based on current user
                showFallbackSchedule();
            }
        } catch (error) {
            console.error('Error loading today schedule:', error);
            // Show fallback schedule instead of error
            showFallbackSchedule();
        }
    }
    
    function showFallbackSchedule() {
        // Show a default schedule as fallback
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        let fallbackSchedule = '';
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            fallbackSchedule = '<div class="text-sm text-gray-500">Weekend - No work scheduled</div>';
        } else {
            // Default weekday schedule
            fallbackSchedule = `
                <div class="text-sm font-medium text-blue-800">Clock In: 10:30</div>
                <div class="text-sm font-medium text-blue-800">Clock Out: 19:00</div>
                <div class="text-sm text-blue-600">8h required</div>
                <div class="text-sm text-blue-600">60 min break</div>
            `;
        }
        
        todaySchedule.innerHTML = fallbackSchedule;
    }
    
    function renderTodaySchedule(schedule) {
        console.log('Rendering schedule:', schedule);
        
        if (!schedule) {
            todaySchedule.innerHTML = '<div class="text-sm text-gray-500">No schedule available</div>';
            return;
        }
        
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        
        console.log('Day of week:', dayOfWeek, 'Day name:', dayName);
        
        let scheduleInfo = '';
        let clockInTime = '';
        let clockOutTime = '';
        let totalHours = '';
        let breakTime = '';
        
        if (schedule.weekend === 'off' && (dayOfWeek === 0 || dayOfWeek === 6)) {
            scheduleInfo = '<div class="text-sm text-gray-500">Weekend - No work scheduled</div>';
        } else if (schedule.weekend === 'off' && dayOfWeek === 5 && schedule.friday) {
            // Friday schedule
            clockInTime = schedule.friday.start;
            clockOutTime = schedule.friday.end;
            const startTime = new Date(`2000-01-01T${schedule.friday.start}`);
            const endTime = new Date(`2000-01-01T${schedule.friday.end}`);
            const totalMinutes = (endTime - startTime) / (1000 * 60);
            const workMinutes = totalMinutes - schedule.friday.breakDuration;
            totalHours = `${Math.floor(workMinutes / 60)}h required`;
            breakTime = `${schedule.friday.breakDuration} min break`;
            
            scheduleInfo = `
                <div class="text-sm font-medium text-blue-800">Clock In: ${clockInTime}</div>
                <div class="text-sm font-medium text-blue-800">Clock Out: ${clockOutTime}</div>
                <div class="text-sm text-blue-600">${totalHours}</div>
                <div class="text-sm text-blue-600">${breakTime}</div>
            `;
        } else if (schedule.workingSaturdays && dayOfWeek === 6) {
            // Check if it's a working Saturday
            const todayDate = today.getDate();
            const weekOfMonth = Math.ceil(todayDate / 7);
            const isWorkingSaturday = schedule.workingSaturdays.includes(weekOfMonth);
            
            if (isWorkingSaturday) {
                clockInTime = schedule.saturday.start;
                clockOutTime = schedule.saturday.end;
                const startTime = new Date(`2000-01-01T${schedule.saturday.start}`);
                const endTime = new Date(`2000-01-01T${schedule.saturday.end}`);
                const totalMinutes = (endTime - startTime) / (1000 * 60);
                const workMinutes = totalMinutes - schedule.saturday.breakDuration;
                totalHours = `${Math.floor(workMinutes / 60)}h required`;
                breakTime = `${schedule.saturday.breakDuration} min break`;
                
                scheduleInfo = `
                    <div class="text-sm font-medium text-blue-800">Clock In: ${clockInTime}</div>
                    <div class="text-sm font-medium text-blue-800">Clock Out: ${clockOutTime}</div>
                    <div class="text-sm text-blue-600">${totalHours}</div>
                    <div class="text-sm text-blue-600">${breakTime}</div>
                `;
            } else {
                scheduleInfo = '<div class="text-sm text-gray-500">Saturday - No work scheduled</div>';
            }
        } else if (dayOfWeek === 6 && schedule.saturday) {
            // Regular Saturday
            clockInTime = schedule.saturday.start;
            clockOutTime = schedule.saturday.end;
            const startTime = new Date(`2000-01-01T${schedule.saturday.start}`);
            const endTime = new Date(`2000-01-01T${schedule.saturday.end}`);
            const totalMinutes = (endTime - startTime) / (1000 * 60);
            const workMinutes = totalMinutes - schedule.saturday.breakDuration;
            totalHours = `${Math.floor(workMinutes / 60)}h required`;
            breakTime = `${schedule.saturday.breakDuration} min break`;
            
            scheduleInfo = `
                <div class="text-sm font-medium text-blue-800">Clock In: ${clockInTime}</div>
                <div class="text-sm font-medium text-blue-800">Clock Out: ${clockOutTime}</div>
                <div class="text-sm text-blue-600">${totalHours}</div>
                <div class="text-sm text-blue-600">${breakTime}</div>
            `;
        } else if (schedule.weekdays) {
            // Regular weekday
            clockInTime = schedule.weekdays.start;
            clockOutTime = schedule.weekdays.end;
            const startTime = new Date(`2000-01-01T${schedule.weekdays.start}`);
            const endTime = new Date(`2000-01-01T${schedule.weekdays.end}`);
            const totalMinutes = (endTime - startTime) / (1000 * 60);
            const workMinutes = totalMinutes - schedule.weekdays.breakDuration;
            totalHours = `${Math.floor(workMinutes / 60)}h required`;
            breakTime = `${schedule.weekdays.breakDuration} min break`;
            
            scheduleInfo = `
                <div class="text-sm font-medium text-blue-800">Clock In: ${clockInTime}</div>
                <div class="text-sm font-medium text-blue-800">Clock Out: ${clockOutTime}</div>
                <div class="text-sm text-blue-600">${totalHours}</div>
                <div class="text-sm text-blue-600">${breakTime}</div>
            `;
        } else {
            scheduleInfo = '<div class="text-sm text-gray-500">No schedule available</div>';
        }
        
        todaySchedule.innerHTML = scheduleInfo;
    }
    
    function renderAttendanceHistory(attendance) {
        attendanceHistory.innerHTML = '';
        
        if (!attendance || attendance.length === 0) {
            attendanceHistory.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No attendance records found</td></tr>';
            return;
        }
        
        attendance.forEach(record => {
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
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(record.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${clockInTime}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${clockOutTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${status.class}">${status.text}</span>
                </td>
            `;
            
            attendanceHistory.appendChild(row);
        });
    }
    
    async function loadLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            const data = await response.json();
            
            if (data.success) {
                renderLeaderboard(data.leaderboard, data.userRank);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }
    
    function renderLeaderboard(entries, userRankNumber) {
        leaderboard.innerHTML = '';
        
        if (!entries || entries.length === 0) {
            leaderboard.innerHTML = '<p class="text-center text-gray-500">No leaderboard data available</p>';
            return;
        }
        
        entries.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = `leaderboard-entry p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition ${index < 3 ? `rank-${index + 1}` : ''}`;
            
            const rankIcons = ['🥇', '🥈', '🥉'];
            const rankIcon = index < 3 ? rankIcons[index] : `#${entry.rank}`;
            
            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="text-2xl font-bold ${index < 3 ? 'text-yellow-600' : 'text-gray-600'}">
                            ${rankIcon}
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">${entry.name || 'Unknown'}</div>
                            <div class="text-sm text-gray-600">
                                Tasks: ${entry.smallTasks || 0}S • ${entry.regularTasks || 0}R • ${entry.bigTasks || 0}B
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-blue-600">${entry.totalPoints || 0}</div>
                        <div class="text-sm text-gray-500">points</div>
                    </div>
                </div>
            `;
            
            leaderboard.appendChild(div);
        });
        
        // Show user rank if not in top 8
        if (userRankNumber) {
            userRank.innerHTML = `
                <div class="text-center">
                    <p class="text-lg font-semibold text-blue-800">Your Rank: #${userRankNumber}</p>
                    <p class="text-sm text-blue-600">Keep working hard to climb the leaderboard!</p>
                </div>
            `;
            userRank.classList.remove('hidden');
        } else {
            userRank.classList.add('hidden');
        }
    }
    
    // Event listeners
    clockInBtn.addEventListener('click', () => performClockAction('clock-in'));
    clockOutBtn.addEventListener('click', () => performClockAction('clock-out'));
    
    breakBtn.addEventListener('click', () => {
        if (isOnBreak) {
            performClockAction('break-end');
        } else {
            performClockAction('break-start');
        }
    });
    
    // Calendar navigation
    prevMonth.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonth.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
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
});