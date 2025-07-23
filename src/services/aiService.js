import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const aiService = {
  async askAI(prompt, conversationHistory = []) {
    try {
      const response = await axios.post(`${API_URL}/api/ai/ask-ai`, {
        prompt,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Error in askAI:', error);
      throw error;
    }
  },

  // Mock response for development/testing
  async mockAskAI(prompt, conversationHistory = []) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the last few messages for context
    const recentMessages = conversationHistory.slice(-4);
    const context = recentMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    // Simple response logic based on keywords and context
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('weather')) {
      return {
        result: "The weather forecast shows sunny skies with a high of 25°C. Perfect weather for outdoor activities! Would you like to know about specific activities that would be great in this weather?"
      };
    }
    
    if (lowerPrompt.includes('hotel') || lowerPrompt.includes('accommodation')) {
      return {
        result: "I can recommend several great hotels in the area. Would you like luxury, mid-range, or budget options? Also, what's your preferred location?"
      };
    }
    
    if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('food')) {
      return {
        result: "There are many excellent restaurants nearby. What type of cuisine are you interested in? I can suggest some local specialties as well."
      };
    }
    
    if (lowerPrompt.includes('transport') || lowerPrompt.includes('transportation')) {
      return {
        result: "The city has a great public transportation system. You can use buses, trains, or taxis. Would you like specific routes or information about ride-sharing services?"
      };
    }
    
    if (lowerPrompt.includes('attraction') || lowerPrompt.includes('place to visit')) {
      return {
        result: "Here are some must-visit attractions: 1. City Museum 2. Central Park 3. Historical District 4. Art Gallery. Would you like more details about any of these places?"
      };
    }

    // Check context for follow-up questions
    if (context.includes('weather') && lowerPrompt.includes('activity')) {
      return {
        result: "Given the sunny weather, I recommend outdoor activities like hiking, beach visits, or city tours. Would you like specific recommendations for any of these?"
      };
    }

    if (context.includes('hotel') && lowerPrompt.includes('price')) {
      return {
        result: "The price range varies by category. Luxury hotels start at $200/night, mid-range at $100/night, and budget options from $50/night. Would you like specific hotel recommendations in your preferred price range?"
      };
    }

    // Default response with follow-up
    return {
      result: "I'm here to help with your travel plans! You can ask me about weather, hotels, restaurants, transportation, or attractions. What specific information would you like to know?"
    };
  }
};

export default aiService; 