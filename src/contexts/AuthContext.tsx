
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('whatsapp_user');

    try {
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      // If there's an error parsing the user, clear the storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('whatsapp_user');
    } finally {
      // Ensure we set isLoading to false after checking storage
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

      // Call the real backend API
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user: userData } = data.data;

      // Store in localStorage with consistent key name
      localStorage.setItem('authToken', token);
      localStorage.setItem('whatsapp_user', JSON.stringify(userData));

      // Update state
      setToken(token);
      setUser(userData);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('whatsapp_user');

    // Update state
    setToken(null);
    setUser(null);

    // Redirect to login
    navigate('/login');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
