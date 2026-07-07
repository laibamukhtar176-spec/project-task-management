// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const mockUser = { email: "employee@allied.com", password: "password123" };

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const taskForm = document.getElementById('task-form');
const taskListBody = document.getElementById('task-list-body');

// --- 1. LOGIN LOGIC ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    if(email === mockUser.email && pass === mockUser.password) {
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        initApp();
    } else {
        errorMsg.classList.remove('hidden');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

// --- 2. TASK CREATION & VALIDATION ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const assignee = document.getElementById('task-assignee').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;
    const startDate = document.getElementById('task-start').value;
    const dueDate = document.getElementById('task-due').value;

    // Business Logic Validation: Due date cannot be before start date
    if (new Date(dueDate) < new Date(startDate)) {
        alert("Error: Due date cannot be earlier than the start date.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title,
        assignee,
        priority,
        status,
        startDate,
        dueDate
    };

    tasks.push(newTask);
    saveAndRender();
    taskForm.reset();
});

// --- 3. HELPER FUNCTIONS (Business Rules & Storage) ---
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    calculateMetrics();
}

function isOverdue(task) {
    const today = new Date().setHours(0,0,0,0);
    const dueDate = new Date(task.dueDate).setHours(0,0,0,0);
    return dueDate < today && task.status !== 'Completed';
}

// --- 4. FILTER, SEARCH & RENDER LOGIC ---
function renderTasks() {
    const searchVal = document.getElementById('search-employee').value.toLowerCase();
    const filterPriority = document.getElementById('filter-priority').value;
    const filterStatus = document.getElementById('filter-status').value;

    taskListBody.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.assignee.toLowerCase().includes(searchVal);
        const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        return matchesSearch && matchesPriority && matchesStatus;
    });

    filteredTasks.forEach(task => {
        const tr = document.createElement('tr');
        
        // Business Rule: High priority overdue tasks must be highlighted
        if (task.priority === 'High' && isOverdue(task)) {
            tr.classList.add('high-priority-overdue');
        }

        tr.innerHTML = `
            <td>${task.title}</td>
            <td>${task.assignee}</td>
            <td>${task.priority}</td>
            <td>${task.status}</td>
            <td>${task.dueDate}</td>
            <td><button class="btn-danger" onclick="deleteTask(${task.id})">Delete</button></td>
        `;
        taskListBody.appendChild(tr);
    });
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

// --- 5. METRICS & REPORTS GENERATION ---
function calculateMetrics() {
    const totalTasks = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    
    // Business Rule: Completed tasks should not appear in pending counts
    const pending = tasks.filter(t => t.status !== 'Completed').length;
    const overdue = tasks.filter(t => isOverdue(t)).length;

    // Assuming every unique title represents a unique mini-project context for prototype simplicity
    const uniqueProjects = [...new Set(tasks.map(t => t.title))].length;

    // Update Cards
    document.getElementById('metric-total-projects').innerText = uniqueProjects;
    document.getElementById('metric-completed').innerText = completed;
    document.getElementById('metric-pending').innerText = pending;
    document.getElementById('metric-overdue').innerText = overdue;

    // Update Progress Bar Report
    const progressPercent = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progressPercent}%`;
    progressBar.innerText = `${progressPercent}%`;

    // Summary Text
    document.getElementById('report-summary').innerText = 
        `System Summary: Currently tracking ${totalTasks} tasks. Total overdue action items: ${overdue}.`;
}

// Event Listeners for Live Search/Filtering
document.getElementById('search-employee').addEventListener('input', renderTasks);
document.getElementById('filter-priority').addEventListener('change', renderTasks);
document.getElementById('filter-status').addEventListener('change', renderTasks);

function initApp() {
    renderTasks();
    calculateMetrics();
}
// Hotfix applied to date validation mechanism.