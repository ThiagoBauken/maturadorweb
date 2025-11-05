
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
    const storedToken = localStorage.getItem('whatsapp_token');
    const storedUser = localStorage.getItem('whatsapp_user');
    
    try {
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      // If there's an error parsing the user, clear the storage
      localStorage.removeItem('whatsapp_token');
      localStorage.removeItem('whatsapp_user');
    } finally {
      // Ensure we set isLoading to false after checking storage
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For demo purposes, we set admin role based on email
      const isAdmin = email.includes('admin');
      
      const mockUser = {
        id: '1',
        name: isAdmin ? 'Admin User' : 'Regular User',
        email: email,
        role: isAdmin ? 'admin' : 'user'
      };
      
      const mockToken = 'mock-jwt-token';
      
      // Store in localStorage
      localStorage.setItem('whatsapp_token', mockToken);
      localStorage.setItem('whatsapp_user', JSON.stringify(mockUser));
      
      // Update state
      setToken(mockToken);
      setUser(mockUser);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('whatsapp_token');
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
