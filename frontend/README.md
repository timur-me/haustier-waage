# 🐾 Pet Weight Monitor Frontend

The frontend application for the Pet Weight Monitoring System, built with Angular 17.

## 🌟 Features

- 🎨 Modern UI with Tailwind CSS
- 📊 Interactive weight charts with Chart.js
- 🔐 JWT authentication
- 📱 Fully responsive design
- ⚡ Standalone components
- 🔄 Real-time updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Angular CLI 17+

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4200`.

## 📦 Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

- Run unit tests: `npm test`
- Run end-to-end tests: `npm run e2e`
- Generate test coverage report: `npm run test:coverage`

## 📁 Project Structure

```
src/
├── app/
│   ├── components/     # Standalone components
│   ├── guards/         # Route guards
│   ├── interceptors/   # HTTP interceptors
│   ├── models/         # TypeScript interfaces
│   ├── services/       # API services
│   └── app.config.ts   # App configuration
├── assets/            # Static assets
└── environments/      # Environment configurations
```

## 🎨 Styling

- Tailwind CSS for utility-first styling
- Custom components follow Tailwind design patterns
- Responsive design breakpoints
- Dark mode support (planned)

## 📚 Dependencies

- Angular 17.3.0
- Chart.js 4.4.1
- ng2-charts 5.0.4
- Tailwind CSS 3.4.1

## 🔧 Configuration

The application can be configured through:

- `environment.ts` for development
- `environment.prod.ts` for production

Key configuration options:

- API URL
- Authentication settings
- Feature flags

## 🚀 Deployment

1. Build for production:

   ```bash
   npm run build --prod
   ```

2. The `dist/` directory will contain the built application ready for deployment.

3. Deploy to your hosting service of choice (e.g., Nginx, Apache, or cloud hosting).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
