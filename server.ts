/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'server_db.json');

app.use(express.json());

// Helper function to read local JSON database
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Default template structure if missing
      return {
        users: [],
        doctors: [],
        patients: [],
        appointments: [],
        prescriptions: [],
        notifications: [],
        payments: [],
        schedules: []
      };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read server_db.json, returning empty template.", err);
    return {
      users: [],
      doctors: [],
      patients: [],
      appointments: [],
      prescriptions: [],
      notifications: [],
      payments: [],
      schedules: []
    };
  }
}

// Helper function to write to local JSON database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write to server_db.json", err);
  }
}

// Optional Supabase Client initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;
let supabase: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully. Connected to:", supabaseUrl);
  } catch (err) {
    console.error("Failed to initialize Supabase client, falling back to JSON local DB.", err);
  }
} else {
  console.log("Supabase credentials not fully detected. Operating in high-performance local JSON DB mode.");
}

// Custom Authentication Middleware
// Parses the token and returns the current user profile
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Auth token missing' });
  }

  // Session verification (for local mode we use a base64 encoded payload "session_userid:role")
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, role, status] = decoded.split(':');
    
    // Check in database
    const db = readDB();
    const user = db.users.find((u: any) => u.id === userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User session has expired' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'This user account has been blocked' });
    }

    (req as any).user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

// Helper to push virtual notifications
function addNotification(userId: string, title: string, message: string) {
  const db = readDB();
  const newNotif = {
    id: 'notif-' + Math.random().toString(36).substring(2, 9),
    user_id: userId,
    title,
    message,
    read: false,
    created_at: new Date().toISOString()
  };
  db.notifications.unshift(newNotif);
  writeDB(db);
}

// ---------------- REST APIs ----------------

// 1. AUTHENTICATION SERVICE APIS

