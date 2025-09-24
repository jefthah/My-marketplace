import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
}

interface UseAdminAuthReturn {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdminAuth = async () => {
    console.log('🔍 checkAdminAuth started');
    try {
      const token = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');

      console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
      console.log('👤 Stored user from localStorage:', storedUser);

      if (!token || !storedUser) {
        console.log('❌ Missing token or stored user');
        setIsLoading(false);
        return;
      }

      // Parse stored user first
      let parsedUser: AdminUser;
      try {
        parsedUser = JSON.parse(storedUser);
        console.log('✅ Parsed stored user:', parsedUser);
      } catch (e) {
        console.error('❌ Error parsing stored user:', e);
        logout();
        return;
      }

      // Set user from localStorage immediately (optimistic)
      console.log('⚡ Setting user optimistically from localStorage');
      setAdminUser(parsedUser);
      
      // Verify token is still valid by making API call
      console.log('🌐 Making API call to /api/auth/me');
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${base}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('🔍 RAW API /me response:', JSON.stringify(data, null, 2));
        console.log('🔍 Response keys:', Object.keys(data));
        
        // Handle different response structures - data wraps the actual user data
        let userData;
        if (data.data && data.data.user) {
          userData = data.data.user;
        } else if (data.user) {
          userData = data.user;
        } else {
          userData = data;
        }
        
        console.log('🔍 userData keys:', Object.keys(userData));
        console.log('🔍 userData.role direct access:', userData.role);
        console.log('🔍 userData.roleID:', userData.roleID);
        
        const userRole = userData.role || userData.roleID?.roleName;
        
        console.log('Extracted user data:', userData);
        console.log('Extracted user role:', userRole);
        
        // Double check user is admin
        if (userRole === 'admin') {
          // Update user data with fresh data from API
          const freshUserData: AdminUser = {
            _id: userData._id || userData.id,
            email: userData.email,
            name: userData.username || userData.name,
            role: userRole
          };
          
          console.log('Setting fresh user data:', freshUserData);
          setAdminUser(freshUserData);
          // Update localStorage with fresh data
          localStorage.setItem('adminUser', JSON.stringify(freshUserData));
        } else {
          console.log('User is not admin, role:', userRole);
          // User is not admin, clear storage
          logout();
        }
      } else {
        console.log('❌ API response not ok, status:', response.status);
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        // Token invalid, clear storage
        logout();
      }
    } catch (error) {
      console.error('❌ Admin auth check failed:', error);
      logout();
    } finally {
      console.log('✅ checkAdminAuth completed, setting isLoading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    navigate('/admin');
  };

  const isAuthenticated = !!adminUser;
  
  console.log('🔒 useAdminAuth state:', {
    adminUser,
    isLoading,
    isAuthenticated
  });

  return {
    adminUser,
    isLoading,
    isAuthenticated,
    logout
  };
};

export default useAdminAuth;
