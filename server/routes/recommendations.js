const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');
const Trip = require('../models/Trip');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' }); // Load environment variables

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Image mapping for recommendations
const recommendationImages = {
  'Activity': [
    '/loaclattractions.jpeg',
    '/localcausine.jpeg',
    'https://source.unsplash.com/random/300x200/?activity'
  ],
  'Restaurant': [
    '/popular local restarunts.jpeg',
    '/popular restarunts.jpeg',
    'https://source.unsplash.com/random/300x200/?restaurant'
  ],
  'Accommodation': [
    '/comfortaable.jpeg',
    'https://source.unsplash.com/random/300x200/?hotel'
  ]
};

const getRandomImage = (category) => {
  const images = recommendationImages[category];
  if (images && images.length > 0) {
    return images[Math.floor(Math.random() * images.length)];
  }
  return 'https://source.unsplash.com/random/300x200/?travel'; // Fallback image
};

// Helper functions (these were previously in recommendationService.js client-side)
const getWeatherBasedActivities = (weather) => {
  const activities = {
    sunny: [
      'Beach activities',
      'Outdoor sports',
      'Hiking',
      'Sightseeing',
      'Outdoor dining'
    ],
    rainy: [
      'Museum visits',
      'Indoor shopping',
      'Spa treatments',
      'Indoor dining',
      'Theater shows'
    ],
    cloudy: [
      'City tours',
      'Shopping',
      'Café hopping',
      'Art galleries',
      'Indoor attractions'
    ],
    snowy: [
      'Skiing',
      'Snowboarding',
      'Snowshoeing',
      'Hot springs',
      'Indoor activities'
    ]
  };

  const condition = weather.condition.toLowerCase();
  return activities[condition] || activities.cloudy;
};

const getActivityRecommendations = (trip, interests) => {
  const { travelStyle, preferences } = trip;
  let recommendations = [];

  // Add recommendations based on interests
  if (interests) {
    const interestKeywords = interests.toLowerCase().split(/[,\s]+/);
    interestKeywords.forEach(keyword => {
      if (keyword.includes('museum')) recommendations.push('Visit a local museum');
      if (keyword.includes('hike')) recommendations.push('Explore a scenic hiking trail');
      if (keyword.includes('food')) recommendations.push('Try local cuisine');
      if (keyword.includes('beach')) recommendations.push('Relax at the beach');
      // Add more keyword-based recommendations as needed
    });
  }

  // Existing travel style recommendations (can be combined with interests)
  switch (travelStyle) {
    case 'luxury':
      recommendations.push(
        'Private guided tours',
        'Fine dining experiences',
        'Spa treatments',
        'Exclusive events',
        'VIP attractions'
      );
      break;
    case 'budget':
      recommendations.push(
        'Free walking tours',
        'Local markets',
        'Public parks',
        'Museums with free days',
        'Street food experiences'
      );
      break;
    case 'adventure':
      recommendations.push(
        'Hiking trails',
        'Water sports',
        'Rock climbing',
        'Safari adventures'
      );
      break;
    case 'relaxed':
      recommendations.push(
        'Quiet cafes',
        'Park strolls',
        'Bookshops',
        'Botanical gardens',
        'Wellness retreats'
      );
      break;
    case 'cultural':
      recommendations.push(
        'Historical sites',
        'Art galleries',
        'Local festivals',
        'Traditional music/dance shows'
      );
      break;
    case 'family':
      recommendations.push(
        'Theme parks',
        'Kid-friendly museums',
        'Zoos/Aquariums',
        'Family resorts'
      );
      break;
    default:
      recommendations.push('Explore local attractions', 'Dine at popular restaurants');
  }
  
  // Ensure unique recommendations
  return [...new Set(recommendations)];
};

const getRestaurantRecommendations = (trip) => {
  const { travelStyle, preferences } = trip;
  let recommendations = [];

  switch (travelStyle) {
    case 'luxury':
      recommendations.push('Michelin-starred restaurants', 'Rooftop dining');
      break;
    case 'budget':
      recommendations.push('Street food stalls', 'Local diners');
      break;
    default:
      recommendations.push('Popular local restaurants');
  }
  return recommendations;
};