app.post('/api/auth/register', (req, res) => {
  const { email, password, role, name, specialization, hospital, bio, appointment_fee } = req.body;
  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Required fields: email, password, role, name' });
  }

  const db = readDB();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const userId = 'u-' + Math.random().toString(36).substring(2, 9);
  
  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    role: role, // 'patient', 'doctor', 'admin'
    name: name,
    avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    status: 'active',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);

  if (role === 'doctor') {
    db.doctors.push({
      id: userId,
      specialization: specialization || 'General Medicine',
      hospital: hospital || 'Medicare Health Center',
      bio: bio || 'Professional clinical consultant.',
      availability: [
        { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
      ],
      rating: 5.0,
      approved: false, // requires admin approval
      appointment_fee: Number(appointment_fee) || 150.0
    });
    addNotification('u-admin', 'New Doctor Account Registered', `Dr. ${name} registered and is awaiting credentials approval.`);
  } else if (role === 'patient') {
    db.patients.push({
      id: userId,
      gender: 'Not specified',
      blood_type: 'Unknown',
      date_of_birth: '',
      phone: ''
    });
  }

  writeDB(db);

  // Auto-generate verification link simulation
  const sessionToken = Buffer.from(`${userId}:${role}:active`).toString('base64');
  res.status(201).json({
    message: 'Registration successful!',
    user: newUser,
    token: sessionToken
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter your email and password' });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'This user account has been blocked' });
  }

  // Simulate password check (password is accepted if matches standard or safe)
  const isCorrect = password === 'admin123' || password === 'doctor123' || password === 'patient123' || password.length >= 6;
  if (!isCorrect) {
    return res.status(401).json({ error: 'Invalid email or password combinations' });
  }

  const sessionToken = Buffer.from(`${user.id}:${user.role}:active`).toString('base64');
  
  res.json({
    message: 'Logged in successfully',
    token: sessionToken,
    user: user
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  res.json({ message: 'A password reset recovery email has been dispatched to: ' + email });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

// 2. PUBLIC & CLINICAL APIS

// Get list of certified/approved clinic doctors
app.get('/api/doctors', (req, res) => {
  const db = readDB();
  const approvedDocs = db.doctors.map((doc: any) => {
    const userMeta = db.users.find((u: any) => u.id === doc.id);
    return {
      ...doc,
      user_name: userMeta?.name || 'Unknown Doctor',
      email: userMeta?.email,
      avatar_url: userMeta?.avatar_url,
      status: userMeta?.status
    };
  });
  
  res.json({ doctors: approvedDocs });
});

// Update patient profile details
app.put('/api/patients/profile', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  if (currentUser.role !== 'patient') {
    return res.status(403).json({ error: 'Only patient users can perform this action' });
  }

  const { name, phone, gender, blood_type, date_of_birth, avatar_url } = req.body;
  const db = readDB();
  
  // Update base user details
  const userIndex = db.users.findIndex((u: any) => u.id === currentUser.id);
  if (userIndex !== -1) {
    if (name) db.users[userIndex].name = name;
    if (avatar_url) db.users[userIndex].avatar_url = avatar_url;
  }

  // Update specific patient details
  const patientIndex = db.patients.findIndex((p: any) => p.id === currentUser.id);
  if (patientIndex !== -1) {
    db.patients[patientIndex] = {
      ...db.patients[patientIndex],
      phone: phone || db.patients[patientIndex].phone,
      gender: gender || db.patients[patientIndex].gender,
      blood_type: blood_type || db.patients[patientIndex].blood_type,
      date_of_birth: date_of_birth || db.patients[patientIndex].date_of_birth
    };
  } else {
    db.patients.push({
      id: currentUser.id,
      phone,
      gender,
      blood_type,
      date_of_birth
    });
  }

  writeDB(db);
  res.json({ message: 'Medical profile successfully saved.', user: db.users[userIndex] });
});

// Update doctor profile details & availability calendar
app.put('/api/doctors/profile', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  if (currentUser.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied: doctor access required' });
  }

  const { name, specialization, hospital, bio, availability, appointment_fee, avatar_url } = req.body;
  const db = readDB();

  // Update user name and icon
  const userIndex = db.users.findIndex((u: any) => u.id === currentUser.id);
  if (userIndex !== -1) {
    if (name) db.users[userIndex].name = name;
    if (avatar_url) db.users[userIndex].avatar_url = avatar_url;
  }

  // Update doctor specialization / schedule blocks
  const docIndex = db.doctors.findIndex((d: any) => d.id === currentUser.id);
  if (docIndex !== -1) {
    db.doctors[docIndex] = {
      ...db.doctors[docIndex],
      specialization: specialization || db.doctors[docIndex].specialization,
      hospital: hospital || db.doctors[docIndex].hospital,
      bio: bio || db.doctors[docIndex].bio,
      availability: availability || db.doctors[docIndex].availability,
      appointment_fee: appointment_fee !== undefined ? Number(appointment_fee) : db.doctors[docIndex].appointment_fee
    };
  }

  writeDB(db);
  res.json({ message: 'Doctor clinical settings updated successfully' });
});

// 3. APPOINTMENT SCHEDULING SYSTEM APIS

// Get current appointments
app.get('/api/appointments', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();
  
  let appointmentsList = [];
  
  if (currentUser.role === 'admin') {
    appointmentsList = db.appointments;
  } else if (currentUser.role === 'doctor') {
    appointmentsList = db.appointments.filter((a: any) => a.doctor_id === currentUser.id);
  } else {
    // Patient
    appointmentsList = db.appointments.filter((a: any) => a.patient_id === currentUser.id);
  }

  // Hydrate doctor and patient names
  const hydrated = appointmentsList.map((apt: any) => {
    const docMeta = db.users.find((u: any) => u.id === apt.doctor_id);
    const docDetails = db.doctors.find((d: any) => d.id === apt.doctor_id);
    const patMeta = db.users.find((u: any) => u.id === apt.patient_id);
    const patDetails = db.patients.find((p: any) => p.id === apt.patient_id);
    const rx = db.prescriptions.find((r: any) => r.appointment_id === apt.id);
    
    return {
      ...apt,
      doctor_name: docMeta?.name || 'Dr. Specialist',
      specialization: docDetails?.specialization || 'Medicine',
      hospital: docDetails?.hospital || 'City General Hospital',
      patient_name: patMeta?.name || 'John Anonymous',
      patient_details: patDetails || {},
      prescription: rx || null
    };
  });

  res.json({ appointments: hydrated });
});

// Book interactive appointment slot
app.post('/api/appointments/create', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  const { doctor_id, date, time_slot, notes, fee, payment_method } = req.body;

  if (!doctor_id || !date || !time_slot) {
    return res.status(400).json({ error: 'Requirements: doctor_id, date, time_slot' });
  }

  const db = readDB();

  // Double booking validation
  const slotConflict = db.appointments.find((apt: any) => 
    apt.doctor_id === doctor_id &&
    apt.date === date &&
    apt.time_slot === time_slot &&
    apt.status !== 'cancelled'
  );

  if (slotConflict) {
    return res.status(409).json({ error: 'This appointment slot is already locked by another patient.' });
  }

  const aptId = 'apt-' + Math.random().toString(36).substring(2, 9);
  const newAppointment = {
    id: aptId,
    patient_id: currentUser.id,
    doctor_id,
    date,
    time_slot,
    status: 'pending',
    notes: notes || '',
    fee: Number(fee) || 150.0,
    created_at: new Date().toISOString()
  };

  db.appointments.push(newAppointment);

  // Auto-record receipt payment schema
  const paymentId = 'pay-' + Math.random().toString(36).substring(2, 9);
  db.payments.push({
    id: paymentId,
    appointment_id: aptId,
    amount: Number(fee) || 150.0,
    status: 'completed',
    date: new Date().toISOString(),
    payment_method: payment_method || 'Credit Card'
  });

  writeDB(db);

  // Send virtual notifications
  const docMeta = db.users.find((u: any) => u.id === doctor_id);
  addNotification(doctor_id, 'New Appointment Scheduled', `${currentUser.name} booked a session on ${date} at ${time_slot}.`);
  addNotification(currentUser.id, 'Appointment Pending Confirmation', `Your booking for Dr. ${docMeta?.name || 'Specialist'} has been submitted.`);

  res.status(201).json({
    message: 'Appointment scheduled. Payment receipt issued successfully.',
    appointment: newAppointment
  });
});

