import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired
          logout();
        } else {
          // Valid token
          setUser({
            id: decodedToken.userId,
            email: decodedToken.sub,
            role: decodedToken.role
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Invalid token', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      const { token, userId, email: userEmail, role } = response;
      
      localStorage.setItem('token', token);
      
      setUser({
        id: userId,
        email: userEmail,
        role: role
      });
      setIsAuthenticated(true);
      
      // Redirect based on role
      if (role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/');
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      const { token, userId, email, role } = response;
      
      localStorage.setItem('token', token);
      
      setUser({
        id: userId,
        email,
        role
      });
      setIsAuthenticated(true);
      
      // Redirect based on role
      if (role === 'STUDENT') {
        navigate('/student/profile');
      } else if (role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/');
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
