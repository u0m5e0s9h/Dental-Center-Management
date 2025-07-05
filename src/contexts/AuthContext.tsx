import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  role: 'Admin' | 'Patient';
  email: string;
  patientId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data if not exists
    const initializeData = () => {
      const existingUsers = localStorage.getItem('dentalUsers');
      if (!existingUsers) {
        const mockUsers = [
          { id: "1", role: "Admin", email: "admin@entnt.in", password: "admin123" },
          { id: "2", role: "Patient", email: "john@entnt.in", password: "patient123", patientId: "p1" }
        ];
        localStorage.setItem('dentalUsers', JSON.stringify(mockUsers));
      }

      const existingPatients = localStorage.getItem('dentalPatients');
      if (!existingPatients) {
        const mockPatients = [
          {
            id: "p1",
            name: "John Doe",
            dob: "1990-05-10",
            contact: "1234567890",
            email: "john@entnt.in",
            address: "123 Main St, City",
            healthInfo: "No known allergies"
          }
        ];
        localStorage.setItem('dentalPatients', JSON.stringify(mockPatients));
      }

      const existingIncidents = localStorage.getItem('dentalIncidents');
      if (!existingIncidents) {
        const mockIncidents = [
          {
            id: "i1",
            patientId: "p1",
            title: "Routine Checkup",
            description: "Regular dental examination",
            comments: "Good oral health",
            appointmentDate: "2025-01-15T10:00:00",
            cost: 80,
            treatment: "Cleaning and examination",
            status: "Scheduled",
            nextDate: "2025-07-15T10:00:00",
            files: []
          },
          {
            id: "i2",
            patientId: "p1",
            title: "Tooth Filling",
            description: "Cavity in upper molar",
            comments: "Small cavity, requires filling",
            appointmentDate: "2024-12-20T14:00:00",
            cost: 120,
            treatment: "Composite filling",
            status: "Completed",
            nextDate: "2025-06-20T14:00:00",
            files: []
          }
        ];
        localStorage.setItem('dentalIncidents', JSON.stringify(mockIncidents));
      }
    };

    initializeData();

    // Check for existing session
    const savedUser = localStorage.getItem('dentalCurrentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('dentalUsers') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const userData = { id: user.id, role: user.role, email: user.email, patientId: user.patientId };
      setUser(userData);
      localStorage.setItem('dentalCurrentUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dentalCurrentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
