// Permisos por roles
const rolePermissions = {
  admin: {
    // Permisos para gatos
    canCreate: true,        // Puede crear gatos
    canEdit: true,          // Puede editar gatos
    canDelete: true,        // Puede marcar gatos como fallecidos
    canAdopt: true,         // Puede marcar gatos como adoptados
    canViewAll: true,       // Puede ver todos los gatos (incluso fallecidos)
    
    // Permisos para usuarios
    canManageUsers: true,   // Puede gestionar usuarios
    
    // Permisos para fotos
    canManagePhotos: true,  // Puede gestionar fotos
    
    // Permisos para adopciones
    canApproveAdoptions: true, // Puede aprobar adopciones
    
    // Permisos para salud
    canManageHealth: true,  // Puede gestionar información de salud
    
    // Permisos para informes y estadísticas
    canViewReports: true    // Puede ver informes y estadísticas
  },
  voluntario: {
    // Permisos para gatos
    canCreate: true,        // Puede crear gatos
    canEdit: true,          // Puede editar gatos
    canDelete: false,       // No puede marcar gatos como fallecidos
    canAdopt: false,        // No puede marcar gatos como adoptados
    canViewAll: false,      // Solo puede ver gatos no fallecidos
    
    // Permisos para usuarios
    canManageUsers: false,  // No puede gestionar usuarios
    
    // Permisos para fotos
    canManagePhotos: true,  // Puede gestionar fotos
    
    // Permisos para adopciones
    canApproveAdoptions: false, // No puede aprobar adopciones
    
    // Permisos para salud
    canManageHealth: false, // No puede gestionar información de salud
    
    // Permisos para informes y estadísticas
    canViewReports: false   // No puede ver informes y estadísticas
  },
  adopcion: {
    // Permisos para gatos
    canCreate: false,       // No puede crear gatos
    canEdit: true,          // Puede editar gatos (limitado)
    canDelete: false,       // No puede marcar gatos como fallecidos
    canAdopt: true,         // Puede marcar gatos como adoptados
    canViewAll: false,      // Solo puede ver gatos no fallecidos
    
    // Permisos para usuarios
    canManageUsers: false,  // No puede gestionar usuarios
    
    // Permisos para fotos
    canManagePhotos: false, // No puede gestionar fotos
    
    // Permisos para adopciones
    canApproveAdoptions: true, // Puede aprobar adopciones
    
    // Permisos para salud
    canManageHealth: false, // No puede gestionar información de salud
    
    // Permisos para informes y estadísticas
    canViewReports: true    // Puede ver informes y estadísticas de adopciones
  },
  veterinario: {
    // Permisos para gatos
    canCreate: false,       // No puede crear gatos
    canEdit: true,          // Puede editar gatos (solo información de salud)
    canDelete: false,       // No puede marcar gatos como fallecidos
    canAdopt: false,        // No puede marcar gatos como adoptados
    canViewAll: true,       // Puede ver todos los gatos (incluso fallecidos)
    
    // Permisos para usuarios
    canManageUsers: false,  // No puede gestionar usuarios
    
    // Permisos para fotos
    canManagePhotos: false, // No puede gestionar fotos
    
    // Permisos para adopciones
    canApproveAdoptions: false, // No puede aprobar adopciones
    
    // Permisos para salud
    canManageHealth: true,  // Puede gestionar información de salud
    
    // Permisos para informes y estadísticas
    canViewReports: true    // Puede ver informes y estadísticas de salud
  }
};

export default rolePermissions;
