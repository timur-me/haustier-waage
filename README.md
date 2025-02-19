# 🐾 Pet Weight Monitoring System

A modern, full-stack application for tracking pet weights and health over time.

## 🌟 Features

- 🔐 Secure user authentication with JWT tokens
- 🐈 Pet management (add, update, delete pets)
- ⚖️ Weight tracking with history
- 📊 Weight trend visualization
- 🔄 Real-time updates
- 📱 Responsive design

## 🏗️ Architecture

### Backend (FastAPI)

The backend is built with FastAPI, providing a robust and high-performance REST API.

#### Key Components:

- **Authentication Service**: JWT-based authentication with token refresh
- **Database Layer**: PostgreSQL with SQLAlchemy ORM
- **API Endpoints**:
  - `/auth`: User authentication
  - `/animals`: Pet management
  - `/weights`: Weight tracking

#### Technical Highlights:

- Type-safe with Python type hints
- Comprehensive test suite (27 tests)
- Modular architecture
- Database migrations with Alembic
- Environment-based configuration

### Frontend (Angular)

The frontend is built with Angular, offering a modern and responsive user interface.

#### Key Features:

- Material-UI components
- Redux state management
- Responsive design
- Interactive weight charts
- Real-time updates

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL
- Node.js 14+
- npm/yarn

### Backend Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\\Scripts\\activate   # Windows
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:

   ```bash
   alembic upgrade head
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
pytest
```

Test coverage includes:

- Authentication flows
- Pet management operations
- Weight tracking functionality
- Error handling
- Authorization checks

## 📚 API Documentation

API documentation is available at `/docs` when running the server:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔒 Security Features

- JWT token authentication
- Password hashing
- CORS protection
- Rate limiting
- Input validation
- SQL injection protection