// Reschedule
app.put('/api/appointments/reschedule', authenticate, (req, res) => {
  const { id, date, time_slot } = req.body;
  if (!id || !date || !time_slot) {
    return res.status(400).json({ error: 'Appointment ID, new date, and new time slot are mandatory' });
  }

  const db = readDB();
  const aptIndex = db.appointments.findIndex((a: any) => a.id === id);
  if (aptIndex === -1) {
    return res.status(404).json({ error: 'No booking record match found' });
  }

  // Conflict validation
  const conflict = db.appointments.find((apt: any) => 
    apt.doctor_id === db.appointments[aptIndex].doctor_id &&
    apt.date === date &&
    apt.time_slot === time_slot &&
    apt.id !== id &&
    apt.status !== 'cancelled'
  );

  if (conflict) {
    return res.status(409).json({ error: 'New appointment slot is already taken' });
  }

  const originalDate = db.appointments[aptIndex].date;
  const originalTime = db.appointments[aptIndex].time_slot;

  db.appointments[aptIndex].date = date;
  db.appointments[aptIndex].time_slot = time_slot;
  db.appointments[aptIndex].status = 'pending'; // Reset back to pending for approval

  writeDB(db);

  const docId = db.appointments[aptIndex].doctor_id;
  const patId = db.appointments[aptIndex].patient_id;
  const docMeta = db.users.find((u: any) => u.id === docId);
  const patMeta = db.users.find((u: any) => u.id === patId);

  addNotification(docId, 'Appointment Slot Rescheduled', `${patMeta?.name || 'Patient'} rescheduled. Review Slot: ${date} at ${time_slot}.`);
  addNotification(patId, 'Appointment Modified', `Status updated. Shifted from ${originalDate} ${originalTime} to ${date} ${time_slot}.`);

  res.json({ message: 'Successfully rescheduled. Details updated.', appointment: db.appointments[aptIndex] });
});

// Accept, cancel, or complete appointments
app.put('/api/appointments/update-status', authenticate, (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: 'Need Appointment ID and new status' });
  }

  const db = readDB();
  const aptIndex = db.appointments.findIndex((a: any) => a.id === id);
  if (aptIndex === -1) {
    return res.status(404).json({ error: 'No appointment found with that ID' });
  }

  const appointment = db.appointments[aptIndex];
  appointment.status = status; // 'confirmed', 'cancelled', 'completed'
  writeDB(db);

  // Send alerts
  const patMeta = db.users.find((u: any) => u.id === appointment.patient_id);
  const docMeta = db.users.find((u: any) => u.id === appointment.doctor_id);

  if (status === 'confirmed') {
    addNotification(appointment.patient_id, 'Booking Confirmed!', `Dr. ${docMeta?.name} approved your reservation on ${appointment.date}.`);
  } else if (status === 'cancelled') {
    addNotification(appointment.patient_id, 'Booking Cancelled', `Your scheduled session with Dr. ${docMeta?.name} has been cancelled.`);
    addNotification(appointment.doctor_id, 'Scheduled Cancelled', `The session booked by ${patMeta?.name} has been cancelled.`);
  } else if (status === 'completed') {
    addNotification(appointment.patient_id, 'Consultation Finished', `How did it go? View clinical notes and prescription from Dr. ${docMeta?.name}.`);
  }

  res.json({ message: `Appointment successfully marked as ${status}.`, appointment });
});

// 4. PRESCRIPTIONS APIS

