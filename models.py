from datetime import datetime
from typing import List, Dict, Optional
import json

class Task:
    def __init__(self, id: int, description: str, completed: bool = False, created_at: Optional[datetime] = None):
        self.id = id
        self.description = description
        self.completed = completed
        self.created_at = created_at or datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def update(self, description: Optional[str] = None, completed: Optional[bool] = None):
        if description is not None:
            self.description = description
        if completed is not None:
            self.completed = completed
        self.updated_at = datetime.now()

class TaskManager:
    def __init__(self):
        self.tasks: Dict[int, Task] = {}
        self.next_id = 1
    
    def create_task(self, description: str) -> Task:
        task = Task(self.next_id, description)
        self.tasks[self.next_id] = task
        self.next_id += 1
        return task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        return self.tasks.get(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        return list(self.tasks.values())
    
    def get_tasks_by_status(self, completed: Optional[bool] = None) -> List[Task]:
        if completed is None:
            return self.get_all_tasks()
        return [task for task in self.tasks.values() if task.completed == completed]
    
    def update_task(self, task_id: int, description: Optional[str] = None, completed: Optional[bool] = None) -> Optional[Task]:
        task = self.get_task(task_id)
        if task:
            task.update(description, completed)
            return task
        return None
    
    def delete_task(self, task_id: int) -> bool:
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False
    
    def get_statistics(self) -> Dict:
        total = len(self.tasks)
        completed = len([t for t in self.tasks.values() if t.completed])
        active = total - completed
        return {
            'total': total,
            'completed': completed,
            'active': active,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 1)
        }

# Global task manager instance
task_manager = TaskManager()
