import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // in production the API is on the same domain
  : 'http://localhost:3001/api'; // while developing use localhost


export function useLegiScanProxy(endpoint, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build URL robustly for both absolute (dev) and relative (prod) bases
        const query = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/${endpoint}${query ? `?${query}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [endpoint, JSON.stringify(params)]);
  
  return { data, loading, error };
}