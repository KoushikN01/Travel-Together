const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { generateItinerary } = require('../services/llmService');

// Initialize OpenAI with API key
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is not set. AI features will be disabled.');
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (error) {
  console.error('Error initializing OpenAI:', error);
}

// Sample destinations database
const destinations = [
  {
    destination: 'Paris',
    description: 'The city of lights and love, famous for the Eiffel Tower and world-class cuisine.',
    estimatedCost: '$1500',
    bestTimeToVisit: 'Spring',
    category: 'City'
  },
  {
    destination: 'Bali',
    description: 'Tropical paradise with beautiful beaches, lush rice terraces, and vibrant culture.',
    estimatedCost: '$1200',
    bestTimeToVisit: 'Summer',
    category: 'Beach'
  },
  {
    destination: 'Tokyo',
    description: 'A fascinating blend of traditional culture and cutting-edge technology.',
    estimatedCost: '$2000',
    bestTimeToVisit: 'Spring',
    category: 'City'
  },
  {
    destination: 'Santorini',
    description: 'Stunning Greek island with white-washed buildings and breathtaking sunsets.',
    estimatedCost: '$1800',
    bestTimeToVisit: 'Summer',
    category: 'Island'
  },
  {
    destination: 'Swiss Alps',
    description: 'Majestic mountain ranges perfect for skiing and hiking adventures.',
    estimatedCost: '$2500',
    bestTimeToVisit: 'Winter',
    category: 'Mountain'
  },
  {
    destination: 'Dubai',
    description: 'Ultra-modern city with luxury shopping, futuristic architecture, and desert adventures.',
    estimatedCost: '$2200',
    bestTimeToVisit: 'Winter',
    category: 'City'
  },
  {
    destination: 'Maldives',
    description: 'Pristine beaches, crystal-clear waters, and overwater bungalows.',
    estimatedCost: '$3000',
    bestTimeToVisit: 'Winter',
    category: 'Beach'
  },
  {
    destination: 'New York',
    description: 'The city that never sleeps, offering endless entertainment and cultural experiences.',
    estimatedCost: '$2000',
    bestTimeToVisit: 'Fall',
    category: 'City'
  },
  {
    destination: 'Kyoto',
    description: 'A historic Japanese city known for its ancient temples, traditional tea houses, and stunning autumn foliage.',
    estimatedCost: '$1800',
    bestTimeToVisit: 'Spring',
    category: 'Cultural'
    },
    
    {
    destination: 'Paris',
    description: 'The romantic capital of France, famous for its art, fashion, and the iconic Eiffel Tower.',
    destimatedCost: '$2200',
    bestTimeToVisit: 'Spring',
    category: 'City'
    },
    
    {
    destination: 'Santorini',
    description: 'A picturesque Greek island with whitewashed buildings, crystal-clear waters, and unforgettable sunsets.',
    destimatedCost: '$2500',
    bestTimeToVisit: 'Summer',
    category: 'Beach'
    },
    
    {
    destination: 'Banff',
    description: 'A breathtaking Canadian national park with turquoise lakes, snow-capped peaks, and wildlife adventures.',
    destimatedCost: '$1500',
    bestTimeToVisit: 'Summer',
    category: 'Nature'
    },
    
    {
    destination: 'Cape Town',
    description: 'A vibrant South African city with a mix of beaches, mountains, and rich cultural history.',
    destimatedCost: '$1700',
    bestTimeToVisit: 'Fall',
    category: 'Adventure'
    }
    
];

// POST /api/ai/recommendations (protected)
router.post('/recommendations', verifyToken, (req, res) => {
  // Get user preferences from request body
  const { budget, preferredSeason, category } = req.body;
  
  // Filter destinations based on preferences
  let recommendations = destinations;
  
  if (budget) {
    recommendations = recommendations.filter(dest => 
      parseInt(dest.estimatedCost.replace('$', '')) <= parseInt(budget)
    );
  }
  
  if (preferredSeason) {
    recommendations = recommendations.filter(dest => 
      dest.bestTimeToVisit.toLowerCase() === preferredSeason.toLowerCase()
    );
  }
  
  if (category) {
    recommendations = recommendations.filter(dest => 
      dest.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // If no preferences or no matches, return random 4 destinations
  if (!recommendations.length || (!budget && !preferredSeason && !category)) {
    recommendations = destinations
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }

  res.json({
    recommendations: recommendations
  });
});

// Chat endpoint (protected)
router.post('/ask-ai', verifyToken, async (req, res) => {
  try {
    const { prompt, conversationHistory } = req.body;

    // Prepare conversation history for OpenAI
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful travel assistant. Provide detailed, accurate, and engaging responses about travel-related topics. Always maintain context from previous messages and ask follow-up questions to better assist the user.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: prompt
      }
    ];

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    // Send response
    res.json({
      result: completion.data.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request'
    });
  }
});

