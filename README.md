# FitLife Gym Management System

A comprehensive fitness and gym management platform built with React, Node.js, and SQLite.

## 🌟 Key Features That Drive User Engagement

### 💪 Membership Value Proposition
- **Tiered Membership System**: Basic ($5), Premium ($10), VIP ($20) with clear value progression
- **Exclusive Member Perks**: Free personal training, nutrition workshops, spa services, member events
- **Progress Tracking**: Visual workout and diet progress with achievement badges
- **Smart Scheduling**: AI-powered class recommendations based on user preferences and goals

### 🎯 Compelling User Benefits
- **Personalized Experience**: Custom workout and diet plans based on fitness goals
- **Community Features**: Member testimonials, success stories, and social engagement
- **Expert Guidance**: Access to certified trainers and nutritionists
- **Convenience**: 24/7 app access, easy booking, and progress monitoring

## 🏗️ Project Structure

```
fitlife-gym/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/         # React context providers
│   │   └── main.tsx         # Application entry point
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── backend/                  # Node.js backend API
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   ├── database/            # Database configuration and models
│   ├── package.json         # Backend dependencies
│   └── server.js            # Server entry point
├── package.json             # Root package.json for scripts
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitlife-gym
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

### Building for Production
```bash
npm run build
```

## 📊 Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and membership information
- `instructors` - Fitness instructors and their specializations
- `classes` - Fitness classes and their details
- `class_schedules` - Class scheduling and availability
- `bookings` - User class bookings
- `workout_plans` - Predefined workout routines
- `diet_plans` - Nutrition and meal plans
- `user_workout_progress` - User workout completion tracking
- `user_diet_progress` - User diet plan progress

## 🎨 UI/UX Features

### Landing Page
- Compelling hero section with clear value proposition
- Feature highlights with icons and descriptions
- Membership pricing tiers with benefit comparisons
- Customer testimonials and success stories
- Call-to-action buttons for registration

### Member Dashboard
- Personalized workout and diet recommendations
- Progress tracking with visual charts
- Upcoming class bookings and schedules
- Membership benefits and usage statistics
- Achievement badges and milestones

### Membership Management
- Detailed membership benefits breakdown
- Usage statistics and remaining benefits
- Upgrade options with clear value propositions
- Exclusive member perks and events
- Billing history and payment management

## 🔐 Authentication & Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables
# Deploy with your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@fitlifegym.com or join our community Discord server.

---

**Built with ❤️ for the fitness community**