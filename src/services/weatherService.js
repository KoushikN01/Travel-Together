import axios from 'axios';

const API_KEY = '69a537a78b780884d929c80fc7ecceb4'; // Use your own OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const getCityWeather = async (city, country) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: `${city},${country}`,
        appid: API_KEY,
        units: 'metric',
      },
    });
    const data = response.data;
    return {
      name: city,
      country,
      temp: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
    };
  } catch (error) {
    return { name: city, country, temp: null, description: 'N/A', humidity: null };
  }
};

// Get 5-day forecast using 3-hour interval data, summarized per day
const getCityForecast = async (city, country = 'IN') => {
  try {
    const response = await axios.get(FORECAST_URL, {
      params: {
        q: `${city},${country}`,
        appid: API_KEY,
        units: 'metric',
      },
    });
    const data = response.data;
    if (!data.list) return [];
    // Group by date
    const days = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayStr = date.toISOString().split('T')[0];
      if (!days[dayStr]) days[dayStr] = [];
      days[dayStr].push(item);
    });
    // Summarize each day
    const result = Object.keys(days).slice(0, 5).map(dayStr => {
      const items = days[dayStr];
      let min = Math.min(...items.map(i => i.main.temp_min));
      let max = Math.max(...items.map(i => i.main.temp_max));
      let avgHumidity = Math.round(items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length);
      // Most common weather description
      const descCounts = {};
      items.forEach(i => {
        const desc = i.weather[0].description;
        descCounts[desc] = (descCounts[desc] || 0) + 1;
      });
      const description = Object.entries(descCounts).sort((a, b) => b[1] - a[1])[0][0];
      return {
        date: new Date(dayStr),
        min,
        max,
        description,
        humidity: avgHumidity,
      };
    });
    return result;
  } catch (error) {
    return [];
  }
};

const weatherService = { getCityWeather, getCityForecast };
export default weatherService; 