// Travel Matcher endpoint
router.post('/travel-match', async (req, res) => {
  try {
    const { userId, fromLocation, toLocation, travelDate, preferences } = req.body;

    // Validate required fields
    if (!fromLocation || !toLocation || !travelDate) {
      return res.status(400).json({ error: 'From location, to location, and travel date are required' });
    }

    // Get all users except current user
    const allUsers = await User.find({ _id: { $ne: userId } })
      .select('name email avatar preferences')
      .limit(20); // Show up to 20 users

    if (!allUsers || allUsers.length === 0) {
      return res.json({
        matches: [],
        message: 'No other users found in the system.'
      });
    }

    // Helper: Calculate compatibility score between two sets of preferences
    function calculateCompatibility(userPrefs, matchPrefs) {
      let score = 0;
      if (!userPrefs || !matchPrefs) return score;
      // Travel style
      if (userPrefs.travelStyle && matchPrefs.travelStyle && userPrefs.travelStyle === matchPrefs.travelStyle) {
        score += 20;
      }
      // Budget (within 20% range)
      if (userPrefs.budget && matchPrefs.budget) {
        const userBudget = parseInt(userPrefs.budget);
        const matchBudget = parseInt(matchPrefs.budget);
        if (!isNaN(userBudget) && !isNaN(matchBudget)) {
          const diff = Math.abs(userBudget - matchBudget);
          const avg = (userBudget + matchBudget) / 2;
          if (diff / avg <= 0.2) score += 15;
        }
      }
      // Accommodation
      if (userPrefs.accommodation && matchPrefs.accommodation && userPrefs.accommodation === matchPrefs.accommodation) {
        score += 10;
      }
      // Interests (overlap)
      if (Array.isArray(userPrefs.interests) && Array.isArray(matchPrefs.interests)) {
        const overlap = userPrefs.interests.filter(i => matchPrefs.interests.includes(i));
        score += overlap.length * 5;
      }
      return score;
    }

    // Format all users as potential matches with compatibility score
    const matches = allUsers.map(user => {
      const userPrefs = user.preferences || {};
      const matchPrefs = preferences || {};
      const compatibilityScore = calculateCompatibility(userPrefs, matchPrefs);
      return {
        tripId: null,
        tripDetails: {
          route: { from: fromLocation, to: toLocation },
          date: travelDate,
          duration: 'Not specified'
        },
        participants: [{
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || 'https://via.placeholder.com/150',
          preferences: user.preferences || {
            travelStyle: 'Not specified',
            interests: ['Not specified'],
            budget: 'Not specified',
            accommodation: 'Not specified'
          }
        }],
        compatibilityScore
      };
    });

    // Sort matches by compatibilityScore descending
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      matches,
      message: `Found ${matches.length} potential travel companions!`
    });

  } catch (error) {
    console.error('Travel match error:', error);
    res.status(500).json({ error: 'Failed to find travel matches. Please try again.' });
  }
});

// POST /api/ai/itinerary (public)
router.post('/itinerary', async (req, res) => {
  const { destination, days, interests, budget, groupSize } = req.body;
  const prompt = `Generate a ${days}-day travel itinerary for ${destination} for ${groupSize} people interested in ${interests && interests.length ? interests.join(', ') : 'various activities'}. Budget: ${budget}. Include morning, afternoon, and evening activities for each day, with restaurant suggestions and local events if possible. Output as JSON.`;

  try {
    const aiResponse = await generateItinerary(prompt);
    res.json(aiResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate itinerary', details: error.message });
  }
});

module.exports = router; 