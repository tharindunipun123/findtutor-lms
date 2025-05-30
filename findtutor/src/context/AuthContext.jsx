import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password, userType) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any non-empty email/password
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const userData = {
        email,
        userType,
        // Add any other user data you want to store
      };

      setUser(userData);
      setUserType(userType);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, userData, userType) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any non-empty email/password
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const newUser = {
        ...userData,
        email,
        userType,
      };

      setUser(newUser);
      setUserType(userType);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    navigate('/');
  };

  const value = {
    user,
    loading,
    userType,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 