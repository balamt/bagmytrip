# Bag My Trip - Setup Instructions

## Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager
- Google AI API key (Gemini)
- Google Maps API key (optional for enhanced features)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd bagmytrip

# Install all dependencies (frontend + backend)
npm run install-all
```

### 2. Environment Configuration

#### Backend Configuration
1. Navigate to the `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Edit `.env` file and add your API keys:
   ```
   GOOGLE_AI_API_KEY=your_actual_google_ai_api_key_here
   GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   JWT_SECRET=your_secure_jwt_secret
   ```

### 3. Start the Development Servers

From the root directory:
```bash
# Start both frontend and backend simultaneously
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000 (React app)
- **Backend**: http://localhost:5000 (Express API)

### 4. Alternative: Start Servers Separately

#### Start Backend Only:
```bash
npm run server
```

#### Start Frontend Only:
```bash
npm run client
```

## Getting API Keys

### Google AI (Gemini) API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key and paste it in your `.env` file

### Google Maps API Key (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Copy the key and paste it in your `.env` file

## Testing the Application

### Demo Login
Use the following credentials to test the app:
- **Email**: demo@bagmytrip.com
- **Password**: demo123

Or click the "Try Demo Login" button on the login page.

### Basic Workflow
1. **Home Page**: Landing page with features overview
2. **Sign Up/Login**: Create account or use demo credentials
3. **Plan Trip**: Multi-step trip planning wizard
4. **AI Chat**: Interactive chat with AI assistant
5. **Itinerary**: View generated trip itinerary

## Features Available

✅ **Completed Features:**
- User authentication (register/login)
- Multi-step trip planning wizard
- AI-powered trip generation with Google Gemini
- Interactive chat interface
- Itinerary display with day-by-day breakdown
- Cost breakdown and budget tracking
- Responsive design for mobile/desktop

🚧 **In Development:**
- Google Maps integration
- Real-time booking integration
- Visa assistance module
- Advanced packing recommendations
- Social features and trip sharing

## Troubleshooting

### Common Issues

**1. API Key Errors**
- Make sure your Google AI API key is valid and active
- Check that you've copied the key correctly to the `.env` file
- Restart the backend server after updating environment variables

**2. CORS Errors**
- Ensure frontend is running on port 3000
- Check that FRONTEND_URL in backend `.env` matches your frontend URL

**3. Module Not Found Errors**
- Run `npm run install-all` from the root directory
- Try deleting `node_modules` and `package-lock.json`, then reinstall

**4. Port Already in Use**
- Change the PORT in backend `.env` file
- Kill any processes using ports 3000 or 5000

### Development Tips

- **Hot Reload**: Both frontend and backend support hot reload during development
- **API Testing**: Use tools like Postman to test API endpoints at `http://localhost:5000/api/`
- **Logs**: Check browser console and terminal for error messages
- **Database**: Currently using in-memory storage; data resets on server restart

## Production Deployment

For production deployment:

1. **Build Frontend**:
   ```bash
   npm run build
   ```

2. **Environment Variables**:
   - Set `NODE_ENV=production`
   - Use secure JWT secrets
   - Configure proper CORS settings

3. **Database**:
   - Replace in-memory storage with persistent database (MongoDB/PostgreSQL)
   - Update connection strings in environment variables

## Support

For issues or questions:
- Check the troubleshooting section above
- Review API documentation in the backend routes
- Ensure all prerequisites are met
- Verify environment configuration

---

**Happy Travel Planning! 🎒✈️**