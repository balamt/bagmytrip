const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// In-memory user storage (replace with database in production)
let users = [];
let nextUserId = 1;

// Create demo user for testing
const createDemoUser = async () => {
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = {
    id: nextUserId++,
    name: 'Demo User',
    email: 'demo@bagmytrip.com',
    password: demoPassword,
    preferences: {
      travelStyle: 'comfortable',
      budget: 'moderate',
      interests: ['culture', 'food', 'sightseeing']
    },
    createdAt: new Date().toISOString(),
    trips: []
  };
  users.push(demoUser);
  console.log('Demo user created: demo@bagmytrip.com / demo123');
};

// Initialize demo user
createDemoUser();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, preferences } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: nextUserId++,
      name,
      email,
      password: hashedPassword,
      preferences: preferences || {},
      createdAt: new Date().toISOString(),
      trips: []
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser.id);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get user profile endpoint
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = users.find(user => user.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const userIndex = users.findIndex(user => user.id === decoded.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update preferences
    users[userIndex].preferences = { ...users[userIndex].preferences, ...req.body };
    users[userIndex].updatedAt = new Date().toISOString();

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ 
      message: 'Preferences updated successfully',
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;