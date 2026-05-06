import axios from 'axios';

export default axios.create({
  // EL TRUCO:
  // Si estás en "npm run dev", usa localhost:5000.
  // Si ya compilaste ("npm run build"), usa la ruta relativa '/api' (para que ande Radmin).
  baseURL: import.meta.env.DEV 
    ? 'http://localhost:5098/api' 
    : '/api'
});