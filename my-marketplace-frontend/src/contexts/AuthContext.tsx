import { createContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  photoUrl?: string;
  role: string;
  phone?: string;
  address?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user is logged in on app startup
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setToken(savedToken);
          
          // Refresh user data from backend to get latest profile info
          try {
            const response = await apiService.getMe();
            if (response.success && response.data) {
              const responseData = response.data as {
                user: {
                  id: string;
                  username: string;
                  email: string;
                  role: string;
                  profileImage?: string;
                  phone?: string;
                  address?: string;
                  bio?: string;
                }
              };
              
              const freshUserData: User = {
                id: responseData.user.id,
                name: responseData.user.username,
                email: responseData.user.email,
                role: responseData.user.role,
                profileImage: responseData.user.profileImage,
                phone: responseData.user.phone,
                address: responseData.user.address,
                bio: responseData.user.bio,
              };
              setUser(freshUserData);
              localStorage.setItem('user', JSON.stringify(freshUserData));
            }
          } catch (error) {
            console.error('Error refreshing user data on startup:', error);
            // Continue with cached data if refresh fails
          }
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    try {
      if (!token) return;
      
      const response = await apiService.getMe();
      if (response.success && response.data) {
        // Type assertion untuk response data
        const responseData = response.data as {
          user: {
            id: string;
            username: string;
            email: string;
            role: string;
            profileImage?: string;
            phone?: string;
            address?: string;
            bio?: string;
          }
        };
        
        const userData: User = {
          id: responseData.user.id,
          name: responseData.user.username,
          email: responseData.user.email,
          role: responseData.user.role,
          profileImage: responseData.user.profileImage,
          phone: responseData.user.phone,
          address: responseData.user.address,
          bio: responseData.user.bio,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user && !!token,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
