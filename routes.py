from flask import render_template, request, jsonify, redirect, url_for, flash
from app import app
from models import task_manager
import logging

@app.route('/')
def index():
    """Main dashboard page"""
    tasks = task_manager.get_all_tasks()
    stats = task_manager.get_statistics()
    return render_template('index.html', tasks=tasks, stats=stats)

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """API endpoint to get tasks with optional filtering"""
    status = request.args.get('status', 'all')
    
    if status == 'completed':
        tasks = task_manager.get_tasks_by_status(True)
    elif status == 'active':
        tasks = task_manager.get_tasks_by_status(False)
    else:
        tasks = task_manager.get_all_tasks()
    
    return jsonify({
        'tasks': [task.to_dict() for task in tasks],
        'count': len(tasks)
    })

@app.route('/tasks', methods=['POST'])
def create_task():
    """API endpoint to create a new task"""
    try:
        data = request.get_json()
        if not data or 'description' not in data:
            return jsonify({'error': 'Description is required'}), 400
        
        description = data['description'].strip()
        if not description:
            return jsonify({'error': 'Description cannot be empty'}), 400
        
        task = task_manager.create_task(description)
        return jsonify({
            'message': 'Task created successfully',
            'task': task.to_dict()
        }), 201
    
    except Exception as e:
        logging.error(f"Error creating task: {e}")
        return jsonify({'error': 'Failed to create task'}), 500

@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """API endpoint to get a specific task"""
    task = task_manager.get_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify({'task': task.to_dict()})

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """API endpoint to update a task"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data is required'}), 400
        
        description = data.get('description')
        completed = data.get('completed')
        
        if description is not None:
            description = description.strip()
            if not description:
                return jsonify({'error': 'Description cannot be empty'}), 400
        
        task = task_manager.update_task(task_id, description, completed)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({
            'message': 'Task updated successfully',
            'task': task.to_dict()
        })
    
    except Exception as e:
        logging.error(f"Error updating task {task_id}: {e}")
        return jsonify({'error': 'Failed to update task'}), 500

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """API endpoint to delete a task"""
    try:
        if task_manager.delete_task(task_id):
            return jsonify({'message': 'Task deleted successfully'})
        else:
            return jsonify({'error': 'Task not found'}), 404
    
    except Exception as e:
        logging.error(f"Error deleting task {task_id}: {e}")
        return jsonify({'error': 'Failed to delete task'}), 500

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """API endpoint to get task statistics"""
    stats = task_manager.get_statistics()
    return jsonify(stats)

# Web form handlers for non-API usage
@app.route('/add_task', methods=['POST'])
def add_task_form():
    """Form handler for adding tasks"""
    description = request.form.get('description', '').strip()
    if description:
        task_manager.create_task(description)
        flash('Task added successfully!', 'success')
    else:
        flash('Task description is required!', 'error')
    
    return redirect(url_for('index'))

@app.route('/toggle_task/<int:task_id>', methods=['POST'])
def toggle_task(task_id):
    """Form handler for toggling task completion"""
    task = task_manager.get_task(task_id)
    if task:
        task_manager.update_task(task_id, completed=not task.completed)
        status = 'completed' if not task.completed else 'active'
        flash(f'Task marked as {status}!', 'success')
    else:
        flash('Task not found!', 'error')
    
    return redirect(url_for('index'))

@app.route('/delete_task_form/<int:task_id>', methods=['POST'])
def delete_task_form(task_id):
    """Form handler for deleting tasks"""
    if task_manager.delete_task(task_id):
        flash('Task deleted successfully!', 'success')
    else:
        flash('Task not found!', 'error')
    
    return redirect(url_for('index'))

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500
