export const dataActions = {
  // Vacation actions
  addVacationRequest: (vacations, setVacations) => (request) => {
    const newRequest = {
      ...request,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    setVacations(prev => [...prev, newRequest]);
  },

  updateVacationRequest: (vacations, setVacations) => (id, updates) => {
    setVacations(prev => prev.map(vacation => 
      vacation.id === id ? { ...vacation, ...updates } : vacation
    ));
  },

  // User actions
  addUser: (users, setUsers) => (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Activo',
      lastLogin: null
    };
    setUsers(prev => [...prev, newUser]);
  },

  updateUser: (users, setUsers) => (id, updates) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  },

  deleteUser: (users, setUsers) => (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  },

  changePassword: (users, setUsers) => (id, newPassword) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, password: newPassword } : user
    ));
  },

  // Personnel actions
  addPersonnel: (personnel, setPersonnel) => (personnelData) => {
    const newPersonnel = {
      ...personnelData,
      id: Date.now(),
      workingHours: {
        today: 0,
        week: 0,
        month: 0
      },
      lastActivity: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setPersonnel(prev => [...prev, newPersonnel]);
  },

  updatePersonnel: (personnel, setPersonnel) => (id, updates) => {
    setPersonnel(prev => prev.map(person => 
      person.id === id ? { ...person, ...updates } : person
    ));
  },

  deletePersonnel: (personnel, setPersonnel) => (id) => {
    setPersonnel(prev => prev.filter(person => person.id !== id));
  },

  // Work order actions
  addTimeEntry: (workOrders, setWorkOrders) => (workOrderId, timeEntry) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === workOrderId 
        ? {
            ...wo,
            timeEntries: [...(wo.timeEntries || []), timeEntry],
            workedHours: (wo.workedHours || 0) + timeEntry.hours,
            history: [
              ...(wo.history || []),
              {
                date: new Date().toLocaleString(),
                action: `Fichaje registrado: ${timeEntry.hours}h por ${timeEntry.technician}`,
                user: timeEntry.technician
              }
            ]
          }
        : wo
    ));
  },

  assignTechnician: (workOrders, setWorkOrders) => (workOrderId, technicianName) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === workOrderId 
        ? {
            ...wo,
            assignedTechnicians: [...(wo.assignedTechnicians || []), technicianName],
            history: [
              ...(wo.history || []),
              {
                date: new Date().toLocaleString(),
                action: `${technicianName} se fichó en el trabajo`,
                user: technicianName
              }
            ]
          }
        : wo
    ));
  },

  // Appointment actions
  addAppointment: (appointments, setAppointments) => (appointmentData) => {
    const newAppointment = {
      ...appointmentData,
      id: Date.now(),
      status: 'Confirmada'
    };
    setAppointments(prev => [...prev, newAppointment]);
  }
};
