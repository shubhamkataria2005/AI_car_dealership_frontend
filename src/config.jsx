// frontend/src/config.jsx
// Get API URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://car-dealership-backend-env.eba-sfiicukk.ap-southeast-2.elasticbeanstalk.com';

// Log the API URL for debugging
console.log('🚀 API_BASE_URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