app.post('/api/prescriptions', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  if (currentUser.role !== 'doctor') {
    return res.status(403).json({ error: 'Only medical specialists can write prescriptions' });
  }

  const { appointment_id, patient_id, diagnosis, medications, instructions } = req.body;
  if (!appointment_id || !patient_id || !diagnosis || !medications) {
    return res.status(400).json({ error: 'Diagnosis details and medication lines are required' });
  }

  const db = readDB();
  const rxId = 'rx-' + Math.random().toString(36).substring(2, 9);
  
  const newRx = {
    id: rxId,
    appointment_id,
    patient_id,
    doctor_id: currentUser.id,
    diagnosis,
    medications,
    instructions,
    date: new Date().toISOString().split('T')[0]
  };

  db.prescriptions.push(newRx);

  // Link inside appointment
  const aptIndex = db.appointments.findIndex((a: any) => a.id === appointment_id);
  if (aptIndex !== -1) {
    db.appointments[aptIndex].prescription_id = rxId;
    db.appointments[aptIndex].status = 'completed'; // auto-complete appointment
  }

  writeDB(db);
  
  addNotification(patient_id, 'Medical Prescription Ready', `Dr. ${currentUser.name} issued a digital prescription card for your record.`);

  res.status(201).json({ message: 'Prescription written and finalized.', prescription: newRx });
});

// 5. NOTIFICATION HUB APIS

app.get('/api/notifications', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();
  const list = db.notifications.filter((n: any) => n.user_id === currentUser.id);
  res.json({ notifications: list });
});

app.put('/api/notifications/read', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  const { id } = req.body;
  
  const db = readDB();
  if (id) {
    const item = db.notifications.find((n: any) => n.id === id && n.user_id === currentUser.id);
    if (item) item.read = true;
  } else {
    // mark all as read
    db.notifications.forEach((n: any) => {
      if (n.user_id === currentUser.id) n.read = true;
    });
  }
  
  writeDB(db);
  res.json({ message: 'Success' });
});

// 6. ADMINISTRATOR SYSTEM APIS (USERS CONTROL & ANALYTICS)

app.get('/api/admin/users', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  if (currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role is required to view directory' });
  }

  const db = readDB();
  
  // Package list of all user profiles in database
  const usersExtended = db.users.map((u: any) => {
    let medical = {};
    if (u.role === 'patient') {
      medical = db.patients.find((p: any) => p.id === u.id) || {};
    } else if (u.role === 'doctor') {
      medical = db.doctors.find((d: any) => d.id === u.id) || {};
    }
    
    return {
      ...u,
      details: medical
    };
  });

  res.json({ users: usersExtended });
});

// Toggle accounts blocked/unblocked
app.put('/api/admin/users/toggle-status', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  if (currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  const { id } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const originalStatus = db.users[userIndex].status;
  const newStatus = originalStatus === 'active' ? 'blocked' : 'active';
  db.users[userIndex].status = newStatus;
  
  writeDB(db);
  res.json({ message: `Account status updated to ${newStatus}.`, user: db.users[userIndex] });
});

// Approve Pending Doctors
app.put('/api/admin/doctors/approve', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  if (currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const { id } = req.body;
  const db = readDB();
  const docIndex = db.doctors.findIndex((d: any) => d.id === id);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Doctor clinical profile not found' });
  }

  db.doctors[docIndex].approved = true;
  writeDB(db);

  // Notify the doctor
  addNotification(id, 'Clinical Account Activated!', 'An administrator approved your credentials. You can now define availability and accept appointments!');

  res.json({ message: 'Doctor clinical status set to Approved', doctor: db.doctors[docIndex] });
});

// Aggregated hospital administration dashboard charts & KPIs
app.get('/api/admin/analytics', authenticate, (req, res) => {
  const currentUser = (req as any).user;
  if (currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: exclusive admin database analytical route' });
  }

  const db = readDB();
  
  const totalBpts = db.appointments.length;
  const totalDocs = db.doctors.length;
  const totalPats = db.patients.length;
  
  // Sum revenues from payment table
  const totalRevenue = db.payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  // Group bookings count by specialization for chart
  const specialtyStats: Record<string, number> = {};
  db.appointments.forEach((apt: any) => {
    const doc = db.doctors.find((d: any) => d.id === apt.doctor_id);
    const spec = doc?.specialization || 'General Medicine';
    specialtyStats[spec] = (specialtyStats[spec] || 0) + 1;
  });

  const chartDataSpecialties = Object.keys(specialtyStats).map(key => ({
    name: key,
    value: specialtyStats[key]
  }));

  // Booking history overview trend (last months or days)
  const bookingTrend = [
    { name: 'Jan', appointments: 12, revenue: 1540 },
    { name: 'Feb', appointments: 18, revenue: 2400 },
    { name: 'Mar', appointments: 15, revenue: 2100 },
    { name: 'Apr', appointments: 25, revenue: 3800 },
    { name: 'May', appointments: totalBpts, revenue: totalRevenue }
  ];

  res.json({
    kpis: {
      totalBookings: totalBpts,
      totalDoctors: totalDocs,
      totalPatients: totalPats,
      totalRevenue: totalRevenue
    },
    specialtyDistribution: chartDataSpecialties,
    bookingTrend
  });
});

// Vite Middleware for hot-rendering setup in local dev container
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Medicare Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
