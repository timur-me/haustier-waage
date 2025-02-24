# 🐾 Haustier Waage (Pet Scale)

A modern, full-stack application for tracking pet weights and health, featuring real-time updates and beautiful visualizations.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/frontend-Angular-DD0031.svg)](https://angular.io/)
[![Database](https://img.shields.io/badge/database-PostgreSQL-336791.svg)](https://www.postgresql.org/)

## ✨ Features

- **🔐 Secure Authentication**

  - Email verification
  - JWT-based authentication
  - Password reset functionality
  - Rate limiting protection

- **🐈 Pet Management**

  - Multiple pets per user
  - Pet profiles with images
  - Species and breed tracking
  - Birth date tracking

- **⚖️ Weight Tracking**

  - Real-time weight updates
  - Weight history visualization
  - Trend analysis
  - CSV/JSON export

- **📱 Modern UI/UX**
  - Responsive design
  - Dark mode support
  - Real-time updates via WebSocket
  - Interactive charts
  - Mobile-friendly interface

## 🛠️ Technology Stack

### Backend

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [PostgreSQL](https://www.postgresql.org/) - Robust database
- [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and ORM
- [Pydantic](https://pydantic-docs.helpmanual.io/) - Data validation
- [JWT](https://jwt.io/) - Authentication
- [WebSocket](https://websockets.readthedocs.io/) - Real-time updates

### Frontend

- [Angular](https://angular.io/) - Progressive web framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [RxJS](https://rxjs.dev/) - Reactive programming
- [NgRx](https://ngrx.io/) - State management

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/petscale.git
   cd petscale
   ```

2. Create and activate virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize database:

   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm start
   ```

4. Open browser at `http://localhost:4200`

## 🌍 Production Deployment

For detailed deployment instructions, see [Deployment Guide](docs/Deployment.md).

Key steps:

1. Set up Ubuntu server
2. Configure PostgreSQL
3. Set up Nginx with SSL
4. Deploy backend with systemd
5. Build and deploy frontend
6. Configure monitoring

## 📚 API Documentation

API documentation is available at `/docs` when running the backend server.

For detailed API documentation, see [API Documentation](docs/API-Documentation.md).

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/
```

### Frontend Tests

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/petscale

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=https://pet.executable.fun
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/Contributing.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

Report bugs by creating an issue with:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Screenshots if applicable
- Environment details

## 🎉 Acknowledgments

- All contributors who have helped this project grow
- The amazing open source community
- Our dedicated users who provide valuable feedback

## 📞 Support

- Create an issue for bugs
- Join our Discord community
- Check the [FAQ](docs/FAQ.md)
- Email support: support@pet.executable.fun
