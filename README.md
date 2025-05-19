# 🐾 Pet Weight Monitoring System

A modern, full-stack application for tracking pet weights and health over time. Built with FastAPI and Angular.

## 🌟 Features

- 🔐 Secure user authentication with JWT tokens
- 🐈 Pet management (add, update, delete pets)
- ⚖️ Weight tracking with history
- 📊 Interactive weight trend visualization
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
  - `/users`: User management
  - `/media`: Handling media uploads

### Frontend (Angular)

The frontend is built with Angular 17, offering a modern and responsive user interface.

#### Key Features:

- Tailwind CSS for styling
- Chart.js for data visualization
- Standalone components
- Type-safe API integration
- Real-time updates

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Node.js 18+
- npm/yarn
- Git

### Backend Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd haustier-waage
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   .venv\\Scripts\\activate.ps1   # Windows
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and settings
   ```

5. Run database migrations:

   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:4200`

## 📚 API Documentation

When the backend is running, access the API documentation at:

- Swagger UI: `http://localhost:8000/docs`

## 🔒 Security Features

- JWT token authentication
- Password hashing
- CORS protection
- Rate limiting
- Input validation
- SQL injection protection

## 🎯 Future Improvements

1. **Backend**:

   - Add user registration ✅
   - Implement password reset ✅
   - Add email notifications 
   - Enhance rate limiting
   - Add caching layer

2. **Frontend**:
   - Add offline support
   - Add data export feature
   - Enhance visualization options
   - Add pet photo support ✅

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
