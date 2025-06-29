import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataActions } from '@/contexts/data/dataActions';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  // Cargar datos desde localStorage o usar arrays vacíos
  useEffect(() => {
    const loadData = (key, setter) => {
      try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          setter(JSON.parse(savedData));
        } else {
          setter([]);
          localStorage.setItem(key, JSON.stringify([]));
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
        setter([]);
        localStorage.setItem(key, JSON.stringify([]));
      }
    };

    // Solo cargar usuario administrador por defecto
    const loadUsers = () => {
      try {
        const savedUsers = localStorage.getItem('cmg_users');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        } else {
          const defaultAdmin = [{
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
          }];
          setUsers(defaultAdmin);
          localStorage.setItem('cmg_users', JSON.stringify(defaultAdmin));
        }
      } catch (error) {
        console.error('Error loading users:', error);
        const defaultAdmin = [{
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
        }];
        setUsers(defaultAdmin);
        localStorage.setItem('cmg_users', JSON.stringify(defaultAdmin));
      }
    };

    // Solo cargar personal administrador por defecto
    const loadPersonnel = () => {
      try {
        const savedPersonnel = localStorage.getItem('cmg_personnel');
        if (savedPersonnel) {
          setPersonnel(JSON.parse(savedPersonnel));
        } else {
          const defaultPersonnel = [{
            id: 1,
            name: 'Administrador',
            email: 'admin@cmghidraulica.com',
            phone: '+34 963 123 456',
            role: 'admin',
            department: 'Administración',
            status: 'Activo',
            hireDate: '2023-01-01',
            workingHours: {
              today: 0,
              week: 0,
              month: 0
            },
            lastActivity: new Date().toISOString().slice(0, 16).replace('T', ' '),
            vacationDays: 22
          }];
          setPersonnel(defaultPersonnel);
          localStorage.setItem('cmg_personnel', JSON.stringify(defaultPersonnel));
        }
      } catch (error) {
        console.error('Error loading personnel:', error);
        const defaultPersonnel = [{
          id: 1,
          name: 'Administrador',
          email: 'admin@cmghidraulica.com',
          phone: '+34 963 123 456',
          role: 'admin',
          department: 'Administración',
          status: 'Activo',
          hireDate: '2023-01-01',
          workingHours: {
            today: 0,
            week: 0,
            month: 0
          },
          lastActivity: new Date().toISOString().slice(0, 16).replace('T', ' '),
          vacationDays: 22
        }];
        setPersonnel(defaultPersonnel);
        localStorage.setItem('cmg_personnel', JSON.stringify(defaultPersonnel));
      }
    };

    loadData('cmg_workOrders', setWorkOrders);
    loadData('cmg_materials', setMaterials);
    loadData('cmg_budgets', setBudgets);
    loadData('cmg_vacations', setVacations);
    loadData('cmg_clients', setClients);
    loadUsers();
    loadPersonnel();
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('cmg_workOrders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('cmg_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('cmg_personnel', JSON.stringify(personnel));
  }, [personnel]);

  useEffect(() => {
    localStorage.setItem('cmg_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('cmg_vacations', JSON.stringify(vacations));
  }, [vacations]);

  useEffect(() => {
    localStorage.setItem('cmg_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('cmg_users', JSON.stringify(users));
  }, [users]);

  const value = {
    // Data states
    workOrders,
    materials,
    personnel,
    budgets,
    vacations,
    clients,
    users,
    
    // Setters
    setWorkOrders,
    setMaterials,
    setPersonnel,
    setBudgets,
    setVacations,
    setClients,
    setUsers,
    
    // Actions
    addVacationRequest: dataActions.addVacationRequest(vacations, setVacations),
    updateVacationRequest: dataActions.updateVacationRequest(vacations, setVacations),
    addUser: dataActions.addUser(users, setUsers),
    updateUser: dataActions.updateUser(users, setUsers),
    deleteUser: dataActions.deleteUser(users, setUsers),
    changePassword: dataActions.changePassword(users, setUsers),
    addPersonnel: dataActions.addPersonnel(personnel, setPersonnel),
    updatePersonnel: dataActions.updatePersonnel(personnel, setPersonnel),
    deletePersonnel: dataActions.deletePersonnel(personnel, setPersonnel),
    addTimeEntry: dataActions.addTimeEntry(workOrders, setWorkOrders),
    assignTechnician: dataActions.assignTechnician(workOrders, setWorkOrders)
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}