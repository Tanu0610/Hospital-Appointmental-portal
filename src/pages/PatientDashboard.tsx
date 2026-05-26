/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Calendar, Clock, User, Clipboard, Pill, CreditCard, ChevronRight, 
  MapPin, Phone, RefreshCw, XCircle, FileText, CheckCircle2, UserCheck, AlertCircle 
} from 'lucide-react';

export default function PatientDashboard() {
  const { 
    user, doctors, appointments, bookAppointment, rescheduleAppointment, 
    updateAppointmentStatus, updatePatientProfile, notifications 
  } = useApp();

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'history' | 'profile'>('overview');

  // Book Appointment State
  const [selectedDocId, setSelectedDocId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Active Rescheduling State
  const [rescheduleAptId, setRescheduleAptId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');

  // Selected Prescription Modal
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [selectedReceiptApt, setSelectedReceiptApt] = useState<any>(null);

  // Profile Form State
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodType, setBloodType] = useState('O+');
  const [phone, setPhone] = useState('');
  const [patientName, setPatientName] = useState('');

  // Auto-fill booking if navigated with ?book_doctor=ID query
  useEffect(() => {
    const docId = searchParams.get('book_doctor');
    if (docId) {
      setSelectedDocId(docId);
      setActiveTab('book');
    }
  }, [searchParams]);

  // Read Profile demographics when loaded
  useEffect(() => {
    if (user) {
      setPatientName(user.name);
      // Retrieve relevant patient profile from appointments or simulate
      const myApt = appointments.find(a => a.patient_id === user.id);
      if (myApt && myApt.patient_details) {
        setPhone(myApt.patient_details.phone || '');
        setGender(myApt.patient_details.gender || 'Male');
        setBloodType(myApt.patient_details.blood_type || 'O+');
        setDob(myApt.patient_details.date_of_birth || '');
      }
    }
  }, [user, appointments]);

  const selectedDoctorObj = doctors.find(d => d.id === selectedDocId);

  // Determine available slots based on doctor's scheduled day of week
  const getAvailableSlotsForDate = () => {
    if (!selectedDoctorObj || !bookingDate) return [];
    
    // Parse day of week
    const dateObj = new Date(bookingDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find matching doctor availability day
    const dayConfig = selectedDoctorObj.availability.find(a => a.day === dayName);
    if (!dayConfig) return [];

    // Filter out already booked slots for this doctor on this specific date
    return dayConfig.slots.filter(slot => {
      const isAlreadyBooked = appointments.some(apt => 
        apt.doctor_id === selectedDocId &&
        apt.date === bookingDate &&
        apt.time_slot === slot &&
        apt.status !== 'cancelled'
      );
      return !isAlreadyBooked;
    });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !bookingDate || !bookingSlot) return;

    const payload = {
      doctor_id: selectedDocId,
      date: bookingDate,
      time_slot: bookingSlot,
      notes,
      fee: selectedDoctorObj?.appointment_fee || 150,
      payment_method: paymentMethod,
    };

    const success = await bookAppointment(payload);
    if (success) {
      setActiveTab('history');
      // Reset State
      setSelectedDocId('');
      setBookingDate('');
      setBookingSlot('');
      setNotes('');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: patientName,
      phone,
      gender,
      blood_type: bloodType,
      date_of_birth: dob,
    };
    await updatePatientProfile(payload);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAptId || !newDate || !newSlot) return;

    const success = await rescheduleAppointment(rescheduleAptId, newDate, newSlot);
    if (success) {
      setRescheduleAptId(null);
      setNewDate('');
      setNewSlot('');
    }
  };

  const myAppointments = appointments.filter(a => a.patient_id === user?.id);
  const nextAppointment = myAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending')[0];
  const totalCompleted = myAppointments.filter(a => a.status === 'completed').length;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Welcome Dashboard Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white mb-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-medical-600/30 to-slate-950/25 pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-medical-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              Patient Account
            </span>
            <h1 className="text-3xl font-display font-bold text-white">
              Hello, {user?.name || 'Valued Patient'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Manage your clinical calendars, download active prescription guides, or review invoices instantly.
            </p>
          </div>

          <button
            id="btn-tab-book-now"
            onClick={() => setActiveTab('book')}
            className="relative z-10 bg-medical-500 hover:bg-medical-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl shadow-lg transition text-sm cursor-pointer"
          >
            Schedule New Outpatient Visit
          </button>
        </div>

        {/* Dashboard Grid Tabs */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Tabs Controls */}
          <div className="lg:col-span-3 bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
            <button
              id="sidebar-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'overview' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              Overview Hub
            </button>
            <button
              id="sidebar-tab-book"
              onClick={() => setActiveTab('book')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'book' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Book Specialist
            </button>
            <button
              id="sidebar-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'history' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              My Consultations
            </button>
            <button
              id="sidebar-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'profile' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              Medical Profile
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* OVERVIEW COMPONENT */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Outpatient Demographics KPIs */}
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Consultations</p>
                    <p className="text-3xl font-bold text-slate-900">{myAppointments.length}</p>
                    <span className="text-[10px] text-emerald-600 font-medium">({totalCompleted} fully completed sessions)</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                    <p className="text-3xl font-bold text-slate-900">{bloodType || 'Not Set'}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Profile certified label</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Active Prescriptions</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {myAppointments.filter(a => a.prescription).length}
                    </p>
                    <span className="text-[10px] text-medical-600 font-medium">(Available to view/download)</span>
                  </div>
                </div>

                {/* Upcoming Visit Callout */}
                {nextAppointment ? (
                  <div className="bg-white border-l-4 border-medical-500 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <main className="space-y-2">
                      <span className="inline-flex items-center gap-1 bg-medical-50 text-medical-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        <UserCheck className="w-3.5 h-3.5" />
                        Next Outpatient Visit
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 font-display">
                        Session with Dr. {nextAppointment.doctor_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {nextAppointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {nextAppointment.time_slot}
                        </span>
                        <span className="font-semibold text-medical-600 uppercase font-mono text-[10px] bg-sky-50 px-1.5 py-0.5 rounded">
                          {nextAppointment.status}
                        </span>
                      </div>
                    </main>

                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-xs font-bold text-medical-600 hover:text-medical-800 transition flex items-center gap-1"
                    >
                      <span>Manage this visit</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border p-10 text-center space-y-4">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-display font-semibold text-lg text-slate-800">No Outpatient Visits Booked</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                      You do not have any upcoming doctor consultations. If you need clinical counseling or prescription reviews, search our active directory and schedule a slot.
                    </p>
                  </div>
                )}

                {/* Interactive Notifications block */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-base text-slate-800">Recent Account Alerts</h4>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notif, index) => (
                      <div key={index} className="flex gap-3 text-xs p-3.5 bg-slate-50 border rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800">{notif.title}</p>
                          <p className="text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-slate-400 text-xs py-2 text-center">No alerts recorded on this profile yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* BOOKING FLOW COMPONENT */}
            {activeTab === 'book' && (
              <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b pb-4 space-y-1">
                  <h3 className="text-xl font-display font-bold text-slate-900">Clinical Scheduling Panel</h3>
                  <p className="text-xs text-slate-500">Pick an approved medical specialist, select your date, pick a free slot hour, and pre-authorise transaction fees securely.</p>
                </div>

                <form onSubmit={handleCreateAppointment} className="space-y-6">
                  
                  {/* Select Doctor Specialist */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">1. Approved Specialities & Physicians</label>
                    <select
                      required
                      value={selectedDocId}
                      onChange={e => {
                        setSelectedDocId(e.target.value);
                        setBookingDate('');
                        setBookingSlot('');
                      }}
                      className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-500 px-4 py-3 rounded-xl outline-none text-sm font-medium text-slate-800"
                    >
                      <option value="">-- Choose Specialist --</option>
                      {doctors.filter(d => d.approved).map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.user_name} ({doc.specialization}) - {doc.hospital} - ${doc.appointment_fee} Fee
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDoctorObj && (
                    <div className="bg-slate-50 border rounded-2xl p-4 text-xs space-y-2 text-slate-600">
                      <p className="font-bold text-slate-800 uppercase tracking-wide">Doctor Clinical Shift Timing Availability:</p>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedDoctorObj.availability.map((av, idx) => (
                          <div key={idx} className="bg-white border rounded-lg p-2.5">
                            <p className="font-bold text-slate-700">{av.day}</p>
                            <p className="text-[10px] text-slate-500 mt-1">Practice Hours: {av.slots.join(', ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booking Date */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">2. Select Calendar Date</label>
                      <input
                        type="date"
                        required
                        disabled={!selectedDocId}
                        value={bookingDate}
                        onChange={e => {
                          setBookingDate(e.target.value);
                          setBookingSlot('');
                        }}
                        className="bg-slate-50 border border-slate-200 disabled:opacity-50 px-4 py-2.5 rounded-xl outline-none text-sm font-medium text-slate-800"
                      />
                    </div>

                    {/* Available Slot Hours */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">3. Choose Hour Slot (Anti-conflict validation)</label>
                      <select
                        required
                        disabled={!bookingDate}
                        value={bookingSlot}
                        onChange={e => setBookingSlot(e.target.value)}
                        className="bg-slate-50 border border-slate-200 disabled:opacity-50 px-4 py-3 rounded-xl outline-none text-sm font-medium text-slate-800"
                      >
                        <option value="">-- Choose Slot --</option>
                        {getAvailableSlotsForDate().map(slot => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      {bookingDate && getAvailableSlotsForDate().length === 0 && (
                        <p className="text-[10px] text-rose-500 font-semibold leading-relaxed">
                          No practice shifts defined for this weekday by Dr. {selectedDoctorObj?.user_name}, or all options are booked. Try another weekday!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes & Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Brief Outpatient Complaint Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Chronic migraine since 3 days, reviewing prior medication dosage list..."
                      className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none text-sm font-medium text-slate-800"
                    />
                  </div>

                  {/* Fees & Payment Block */}
                  {selectedDoctorObj && (
                    <div className="border border-slate-150 rounded-2xl p-5 bg-sky-50/25 grid sm:grid-cols-12 gap-6 items-center">
                      <div className="sm:col-span-6 space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase">Premium Invoice Due Now</p>
                        <p className="text-3xl font-bold text-slate-900">${selectedDoctorObj.appointment_fee.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">Includes secure Supabase auth verification stamp</p>
                      </div>

                      <div className="sm:col-span-6 flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Consultation Payment Option</label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value)}
                          className="bg-white border rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          <option value="Credit Card">Credit Card Processing (Simulated)</option>
                          <option value="PayPal">PayPal Check</option>
                          <option value="Insurance Cover">Direct Insurance Cover Policy</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    id="btn-confirm-booking"
                    type="submit"
                    disabled={!bookingSlot}
                    className="w-full bg-medical-600 hover:bg-medical-700 disabled:bg-slate-300 text-white font-medium text-sm py-4 rounded-xl cursor-pointer shadow hover:shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Authorize Payment & Reserve Outpatient Slot</span>
                  </button>

                </form>
              </div>
            )}

            {/* WORKFLOW / CONSULTATION LOGS COMPONENT */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-1">
                  <h3 className="text-lg font-display font-bold text-slate-900">Your Consultations & Diagnostic Logs</h3>
                  <p className="text-xs text-slate-500">Review status updates, write complaints, reschedule pending timers, or print PDF digital prescriptions/receipts.</p>
                </div>

                {/* Main list */}
                <div className="space-y-4">
                  {myAppointments.map(apt => (
                    <div key={apt.id} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition">
                      <div className="text-left space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-slate-900">Dr. {apt.doctor_name}</h4>
                          <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                            apt.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                            apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            apt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {apt.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium">Specialization: {apt.specialization} • {apt.hospital}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-slate-300" />
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-300" />
                            {apt.time_slot}
                          </span>
                          <span className="font-bold text-slate-800">
                            Fee Paid: ${apt.fee}
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-500 max-w-xl italic mt-3 leading-relaxed">
                            "Notes: {apt.notes}"
                          </p>
                        )}
                      </div>

                      {/* Interactive Triggers */}
                      <div className="flex flex-row md:flex-col lg:flex-row gap-2 mt-4 md:mt-0 flex-wrap">
                        
                        {/* Download invoice receipt */}
                        <button
                          id={`btn-receipt-${apt.id}`}
                          onClick={() => setSelectedReceiptApt(apt)}
                          className="bg-slate-50 hover:bg-slate-100 border text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>Receipt Invoice</span>
                        </button>

                        {/* Prescriptions View if available */}
                        {apt.prescription ? (
                          <button
                            id={`btn-rx-${apt.id}`}
                            onClick={() => setSelectedPrescription(apt.prescription)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Pill className="w-4 h-4" />
                            <span>View Rx Prescription</span>
                          </button>
                        ) : apt.status === 'completed' ? (
                          <span className="text-xs text-slate-400 p-2 font-mono">No medicine card attached</span>
                        ) : null}

                        {/* Reschedule Button */}
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            id={`btn-resched-${apt.id}`}
                            onClick={() => {
                              setRescheduleAptId(apt.id);
                              // Lookup matching doctor
                              setSelectedDocId(apt.doctor_id);
                            }}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                            <span>Reschedule</span>
                          </button>
                        )}

                        {/* Cancellation button */}
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            id={`btn-cancel-${apt.id}`}
                            onClick={async () => {
                              if (confirm("Are you sure you want to cancel this appointment and request a refund?")) {
                                await updateAppointmentStatus(apt.id, 'cancelled');
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        )}

                      </div>
                    </div>
                  ))}

                  {myAppointments.length === 0 && (
                    <div className="bg-white border rounded-2xl p-10 text-center space-y-4">
                      <p className="text-slate-400 text-sm">No outpatient visits recorded yet on this profile. Schedule standard slot consultations under Book tab!</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* MEDICAL DEMOGRAPHICS PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b pb-4 space-y-1">
                  <h3 className="text-xl font-display font-bold text-slate-900">Medical Demographics Profile</h3>
                  <p className="text-xs text-slate-500">Provide legal values and vital types so outpatient medical doctors obtain high accuracy profiles prior to scheduling calls.</p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Your Profile Name</label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none text-sm font-medium text-slate-800 focus:bg-white focus:border-medical-500"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Telephone Line</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 754-0012"
                        className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none text-sm font-medium text-slate-800 focus:bg-white focus:border-medical-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Legal Gender</label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Blood Group</label>
                      <select
                        value={bloodType}
                        onChange={e => setBloodType(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl outline-none text-sm font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-save-patient-profile"
                    type="submit"
                    className="bg-medical-600 hover:bg-medical-700 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Demographics Registry</span>
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ----------------- SUB-MODALS SYSTEM ----------------- */}

      {/* 1. RESCHEDULE MODAL */}
      {rescheduleAptId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border shadow-2xl space-y-6 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-semibold text-lg text-slate-900">Select New Consulting Shift</h3>
              <button onClick={() => setRescheduleAptId(null)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">New Desired Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={e => {
                    setNewDate(e.target.value);
                    setNewSlot('');
                  }}
                  className="bg-slate-50 border px-4 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">New Desired Slot Hour</label>
                <select
                  required
                  disabled={!newDate}
                  value={newSlot}
                  onChange={e => setNewSlot(e.target.value)}
                  className="bg-slate-50 border p-3 rounded-xl text-sm disabled:opacity-50"
                >
                  <option value="">-- Choose Slot --</option>
                  {getAvailableSlotsForDate().map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setRescheduleAptId(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Close Modal
                </button>
                <button
                  id="btn-confirm-resched"
                  type="submit"
                  disabled={!newSlot}
                  className="px-5 py-2 bg-medical-600 hover:bg-medical-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  Confirm Slot Alteration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DIGITAL PRESCRIPTION VIEWER POPUP */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border shadow-2xl text-left space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded border border-emerald-200 uppercase flex items-center gap-1">
                <Pill className="w-3.5 h-3.5" />
                Digital Medicare Rx Card
              </span>
              <button onClick={() => setSelectedPrescription(null)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-b pb-4">
                <div>
                  <p className="font-bold text-slate-400">PATIENT NAME</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{user?.name}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400">DATE ISSUED</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPrescription.date}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400">DIAGNOSIS FOCUS</p>
                <p className="text-sm font-semibold text-slate-800 font-display">{selectedPrescription.diagnosis}</p>
              </div>

              {/* Medications grid list */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400">MEDICATION SUMMARY SCHEDULE</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedPrescription.medications?.map((m: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {m.name} ({m.dosage})
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{m.frequency}</p>
                      </div>
                      <span className="font-mono bg-white px-2 py-0.5 border rounded text-slate-600 font-semibold">{m.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.instructions && (
                <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-3.5 text-xs text-slate-600 mt-2">
                  <p className="font-bold text-slate-800">Clinical Advice Instructions:</p>
                  <p className="mt-1 leading-relaxed italic">"{selectedPrescription.instructions}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="bg-slate-900 text-white font-medium text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECEIPT INVOICE COMPONENT */}
      {selectedReceiptApt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border shadow-2xl text-left space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-semibold text-lg text-slate-900">Receipt Invoice</h3>
              <button onClick={() => setSelectedReceiptApt(null)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            {/* Receipt body */}
            <div className="space-y-4 font-mono text-xs text-slate-600">
              <div className="text-center space-y-1 py-2 border-b-2 border-dashed">
                <p className="text-sm font-bold text-slate-850 uppercase">MEDICARE REVENUE CENTER</p>
                <p className="text-[10px] text-slate-400">TRANS_REF: #{selectedReceiptApt.id}</p>
                <p className="text-[10px] text-slate-400">DATE: {new Date(selectedReceiptApt.created_at).toLocaleString()}</p>
              </div>

              <div className="space-y-2 border-b border-dashed pb-3">
                <div className="flex justify-between">
                  <span>PATIENT:</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLINIC SPECIALIST:</span>
                  <span className="font-bold text-slate-800">Dr. {selectedReceiptApt.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>SPECIALIZATION:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptApt.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span>HOSPITAL BRANCH:</span>
                  <span className="font-bold text-slate-850 break-all">{selectedReceiptApt.hospital}</span>
                </div>
                <div className="flex justify-between">
                  <span>APPOINTMENT TIMESLOT:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptApt.date} at {selectedReceiptApt.time_slot}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm pt-2 font-bold text-slate-900">
                <span>TOTAL PAID FEE:</span>
                <span>${selectedReceiptApt.fee.toFixed(2)}</span>
              </div>

              <div className="bg-emerald-50 text-emerald-800 border rounded-xl p-3 text-center text-[10px] font-bold">
                ● PAID SUCCESSFULLY • TRANSACTION CERTIFIED BY SUPABASE SECURE PAY
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Send to Printer Device
              </button>
              <button
                onClick={() => setSelectedReceiptApt(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow"
              >
                Cancel View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
