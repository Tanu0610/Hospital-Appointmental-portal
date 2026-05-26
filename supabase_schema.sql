-- SQL Schema for MediCare Hospital Appointment Portal
-- Execute this script in your Supabase SQL Editor.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create USERS table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  name text not null,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users
alter table public.users enable row level security;

-- 2. Create PATIENTS table
create table public.patients (
  id uuid references public.users(id) on delete cascade primary key,
  date_of_birth date,
  gender text,
  blood_type text,
  phone text
);

-- Enable RLS for patients
alter table public.patients enable row level security;

-- 3. Create DOCTORS table
create table public.doctors (
  id uuid references public.users(id) on delete cascade primary key,
  specialization text not null,
  hospital text not null,
  bio text,
  availability jsonb not null default '[]'::jsonb,
  rating numeric(3,2) default 5.0,
  approved boolean default false,
  appointment_fee numeric(10,2) default 150.00
);

-- Enable RLS for doctors
alter table public.doctors enable row level security;

-- 4. Create APPOINTMENTS table
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.users(id) on delete cascade not null,
  doctor_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  time_slot text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  fee numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure a doctor cannot be booked twice on the exact same date and time slot unless cancelled
  constraint unique_appointment_slot unique (doctor_id, date, time_slot)
);

-- Enable RLS for appointments
alter table public.appointments enable row level security;

-- 5. Create PRESCRIPTIONS table
create table public.prescriptions (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  patient_id uuid references public.users(id) on delete cascade not null,
  doctor_id uuid references public.users(id) on delete cascade not null,
  diagnosis text not null,
  medications jsonb not null default '[]'::jsonb, -- Array of objects: { name, dosage, frequency, duration }
  instructions text,
  date date default current_date not null
);

-- Enable RLS for prescriptions
alter table public.prescriptions enable row level security;

-- 6. Create PAYMENTS table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded')),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  payment_method text not null
);

-- Enable RLS for payments
alter table public.payments enable row level security;

-- 7. Create SCHEDULES table (Operational shifts if needed)
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  doctor_id uuid references public.users(id) on delete cascade not null,
  day_of_week text not null,
  start_time text not null,
  end_time text not null
);

-- Enable RLS for schedules
alter table public.schedules enable row level security;

-- 8. Create NOTIFICATIONS table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for notifications
alter table public.notifications enable row level security;


-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES EXAMPLE Setup
-- ================================================

-- Users Policies
create policy "Users can view their own profile or public doc profiles"
  on public.users for select
  using (auth.uid() = id or role = 'doctor');

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Patient Profiles Policies
create policy "Patients can manage their own medical details"
  on public.patients for all
  using (auth.uid() = id);

create policy "Doctors can view relevant patient profiles"
  on public.patients for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role in ('doctor', 'admin')
  ));

-- Doctors Profiles Policies
create policy "Anyone can view approved doctor profiles"
  on public.doctors for select
  using (approved = true or auth.uid() = id or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Doctors can update their own details"
  on public.doctors for update
  using (auth.uid() = id);

-- Appointments Policies
create policy "Users can read their own appointments"
  on public.appointments for select
  using (auth.uid() = patient_id or auth.uid() = doctor_id or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create policy "Patients can create appointments"
  on public.appointments for insert
  with check (auth.uid() = patient_id);

create policy "Users can update their own appointments"
  on public.appointments for update
  using (auth.uid() = patient_id or auth.uid() = doctor_id or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- Prescriptions Policies
create policy "Patient or doctor can read prescription"
  on public.prescriptions for select
  using (auth.uid() = patient_id or auth.uid() = doctor_id);

create policy "Doctor can issue prescription"
  on public.prescriptions for insert
  with check (auth.uid() = doctor_id);

-- Notifications Policies
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
