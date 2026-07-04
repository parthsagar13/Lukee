import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  token: string | null;
  admin: { _id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, adminInfo: { _id: string; email: string; name: string }) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('lukee_admin_token'));
  const [admin, setAdmin] = useState<{ _id: string; email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setAdmin(data);
        } else {
          // Token is invalid/expired
          logout();
        }
      } catch (err) {
        console.error('Error verifying administrative session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = (newToken: string, adminInfo: { _id: string; email: string; name: string }) => {
    localStorage.setItem('lukee_admin_token', newToken);
    setToken(newToken);
    setAdmin(adminInfo);
  };

  const logout = () => {
    localStorage.removeItem('lukee_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{
      token,
      admin,
      isAuthenticated: !!admin,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
