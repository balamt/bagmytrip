# Bag My Trip - AI-Powered Travel Planner

An intelligent travel planning application that leverages Google AI technologies to create personalized, end-to-end itineraries.

## Features

- 🤖 AI-powered trip planning using Google Gemini
- 🗺️ Google Maps integration for location services
- 💰 Budget optimization and cost breakdown
- 🎯 Personalized recommendations based on interests
- 📱 Responsive web interface
- 🔒 Secure user authentication

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 with modern design

### Backend
- Node.js with Express
- Google AI Gemini integration
- Google Maps Platform
- JWT authentication
- CORS enabled

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI API key
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bagmytrip
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in backend folder
   - Add your Google AI API key and Google Maps API key

4. Start the development servers:
```bash
npm run dev
```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

## Project Structure

```
bagmytrip/
├── frontend/          # React frontend application
├── backend/           # Node.js Express backend
├── requirements/      # Project requirements and documentation
└── package.json       # Root package.json for scripts
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/trips/plan` - Generate trip plan with AI
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip

## Environment Variables

Backend `.env` file:
```
GOOGLE_AI_API_KEY=your_google_ai_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.