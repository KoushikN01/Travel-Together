const axios = require('axios');

const HF_API_TOKEN = process.env.HF_API_TOKEN;

async function generateItinerary(prompt) {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 2 minutes
    }
  );
  return response.data;
}

module.exports = { generateItinerary }; 