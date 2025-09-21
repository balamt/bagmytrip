const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

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

// Generate trip plan with AI
router.post('/generate-trip', verifyToken, async (req, res) => {
  try {
    const { destination, budget, duration, interests, travelStyle, groupSize, additionalRequirements } = req.body;

    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(503).json({ 
        error: 'Google AI service not configured',
        message: 'Please set GOOGLE_AI_API_KEY in environment variables'
      });
    }

    // Validation
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    // Create the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Build the prompt
    const prompt = `Create a detailed travel itinerary for the following trip:

Destination: ${destination}
Budget: ${budget || 'Moderate'}
Duration: ${duration || 'Short trip (4-7 days)'}
Interests: ${interests?.join(', ') || 'General sightseeing'}
Travel Style: ${travelStyle || 'Comfortable'}
Group Size: ${groupSize || 'Solo traveler'}
Additional Requirements: ${additionalRequirements || 'None'}

Please provide a comprehensive itinerary that includes:
1. Day-by-day breakdown of activities
2. Recommended accommodations
3. Transportation options
4. Estimated costs for each activity
5. Local food recommendations
6. Cultural insights and tips
7. Weather considerations
8. Packing suggestions
9. Safety tips

Format the response as a JSON object with the following structure:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00",
          "activity": "Activity name",
          "location": "Location name",
          "description": "Activity description",
          "estimatedCost": 1000,
          "type": "sightseeing|food|transport|accommodation|shopping|activity"
        }
      ]
    }
  ],
  "accommodation": {
    "recommendations": [
      {
        "name": "Hotel name",
        "type": "budget|mid-range|luxury",
        "estimatedCost": 3000,
        "description": "Hotel description"
      }
    ]
  },
  "transportation": {
    "toDestination": "Transportation advice to reach destination",
    "local": "Local transportation options",
    "estimatedCost": 5000
  },
  "foodRecommendations": [
    {
      "name": "Restaurant/Dish name",
      "type": "street food|restaurant|local specialty",
      "estimatedCost": 500,
      "description": "Food description"
    }
  ],
  "culturalInsights": [
    "Cultural tip 1",
    "Cultural tip 2"
  ],
  "packingList": [
    "Item 1",
    "Item 2"
  ],
  "safetyTips": [
    "Safety tip 1",
    "Safety tip 2"
  ],
  "totalEstimatedCost": 25000,
  "bestTimeToVisit": "Best time information",
  "weatherConsiderations": "Weather information"
}

Please ensure all costs are in Indian Rupees (INR) and the itinerary is practical and realistic.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let parsedItinerary;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedItinerary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // If JSON parsing fails, return a structured response with the raw text
      parsedItinerary = {
        itinerary: [],
        rawResponse: text,
        error: 'Could not parse structured response',
        message: 'AI generated a response but it could not be parsed as structured data'
      };
    }

    res.json({
      success: true,
      data: parsedItinerary,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI generation error:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(503).json({ 
        error: 'Google AI API key issue',
        message: 'Please check your Google AI API key configuration'
      });
    }

    res.status(500).json({ 
      error: 'AI generation failed',
      message: 'Failed to generate trip itinerary with AI',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Chat with AI assistant
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(503).json({ 
        error: 'Google AI service not configured',
        message: 'Please set GOOGLE_AI_API_KEY in environment variables'
      });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Build context-aware prompt
    const contextPrompt = context ? `Context: ${JSON.stringify(context)}\n\n` : '';
    const systemPrompt = `You are a helpful AI travel assistant for "Bag My Trip" application. 
You help users plan their trips, answer travel-related questions, and provide personalized recommendations.
Always be friendly, informative, and helpful. Provide practical advice and specific recommendations when possible.

${contextPrompt}User message: ${message}

Please provide a helpful and engaging response:`;

    // Generate content
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chat error:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(503).json({ 
        error: 'Google AI API key issue',
        message: 'Please check your Google AI API key configuration'
      });
    }

    res.status(500).json({ 
      error: 'AI chat failed',
      message: 'Failed to get response from AI assistant',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get travel insights for a destination
router.post('/insights', verifyToken, async (req, res) => {
  try {
    const { destination } = req.body;

    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(503).json({ 
        error: 'Google AI service not configured',
        message: 'Please set GOOGLE_AI_API_KEY in environment variables'
      });
    }

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    // Create the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Provide travel insights for ${destination}. Include:
1. Best time to visit
2. Weather patterns
3. Cultural highlights
4. Must-visit attractions
5. Local customs and etiquette
6. Safety considerations
7. Budget estimates
8. Transportation options
9. Food specialties
10. Hidden gems and local secrets

Format as a comprehensive travel guide with practical information.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      destination,
      insights: text,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI insights error:', error);
    
    res.status(500).json({ 
      error: 'Failed to get travel insights',
      message: 'Could not generate travel insights for the destination',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;