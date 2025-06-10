import React from 'react';
import { useAuth } from '../context/AuthContext';

// Componente para renderizar contenido condicional basado en permisos
const RequirePermission = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
    return fallback;
  }
  
  return user.permissions[permission] ? children : fallback;
};

// Hook para verificar permisos en lógica condicional
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user || !user.permissions) {
      return false;
    }
    return !!user.permissions[permission];
  };
  
  return { hasPermission, permissions: user?.permissions || {} };
};

export default RequirePermission;
