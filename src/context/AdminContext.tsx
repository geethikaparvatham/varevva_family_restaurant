import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('varevva_admin_logged_in') === 'true';
    setIsAdmin(loggedIn);
  }, []);

  const login = (password: string) => {
    if (password === 'varevva123') {
      sessionStorage.setItem('varevva_admin_logged_in', 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('varevva_admin_logged_in');
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
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
