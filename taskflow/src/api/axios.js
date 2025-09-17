import axios from "axios";

// Create instance
const api = axios.create({
  baseURL: "http://localhost:3000/", 
  timeout: 5000, 
  headers: {
    "Content-Type": "application/json"
    
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("Token"); // Example auth
  if (token) {
    config.headers.Token = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized, maybe redirect to login");
    }
    return Promise.reject(error);
  }
);

export default api;
