// Sales Training Platform - Client-side JavaScript

class TaskManager {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateFilterButtons();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('input[name="filter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.filterTasks();
            });
        });

        // Add task form enhancement
        const addTaskForm = document.getElementById('addTaskForm');
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', (e) => {
                const description = document.getElementById('description').value.trim();
                if (!description) {
                    e.preventDefault();
                    this.showAlert('Task description is required!', 'error');
                }
            });
        }
    }

    filterTasks() {
        const tasks = document.querySelectorAll('.task-item');
        const emptyState = document.getElementById('emptyState');
        let visibleCount = 0;

        tasks.forEach(task => {
            const taskStatus = task.getAttribute('data-status');
            const shouldShow = this.currentFilter === 'all' || taskStatus === this.currentFilter;
            
            if (shouldShow) {
                task.style.display = 'block';
                visibleCount++;
            } else {
                task.style.display = 'none';
            }
        });

        // Show/hide empty state
        if (emptyState) {
            if (visibleCount === 0 && tasks.length > 0) {
                emptyState.style.display = 'block';
                emptyState.innerHTML = `
                    <i class="fas fa-filter fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No ${this.currentFilter} tasks</h5>
                    <p class="text-muted">Try changing the filter or add a new task.</p>
                `;
            } else if (visibleCount === 0 && tasks.length === 0) {
                emptyState.style.display = 'block';
                emptyState.innerHTML = `
                    <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No training tasks yet</h5>
                    <p class="text-muted">Add your first onboarding or training task to get started.</p>
                `;
            } else {
                emptyState.style.display = 'none';
            }
        }

        this.updateFilterButtons();
    }

    updateFilterButtons() {
        const allTasks = document.querySelectorAll('.task-item');
        const activeTasks = document.querySelectorAll('.task-item[data-status="active"]');
        const completedTasks = document.querySelectorAll('.task-item[data-status="completed"]');

        // Update button text with counts
        const allBtn = document.querySelector('label[for="filterAll"]');
        const activeBtn = document.querySelector('label[for="filterActive"]');
        const completedBtn = document.querySelector('label[for="filterCompleted"]');

        if (allBtn) allBtn.textContent = `All (${allTasks.length})`;
        if (activeBtn) activeBtn.textContent = `Active (${activeTasks.length})`;
        if (completedBtn) completedBtn.textContent = `Completed (${completedTasks.length})`;
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.container');
        const existingAlerts = container.querySelector('.alert');
        
        if (existingAlerts) {
            container.insertBefore(alertDiv, existingAlerts.nextSibling);
        } else {
            const navbar = document.querySelector('nav');
            container.insertBefore(alertDiv, container.firstChild);
        }

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    async makeApiCall(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showAlert(error.message || 'An error occurred', 'error');
            throw error;
        }
    }
}

// Global functions for inline event handlers
function toggleTask(taskId) {
    const form = document.getElementById('toggleForm');
    form.action = `/toggle_task/${taskId}`;
    form.submit();
}

function editTask(taskId, description) {
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editDescription').value = description;
    
    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
}

async function saveTaskEdit() {
    const taskId = document.getElementById('editTaskId').value;
    const description = document.getElementById('editDescription').value.trim();
    
    if (!description) {
        taskManager.showAlert('Task description cannot be empty!', 'error');
        return;
    }

    try {
        await taskManager.makeApiCall(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify({ description })
        });
        
        // Reload the page to show updated task
        window.location.reload();
    } catch (error) {
        // Error already handled by makeApiCall
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        const form = document.getElementById('deleteForm');
        form.action = `/delete_task_form/${taskId}`;
        form.submit();
    }
}

// Initialize the task manager when DOM is loaded
let taskManager;
document.addEventListener('DOMContentLoaded', function() {
    taskManager = new TaskManager();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Alt + N to focus on new task description
        if (e.altKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            const descriptionField = document.getElementById('description');
            if (descriptionField) {
                descriptionField.focus();
            }
        }
        
        // Alt + F to focus on filter buttons
        if (e.altKey && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            const filterAll = document.getElementById('filterAll');
            if (filterAll) {
                filterAll.focus();
            }
        }
    });

    // Add tooltips to buttons
    const tooltips = [
        { selector: 'button[onclick*="editTask"]', title: 'Edit task (Alt+E)' },
        { selector: 'button[onclick*="deleteTask"]', title: 'Delete task (Alt+D)' },
        { selector: '.task-checkbox', title: 'Toggle completion status' }
    ];

    tooltips.forEach(({ selector, title }) => {
        document.querySelectorAll(selector).forEach(element => {
            element.setAttribute('title', title);
            element.setAttribute('data-bs-toggle', 'tooltip');
        });
    });

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// API helper functions for external integrations
window.SalesTrainingAPI = {
    async getTasks(status = 'all') {
        return await taskManager.makeApiCall(`/tasks?status=${status}`);
    },
    
    async createTask(description) {
        return await taskManager.makeApiCall('/tasks', {
            method: 'POST',
            body: JSON.stringify({ description })
        });
    },
    
    async updateTask(taskId, updates) {
        return await taskManager.makeApiCall(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },
    
    async deleteTask(taskId) {
        return await taskManager.makeApiCall(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
    },
    
    async getStatistics() {
        return await taskManager.makeApiCall('/api/stats');
    }
};
