import { create } from 'react';

export type UserRole = 'visitor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBlocked: boolean;
  classification: 'Student' | 'Faculty' | 'Staff' | 'Guest';
}

export interface Visit {
  id: string;
  userEmail: string;
  userName: string;
  department: string;
  reason: string;
  timestamp: string;
  classification: string;
}

// Initial mock data
const INITIAL_USERS: User[] = [
  { id: '1', email: 'jcesperanza@neu.edu.ph', name: 'JC Esperanza', role: 'admin', isBlocked: false, classification: 'Staff' },
  { id: '2', email: 'visitor1@neu.edu.ph', name: 'Juan Dela Cruz', role: 'visitor', isBlocked: false, classification: 'Student' },
  { id: '3', email: 'visitor2@neu.edu.ph', name: 'Maria Santos', role: 'visitor', isBlocked: true, classification: 'Student' },
];

const INITIAL_VISITS: Visit[] = [
  { id: 'v1', userEmail: 'visitor1@neu.edu.ph', userName: 'Juan Dela Cruz', department: 'College of Computer Studies', reason: 'Consultation', timestamp: new Date(Date.now() - 3600000).toISOString(), classification: 'Student' },
  { id: 'v2', userEmail: 'visitor2@neu.edu.ph', userName: 'Maria Santos', department: 'College of Arts and Sciences', reason: 'Library Use', timestamp: new Date(Date.now() - 86400000).toISOString(), classification: 'Student' },
];

class EduStore {
  private users: User[] = [...INITIAL_USERS];
  private visits: Visit[] = [...INITIAL_VISITS];
  private currentUser: User | null = null;

  getUsers() { return [...this.users]; }
  getVisits() { return [...this.visits]; }
  getCurrentUser() { return this.currentUser; }

  login(email: string, role: UserRole) {
    let user = this.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        role,
        isBlocked: false,
        classification: 'Student'
      };
      this.users.push(user);
    }
    this.currentUser = user;
    return user;
  }

  logout() {
    this.currentUser = null;
  }

  addVisit(visitData: Omit<Visit, 'id' | 'timestamp'>) {
    const newVisit: Visit = {
      ...visitData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    this.visits.unshift(newVisit);
  }

  blockUser(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user) user.isBlocked = true;
  }

  unblockUser(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user) user.isBlocked = false;
  }
}

export const store = new EduStore();
