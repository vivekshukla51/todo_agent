// Get elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const themeToggle = document.getElementById('themeToggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const itemsLeft = document.getElementById('itemsLeft');
const clearCompleted = document.getElementById('clearCompleted');
const inlineMessage = document.getElementById('inlineMessage');

// Load todos from localStorage on page load
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    loadTheme();
    renderTodos();
    
    // Event listeners
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    themeToggle.addEventListener('click', toggleTheme);
    todoInput.addEventListener('input', clearMessage);
    clearCompleted.addEventListener('click', clearCompletedTodos);
    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });
}

// Theme functions
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

// Add new todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        showMessage('Add a task before hitting enter.');
        todoInput.classList.remove('shake');
        void todoInput.offsetWidth;
        todoInput.classList.add('shake');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    todos.push(todo);
    saveTodos();
    renderTodos();
    clearMessage();
    
    // Clear input
    todoInput.value = '';
    todoInput.focus();
}

// Render all todos
function renderTodos() {
    todoList.innerHTML = '';
    updateMeta();

    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        const message = todos.length === 0
            ? 'No tasks yet. Add one above!'
            : currentFilter === 'active'
                ? 'All caught up. No active tasks.'
                : 'Nothing completed yet.';
        todoList.innerHTML = `<div class="empty-state">${message}</div>`;
        return;
    }
    
    filteredTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;
        li.style.animationDelay = `${index * 0.03}s`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" aria-label="Delete task">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6M14 11v6"></path>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
            </button>
        `;
        
        // Toggle complete
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        // Delete todo
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(li);
    });
}

// Toggle todo completion
function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

// Delete todo
function deleteTodo(id) {
    const items = todoList.querySelectorAll('.todo-item');
    const filteredTodos = getFilteredTodos();
    const idx = filteredTodos.findIndex(t => t.id === id);
    if (idx !== -1 && items[idx]) {
        items[idx].classList.add('removing');
        items[idx].addEventListener('animationend', () => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }, { once: true });
    } else {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
}

// Clear completed todos
function clearCompletedTodos() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

// Update counters and controls
function updateMeta() {
    const remaining = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${remaining} left`;
    clearCompleted.disabled = !todos.some(todo => todo.completed);

    const total = todos.length;
    const completed = total - remaining;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressBar = document.getElementById('progressBar');
    const progressWrap = document.getElementById('progressWrap');
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressWrap) progressWrap.style.display = total > 0 ? 'block' : 'none';
}

// Filter helpers
function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((btn) => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    renderTodos();
}

function getFilteredTodos() {
    if (currentFilter === 'active') {
        return todos.filter(todo => !todo.completed);
    }
    if (currentFilter === 'completed') {
        return todos.filter(todo => todo.completed);
    }
    return todos;
}

function showMessage(text) {
    inlineMessage.textContent = text;
    inlineMessage.classList.add('show');
}

function clearMessage() {
    inlineMessage.textContent = '';
    inlineMessage.classList.remove('show');
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start the app
init();
