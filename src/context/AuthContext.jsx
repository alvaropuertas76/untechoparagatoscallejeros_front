import React, { createContext, useContext, useState, useEffect } from 'react';
import rolePermissions from '../utils/rolePermissions';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al servicio de autenticación
      const userData = await userService.login(username, password);
      
      // Obtener permisos basados en el rol del usuario
      const userPermissions = rolePermissions[userData.rol] || {};
      
      // Guardar datos del usuario con sus permisos
      const userWithPermissions = {
        ...userData,
        permissions: userPermissions
      };
      
      setUser(userWithPermissions);
      setIsAuthenticated(true);
      
      // Guardar en sessionStorage para persistencia en recargas
      sessionStorage.setItem('user', JSON.stringify(userWithPermissions));
      
      return true;
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      setError('Credenciales incorrectas');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('user');
  };

  // Comprobar si hay un usuario en sessionStorage al iniciar
  useEffect(() => {
    const checkUser = () => {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          sessionStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    setLoading(true);
    checkUser();
  }, []);

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};