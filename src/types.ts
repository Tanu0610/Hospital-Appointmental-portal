/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar_url?: string;
  status: 'active' | 'blocked';
  created_at: string;
}

export interface Patient {
  id: string; // matches user id
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  phone?: string;
  user?: User;
}

export interface Doctor {
  id: string; // matches user id
  specialization: string;
  hospital: string;
  bio: string;
  availability: {
    day: string; // e.g. 'Monday', 'Tuesday'
    slots: string[]; // e.g. ['09:00', '10:00', '11:00']
  }[];
  rating: number;
  approved: boolean;
  appointment_fee: number;
  user?: User;
  user_name?: string;
  email?: string;
  avatar_url?: string;
  status?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD
  time_slot: string; // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  prescription_id?: string;
  fee: number;
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
  specialization?: string;
  hospital?: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions?: string;
  date: string;
  doctor_name?: string;
  patient_name?: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  date: string;
  payment_method: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
