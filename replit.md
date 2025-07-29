# Sales Team Training Platform

## Overview

This is a Flask-based task management application designed for sales team training. The application provides a web interface for managing tasks with features including task creation, status tracking, and filtering capabilities. It uses an in-memory data store with a simple RESTful API architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Application Structure**: Modular design with separate files for routes, models, and application configuration
- **Data Storage**: In-memory storage using Python classes and dictionaries
- **API Design**: RESTful endpoints for task management operations
- **Session Management**: Flask's built-in session handling with configurable secret key

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default templating system)
- **CSS Framework**: Bootstrap 5 for responsive UI components
- **Icons**: Font Awesome for consistent iconography
- **JavaScript**: Vanilla JavaScript for client-side interactions and filtering

## Key Components

### Core Models (`models.py`)
- **Task Class**: Represents individual tasks with properties for ID, description, completion status, and timestamps
- **TaskManager Class**: Handles all task operations including creation, retrieval, and status filtering
- **Data Structure**: Dictionary-based storage with auto-incrementing ID system

### Route Handlers (`routes.py`)
- **Dashboard Route** (`/`): Renders the main interface with task list and statistics
- **API Endpoints**:
  - `GET /tasks`: Retrieves tasks with optional status filtering
  - `POST /tasks`: Creates new tasks with validation

### Frontend Components
- **Base Template**: Provides consistent navigation and layout structure
- **Dashboard Interface**: Displays task statistics cards and task management interface
- **Client-side Filtering**: JavaScript-powered task filtering without page refresh

## Data Flow

1. **Task Creation**: User submits task through web form → Flask route validates input → TaskManager creates Task object → Response with task data
2. **Task Retrieval**: Dashboard loads → Route fetches all tasks from TaskManager → Template renders task list with statistics
3. **Filtering**: User selects filter → JavaScript hides/shows tasks based on status → No server round-trip required

## External Dependencies

### Python Packages
- **Flask**: Core web framework
- **Werkzeug**: WSGI utilities (ProxyFix middleware for deployment)

### Frontend Libraries (CDN-based)
- **Bootstrap 5**: UI framework for responsive design
- **Font Awesome 6**: Icon library for visual consistency

### Development Dependencies
- **Logging**: Built-in Python logging for debugging and monitoring

## Deployment Strategy

### Current Configuration
- **Host**: Configured to run on all interfaces (0.0.0.0)
- **Port**: Default port 5000
- **Debug Mode**: Enabled for development
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies

### Environment Variables
- **SESSION_SECRET**: Configurable secret key for session management (defaults to development key)

### Scalability Considerations
- **Data Storage**: Currently uses in-memory storage which will not persist across restarts
- **Stateless Design**: Application logic is stateless, making it suitable for horizontal scaling once persistent storage is added
- **Database Migration Path**: The TaskManager abstraction makes it easy to swap in database persistence later

## Notes

The application currently lacks persistent storage and would benefit from database integration (such as PostgreSQL with Drizzle ORM) for production use. The current in-memory storage is suitable for development and demonstration purposes but data will be lost when the application restarts.