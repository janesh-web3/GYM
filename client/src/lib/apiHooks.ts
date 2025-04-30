// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { apiMethods } from './api';

// Custom hook for fetching data
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiMethods.get(url, options);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || 'An error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiMethods.get(url, options);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return { data, loading, error, refetch };
}

// Custom hook for handling post requests
export function usePost(url) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const execute = async (data, options = {}) => {
    try {
      setLoading(true);
      const result = await apiMethods.post(url, data, options);
      setResponse(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      setResponse(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, response };
}

// Custom hook for the CRUD operations
export function useCrud(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get all
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiMethods.get(endpoint);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  // Get by ID
  const fetchById = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await apiMethods.get(`${endpoint}/${id}`);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  // Create
  const create = useCallback(async (item) => {
    try {
      setLoading(true);
      const result = await apiMethods.post(endpoint, item);
      setData(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  // Update
  const update = useCallback(async (id, item) => {
    try {
      setLoading(true);
      const result = await apiMethods.put(`${endpoint}/${id}`, item);
      setData(prev => prev.map(d => d._id === id ? result : d));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  // Delete
  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      await apiMethods.delete(`${endpoint}/${id}`);
      setData(prev => prev.filter(d => d._id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  // Clear error
  const clearError = () => setError(null);
  
  return {
    data,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    clearError
  };
} 