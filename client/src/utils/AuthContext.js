import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Check if token is expired
        const decodedToken = jwt_decode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token expired, logout user
          logout();
        } else {
          // Token valid, fetch user data
          fetchUserData();
        }
      } catch (error) {
        // Invalid token
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setCurrentUser(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authApi.register(userData);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setLoading(false);
  };

  const verifyOTP = async (otpData) => {
    try {
      setError(null);
      const response = await authApi.verifyOTP(otpData);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        verifyOTP
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;