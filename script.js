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
            <button class="delete-btn">Delete</button>
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
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
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
