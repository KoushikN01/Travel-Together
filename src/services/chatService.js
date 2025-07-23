const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Predefined responses for common travel queries
const travelResponses = {
  weather: {
    keywords: ['weather', 'temperature', 'climate', 'forecast', 'rain', 'sunny', 'hot', 'cold'],
    response: "I can help you with weather information. Please provide the city and dates you're interested in. I can give you detailed forecasts and seasonal recommendations."
  },
  flights: {
    keywords: ['flight', 'airline', 'airport', 'booking', 'ticket', 'departure', 'arrival', 'airfare'],
    response: "I can help you find flight information. Would you like to search for flights to a specific destination? I can provide information about airlines, prices, and booking tips."
  },
  hotels: {
    keywords: ['hotel', 'accommodation', 'room', 'booking', 'stay', 'reservation', 'hostel', 'resort'],
    response: "I can assist you with hotel bookings. What's your destination and preferred dates? I can help you find accommodations that match your preferences and budget."
  },
  activities: {
    keywords: ['activity', 'attraction', 'tour', 'sightseeing', 'things to do', 'places to visit', 'tourist', 'local'],
    response: "I can suggest activities and attractions. What type of activities are you interested in? I can recommend popular tourist spots, hidden gems, and local experiences."
  },
  budget: {
    keywords: ['budget', 'cost', 'price', 'expensive', 'cheap', 'affordable', 'money', 'spend', 'saving'],
    response: "I can help you plan your travel budget. Would you like tips for saving money on your trip? I can provide information about costs, money-saving strategies, and budget-friendly options."
  },
  visa: {
    keywords: ['visa', 'passport', 'document', 'permit', 'entry', 'requirements', 'immigration'],
    response: "I can provide information about visa requirements. Which country are you planning to visit? I can help you understand the visa process and required documents."
  },
  food: {
    keywords: ['food', 'restaurant', 'cuisine', 'dining', 'eat', 'meal', 'local food', 'restaurant'],
    response: "I can help you discover local cuisine and dining options. What type of food are you interested in? I can recommend restaurants, local specialties, and food experiences."
  },
  transport: {
    keywords: ['transport', 'transportation', 'bus', 'train', 'metro', 'subway', 'taxi', 'car', 'rental'],
    response: "I can help you with transportation options. Would you like information about public transport, car rentals, or other ways to get around your destination?"
  },
  safety: {
    keywords: ['safety', 'security', 'safe', 'dangerous', 'crime', 'emergency', 'health', 'insurance'],
    response: "I can provide safety information and travel tips. What specific safety concerns do you have? I can help you with travel insurance, emergency contacts, and safety guidelines."
  },
  language: {
    keywords: ['language', 'speak', 'translate', 'phrase', 'communication', 'local language'],
    response: "I can help you with language information. Would you like to learn some basic phrases or get information about language requirements for your destination?"
  }
};

const processMessage = async (message) => {
  try {
    // Convert message to lowercase for better matching
    const lowerMessage = message.toLowerCase();
    
    // Tokenize the message
    const tokens = tokenizer.tokenize(lowerMessage);
    
    // Find matching category based on keywords
    let matchedCategory = null;
    let maxMatches = 0;

    for (const [category, data] of Object.entries(travelResponses)) {
      const matches = data.keywords.filter(keyword => 
        lowerMessage.includes(keyword)
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedCategory = category;
      }
    }

    // If no specific category is matched, provide a general response
    if (!matchedCategory) {
      return "I'm here to help with your travel plans! You can ask me about weather, flights, hotels, activities, budget, visa requirements, food, transportation, safety, or language information. What would you like to know?";
    }

    // Get response based on matched category
    const categoryResponse = travelResponses[matchedCategory].response;

    // Add some personalization and follow-up
    return `${categoryResponse}\n\nIs there anything specific about ${matchedCategory} that you'd like to know more about?`;
  } catch (error) {
    console.error('Error processing message:', error);
    return "I apologize, but I'm having trouble processing your request. Please try again with a different question about your travel plans.";
  }
};

module.exports = {
  processMessage
}; 