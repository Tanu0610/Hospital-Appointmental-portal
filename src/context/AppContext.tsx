/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Doctor, Patient, Appointment, Notification, Prescription } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  doctors: Doctor[];
  appointments: Appointment[];
  notifications: Notification[];
  loading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<string>;
  fetchDoctors: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  bookAppointment: (data: any) => Promise<boolean>;
  rescheduleAppointment: (id: string, date: string, timeSlot: string) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<boolean>;
  updatePatientProfile: (data: any) => Promise<boolean>;
  updateDoctorProfile: (data: any) => Promise<boolean>;
  getAdminData: () => Promise<{ kpis: any; specialtyDistribution: any[]; bookingTrend: any[] } | null>;
  getAdminUsers: () => Promise<any[]>;
  toggleUserStatus: (id: string) => Promise<boolean>;
  approveDoctor: (id: string) => Promise<boolean>;
  createPrescription: (data: any) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Read session on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('medicare_token');
    const savedUser = localStorage.getItem('medicare_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch contextual user data on session changes
  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchAppointments();
      fetchNotifications();
    } else {
      setAppointments([]);
      setNotifications([]);
    }
  }, [token]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    // Auto-dismiss within 4 seconds
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  const clearToast = () => setToast(null);

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const currentToken = token || localStorage.getItem('medicare_token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    return headers;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('medicare_token', data.token);
      localStorage.setItem('medicare_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Verification Error', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (regData: any): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('medicare_token', data.token);
      localStorage.setItem('medicare_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      showToast('Registration successful! Welcome to MediCare.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Registration error occurred', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    setToken(null);
    setUser(null);
    showToast('Successfully logged out of your session.', 'info');
  };

  const forgotPassword = async (email: string): Promise<string> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server dispatch error');
      showToast('Dispatching reset instructions. Check your clinical email.', 'success');
      return data.message;
    } catch (err: any) {
      showToast(err.message, 'error');
      return '';
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctor roster', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments', { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to fetch clinical appointments', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch user notifications', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark alerts as read', err);
    }
  };

  const bookAppointment = async (aptData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(aptData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Booking error');
      }
      showToast('Appointment successfully scheduled and clinic fee captured!', 'success');
      fetchAppointments();
      fetchNotifications();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Scheduling Failure', 'error');
      return false;
    }
  };

  const rescheduleAppointment = async (id: string, date: string, timeSlot: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/appointments/reschedule', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id, date, time_slot: timeSlot }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Rescheduling error');
      }
      showToast('Rescheduled. Awaiting doctor confirmation.', 'success');
      fetchAppointments();
      fetchNotifications();
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']): Promise<boolean> => {
    try {
      const res = await fetch('/api/appointments/update-status', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Status update error');
      }
      showToast(`Appointment marked as ${status}.`, 'success');
      fetchAppointments();
      fetchNotifications();
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updatePatientProfile = async (profileData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/patients/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update error');
      
      const updatedUser = data.user;
      localStorage.setItem('medicare_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showToast('Medical demographics saved.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateDoctorProfile = async (profileData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/doctors/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update error');
      
      showToast('Clinical medical parameters saved.', 'success');
      fetchDoctors();
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const getAdminData = async () => {
    try {
      const res = await fetch('/api/admin/analytics', { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analytics load failure');
      return data;
    } catch (err: any) {
      showToast(err.message, 'error');
      return null;
    }
  };

  const getAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Directory load failure');
      return data.users || [];
    } catch (err: any) {
      showToast(err.message, 'error');
      return [];
    }
  };

  const toggleUserStatus = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/users/toggle-status', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('User status successfully changed.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const approveDoctor = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/doctors/approve', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Doctor credentials verified & profile approved!', 'success');
      fetchDoctors();
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const createPrescription = async (prescData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(prescData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prescription creation failed');
      showToast('Digital prescription card dispatch complete.', 'success');
      fetchAppointments();
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        doctors,
        appointments,
        notifications,
        loading,
        toast,
        showToast,
        clearToast,
        login,
        register,
        logout,
        forgotPassword,
        fetchDoctors,
        fetchAppointments,
        fetchNotifications,
        markAllNotificationsRead,
        bookAppointment,
        rescheduleAppointment,
        updateAppointmentStatus,
        updatePatientProfile,
        updateDoctorProfile,
        getAdminData,
        getAdminUsers,
        toggleUserStatus,
        approveDoctor,
        createPrescription
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
