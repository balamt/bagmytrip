const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory trip storage (replace with database in production)
let trips = [];
let nextTripId = 1;

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create new trip
router.post('/create', verifyToken, (req, res) => {
  try {
    const { destination, budget, duration, interests, travelStyle, groupSize, preferences } = req.body;

    // Validation
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    // Create new trip
    const newTrip = {
      id: nextTripId++,
      userId: req.userId,
      destination,
      budget: budget || 'moderate',
      duration: duration || 'short',
      interests: interests || [],
      travelStyle: travelStyle || 'comfortable',
      groupSize: groupSize || 'solo',
      preferences: preferences || {},
      status: 'planning',
      itinerary: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    trips.push(newTrip);

    res.status(201).json({
      message: 'Trip created successfully',
      trip: newTrip
    });

  } catch (error) {
    console.error('Trip creation error:', error);
    res.status(500).json({ error: 'Internal server error during trip creation' });
  }
});

// Get user's trips
router.get('/', verifyToken, (req, res) => {
  try {
    const userTrips = trips.filter(trip => trip.userId === req.userId);
    res.json({ trips: userTrips });

  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Internal server error while fetching trips' });
  }
});

// Get specific trip
router.get('/:id', verifyToken, (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    const trip = trips.find(trip => trip.id === tripId && trip.userId === req.userId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ trip });

  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Internal server error while fetching trip' });
  }
});

// Update trip
router.put('/:id', verifyToken, (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    const tripIndex = trips.findIndex(trip => trip.id === tripId && trip.userId === req.userId);

    if (tripIndex === -1) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Update trip
    trips[tripIndex] = {
      ...trips[tripIndex],
      ...req.body,
      id: tripId, // Ensure ID doesn't change
      userId: req.userId, // Ensure userId doesn't change
      updatedAt: new Date().toISOString()
    };

    res.json({
      message: 'Trip updated successfully',
      trip: trips[tripIndex]
    });

  } catch (error) {
    console.error('Trip update error:', error);
    res.status(500).json({ error: 'Internal server error during trip update' });
  }
});

// Delete trip
router.delete('/:id', verifyToken, (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    const tripIndex = trips.findIndex(trip => trip.id === tripId && trip.userId === req.userId);

    if (tripIndex === -1) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Remove trip
    trips.splice(tripIndex, 1);

    res.json({ message: 'Trip deleted successfully' });

  } catch (error) {
    console.error('Trip deletion error:', error);
    res.status(500).json({ error: 'Internal server error during trip deletion' });
  }
});

// Add itinerary item
router.post('/:id/itinerary', verifyToken, (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    const tripIndex = trips.findIndex(trip => trip.id === tripId && trip.userId === req.userId);

    if (tripIndex === -1) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { day, time, activity, location, description, cost, type } = req.body;

    if (!day || !activity) {
      return res.status(400).json({ error: 'Day and activity are required' });
    }

    const itineraryItem = {
      id: Date.now(),
      day,
      time: time || '09:00',
      activity,
      location: location || '',
      description: description || '',
      cost: cost || 0,
      type: type || 'activity', // activity, meal, transport, accommodation
      createdAt: new Date().toISOString()
    };

    trips[tripIndex].itinerary.push(itineraryItem);
    trips[tripIndex].updatedAt = new Date().toISOString();

    res.status(201).json({
      message: 'Itinerary item added successfully',
      item: itineraryItem,
      trip: trips[tripIndex]
    });

  } catch (error) {
    console.error('Add itinerary item error:', error);
    res.status(500).json({ error: 'Internal server error while adding itinerary item' });
  }
});

// Update itinerary item
router.put('/:id/itinerary/:itemId', verifyToken, (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    const itemId = parseInt(req.params.itemId);
    const tripIndex = trips.findIndex(trip => trip.id === tripId && trip.userId === req.userId);

    if (tripIndex === -1) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const itemIndex = trips[tripIndex].itinerary.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Itinerary item not found' });
    }

    // Update itinerary item
    trips[tripIndex].itinerary[itemIndex] = {
      ...trips[tripIndex].itinerary[itemIndex],
      ...req.body,
      id: itemId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    trips[tripIndex].updatedAt = new Date().toISOString();

    res.json({
      message: 'Itinerary item updated successfully',
      item: trips[tripIndex].itinerary[itemIndex],
      trip: trips[tripIndex]
    });

  } catch (error) {
    console.error('Update itinerary item error:', error);
    res.status(500).json({ error: 'Internal server error while updating itinerary item' });
  }
});

module.exports = router;