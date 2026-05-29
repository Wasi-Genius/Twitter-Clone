import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Crucial for your cookies/JWT to work
});

export default API;