const getAccommodationRecommendations = (trip) => {
  const { travelStyle, preferences } = trip;
  let recommendations = [];

  switch (travelStyle) {
    case 'luxury':
      recommendations.push('5-star hotels', 'Boutique villas');
      break;
    case 'budget':
      recommendations.push('Hostels', 'Guesthouses');
      break;
    default:
      recommendations.push('Comfortable hotels');
  }
  return recommendations;
};

// API to get personalized recommendations
router.post('/personalized/:tripId', verifyToken, async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { interests } = req.body;
    const userId = req.user._id;

    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    // Check if user is creator or collaborator
    const isCreator = trip.creator && trip.creator.toString() === userId.toString();
    const isCollaborator = trip.collaborators && trip.collaborators.some(
      collab => collab.user && collab.user.toString() === userId.toString()
    );

    if (!isCreator && !isCollaborator) {
      throw new ApiError('Unauthorized access to this trip', 403);
    }

    const activityRecs = getActivityRecommendations(trip, interests);
    const restaurantRecs = getRestaurantRecommendations(trip);
    const accommodationRecs = getAccommodationRecommendations(trip);

    const allRecommendations = [
      ...activityRecs.map((rec, index) => ({
        id: `activity-${index}-${Date.now()}`,
        title: rec,
        description: `An activity recommendation based on your interests: ${interests || 'general travel'}.`,
        category: 'Activity',
        location: trip.destination || 'Anywhere',
        image: getRandomImage('Activity'),
        priceRange: 'Variable',
        rating: Math.floor(Math.random() * 5) + 1,
        additionalInfo: ''
      })),
      ...restaurantRecs.map((rec, index) => ({
        id: `restaurant-${index}-${Date.now()}`,
        title: rec,
        description: `A restaurant recommendation based on your interests: ${interests || 'general dining'}.`,
        category: 'Restaurant',
        location: trip.destination || 'Anywhere',
        image: getRandomImage('Restaurant'),
        priceRange: 'Variable',
        rating: Math.floor(Math.random() * 5) + 1,
        additionalInfo: ''
      })),
      ...accommodationRecs.map((rec, index) => ({
        id: `accommodation-${index}-${Date.now()}`,
        title: rec,
        description: `An accommodation recommendation based on your interests: ${interests || 'general stay'}.`,
        category: 'Accommodation',
        location: trip.destination || 'Anywhere',
        image: getRandomImage('Accommodation'),
        priceRange: 'Variable',
        rating: Math.floor(Math.random() * 5) + 1,
        additionalInfo: ''
      }))
    ];

    res.json(allRecommendations);
  } catch (error) {
    console.error('Error in personalized recommendations:', error);
    next(error);
  }
});

// API to get weather-based suggestions
router.get('/weather', verifyToken, async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      throw new ApiError('City parameter is required for weather recommendations', 400);
    }
    if (!WEATHER_API_KEY) {
      console.error('WEATHER_API_KEY is not set in environment variables');
      throw new ApiError('Weather API key not configured on server', 500);
    }

    const response = await axios.get(
      `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.data || !response.data.weather || !response.data.weather[0]) {
      throw new ApiError('Invalid weather data received', 500);
    }

    const weatherData = {
      temperature: response.data.main.temp,
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed
    };

    const weatherBasedActivities = getWeatherBasedActivities(weatherData);

    const suggestions = weatherBasedActivities.map(activity => ({ 
      id: `${activity}-${Date.now()}`,
      activity: activity,
      weather: weatherData.description,
      temperature: `${Math.round(weatherData.temperature)}°C`,
      recommendation: `Perfect for ${weatherData.description} weather! Temperature: ${Math.round(weatherData.temperature)}°C`,
      image: '', // Placeholder
    }));

    res.json(suggestions);

  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    if (error.response && error.response.status === 404) {
      next(new ApiError(`City "${req.query.city}" not found`, 404));
    } else if (error.response && error.response.status === 401) {
      next(new ApiError('Invalid weather API key', 500));
    } else {
      next(new ApiError('Failed to fetch weather data: ' + error.message, 500));
    }
  }
});

module.exports = router; 