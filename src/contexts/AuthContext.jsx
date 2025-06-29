import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('cmg_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Obtener usuarios desde localStorage
    const users = JSON.parse(localStorage.getItem('cmg_users') || '[]');
    
    // Usuarios por defecto si no hay datos guardados
    const defaultUsers = [
      {
        id: 1,
        email: 'admin@cmghidraulica.com',
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        status: 'Activo',
        lastLogin: null,
        createdAt: '2023-01-01'
      },
      {
        id: 2,
        email: 'jefe@cmghidraulica.com',
        username: 'jefe',
        password: 'jefe123',
        name: 'Carlos Martínez',
        role: 'supervisor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        status: 'Activo',
        lastLogin: null,
        createdAt: '2023-02-15'
      },
      {
        id: 3,
        email: 'tecnico@cmghidraulica.com',
        username: 'tecnico',
        password: 'tecnico123',
        name: 'Miguel García',
        role: 'technician',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        status: 'Activo',
        lastLogin: null,
        createdAt: '2023-03-10'
      },
      {
        id: 4,
        email: 'carlos.lopez@cmghidraulica.com',
        username: 'carlos.lopez',
        password: 'carlos123',
        name: 'Carlos López',
        role: 'technician',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        status: 'Activo',
        lastLogin: null,
        createdAt: '2023-04-05'
      },
      {
        id: 5,
        email: 'ana.rodriguez@cmghidraulica.com',
        username: 'ana.rodriguez',
        password: 'ana123',
        name: 'Ana Rodríguez',
        role: 'technician',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        status: 'Activo',
        lastLogin: null,
        createdAt: '2023-05-20'
      }
    ];

    // Combinar usuarios por defecto con usuarios creados
    let allUsers = [...defaultUsers];
    
    // Si hay usuarios guardados, combinarlos evitando duplicados
    if (users.length > 0) {
      users.forEach(savedUser => {
        const existingIndex = allUsers.findIndex(u => u.email === savedUser.email);
        if (existingIndex >= 0) {
          // Actualizar usuario existente
          allUsers[existingIndex] = savedUser;
        } else {
          // Añadir nuevo usuario
          allUsers.push(savedUser);
        }
      });
    }

    // Guardar la lista completa actualizada
    localStorage.setItem('cmg_users', JSON.stringify(allUsers));

    // Buscar usuario solo por email
    const foundUser = allUsers.find(u => 
      u.email === email && 
      u.password === password && 
      u.status === 'Activo'
    );
    
    if (foundUser) {
      const { password: userPassword, ...userWithoutPassword } = foundUser;
      
      // Actualizar último login
      const updatedUsers = allUsers.map(u => 
        u.id === foundUser.id 
          ? { ...u, lastLogin: new Date().toISOString() }
          : u
      );
      localStorage.setItem('cmg_users', JSON.stringify(updatedUsers));
      
      setUser(userWithoutPassword);
      localStorage.setItem('cmg_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    
    return { success: false, error: 'Credenciales incorrectas o usuario inactivo' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cmg_user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    switch (user.role) {
      case 'admin':
        return true; // Admin tiene todos los permisos
      case 'supervisor':
        return ['workorders', 'schedule', 'budgets', 'materials', 'personnel', 'reports'].includes(permission);
      case 'technician':
        return ['workorders', 'materials', 'vacations'].includes(permission);
      default:
        return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}