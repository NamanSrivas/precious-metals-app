import axios from 'axios';

// MetalpriceAPI configuration
const BASE_URL = 'https://api.metalpriceapi.com/v1';
const API_KEY = '43ca670ce4e42c882447875eae663bf2'; // Replace with your actual API key

// Use mock API for demonstration (set to false when you have a real API key)
const MOCK_API = true;

// Metal codes
const METAL_CODES = {
  gold: 'XAU',
  silver: 'XAG',
  platinum: 'XPT',
  palladium: 'XPD'
};

// Base prices for realistic fluctuations
const BASE_PRICES = {
  XAU: { base: 2015.75, name: 'Gold' },
  XAG: { base: 23.45, name: 'Silver' },
  XPT: { base: 925.30, name: 'Platinum' },
  XPD: { base: 1245.60, name: 'Palladium' }
};

// Generate realistic live prices
const generateLivePrice = (metalCode) => {
  const baseData = BASE_PRICES[metalCode];
  if (!baseData) {
    console.error(`Unknown metal code: ${metalCode}`);
    return null;
  }

  const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
  const newPrice = baseData.base * (1 + fluctuation);
  const change = newPrice - baseData.base;
  const changePercent = (change / baseData.base) * 100;
  
  return {
    metal: metalCode,
    name: baseData.name,
    price: newPrice,
    change: change,
    changePercent: changePercent,
    high: newPrice + (Math.random() * 15),
    low: newPrice - (Math.random() * 15),
    open: baseData.base + (Math.random() - 0.5) * 20,
    previousClose: baseData.base,
    timestamp: Date.now(),
    unit: 'USD per troy ounce'
  };
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchMetalPrice = async (metalCode) => {
  try {
    if (MOCK_API) {
      // Simulate realistic API delay
      await delay(Math.random() * 800 + 200); // 200-1000ms delay
      
      // REDUCED error simulation - only 1% chance instead of 5%
      if (Math.random() < 0.01) {
        throw new Error('Network timeout');
      }
      
      const mockData = generateLivePrice(metalCode);
      if (!mockData) {
        throw new Error(`Invalid metal code: ${metalCode}`);
      }
      
      console.log(`✅ Mock data loaded for ${metalCode}: $${mockData.price.toFixed(2)}`);
      return mockData;
      
    } else {
      // Real API call
      const response = await axios.get(`${BASE_URL}/latest`, {
        params: {
          api_key: API_KEY,
          base: 'USD',
          currencies: metalCode
        },
        timeout: 10000
      });
      
      if (!response.data || !response.data.rates) {
        throw new Error('Invalid API response');
      }
      
      const data = response.data;
      return {
        metal: metalCode,
        name: getMetalName(metalCode),
        price: data.rates[metalCode],
        change: 0, // Real API might not provide change data
        changePercent: 0,
        high: data.rates[metalCode] * 1.02,
        low: data.rates[metalCode] * 0.98,
        open: data.rates[metalCode],
        previousClose: data.rates[metalCode],
        timestamp: data.timestamp * 1000,
        unit: 'USD per troy ounce'
      };
    }
  } catch (error) {
    console.error(`❌ Error fetching ${metalCode} price:`, error.message);
    
    // Return fallback data instead of throwing error
    const fallbackData = {
      metal: metalCode,
      name: getMetalName(metalCode),
      price: BASE_PRICES[metalCode]?.base || 0,
      change: 0,
      changePercent: 0,
      high: BASE_PRICES[metalCode]?.base * 1.02 || 0,
      low: BASE_PRICES[metalCode]?.base * 0.98 || 0,
      open: BASE_PRICES[metalCode]?.base || 0,
      previousClose: BASE_PRICES[metalCode]?.base || 0,
      timestamp: Date.now(),
      unit: 'USD per troy ounce',
      isOffline: true
    };
    
    console.log(`🔄 Using fallback data for ${metalCode}`);
    return fallbackData;
  }
};

export const fetchAllMetalPrices = async () => {
  const metals = Object.values(METAL_CODES);
  const promises = metals.map(async (metal) => {
    try {
      const data = await fetchMetalPrice(metal);
      return { metal, data, error: null };
    } catch (error) {
      return { metal, data: null, error: error.message };
    }
  });
  
  const results = await Promise.all(promises);
  return results;
};

const getMetalName = (code) => {
  const names = {
    'XAU': 'Gold',
    'XAG': 'Silver', 
    'XPT': 'Platinum',
    'XPD': 'Palladium'
  };
  return names[code] || code;
};

export { METAL_CODES };

