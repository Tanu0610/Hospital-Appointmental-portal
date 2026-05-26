/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clipboard, Calendar, Clock, UserCheck, Check, X, FileText, 
  Pill, HeartPulse, Settings, DollarSign, Plus, Trash2, CheckCircle2, AlertTriangle, Stethoscope 
} from 'lucide-react';

export default function DoctorDashboard() {
  const { 
    user, doctors, appointments, updateAppointmentStatus, 
    updateDoctorProfile, createPrescription 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'profile'>('appointments');

  // Selected Appointment for writing prescription
  const [rxAptId, setRxAptId] = useState<string | null>(null);
  const [rxPatientId, setRxPatientId] = useState<string>('');
  const [rxPatientName, setRxPatientName] = useState<string>('');
  
  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicationInput, setMedicationInput] = useState({ name: '', dosage: '', frequency: '', duration: '' });
  const [medicationsList, setMedicationsList] = useState<{ name: string; dosage: string; frequency: string; duration: string }[]>([]);

  // Timing/Shift calendar settings
  const [docAvailability, setDocAvailability] = useState<{ day: string; slots: string[] }[]>([]);

  // Profile Form state
  const [specialization, setSpecialization] = useState('General Medicine');
  const [hospital, setHospital] = useState('');
  const [bio, setBio] = useState('');
  const [fee, setFee] = useState(150);
  const [doctorName, setDoctorName] = useState('');

  const currentDoctorProfile = doctors.find(d => d.id === user?.id);

  // Sync state with backend profile once loaded
  useEffect(() => {
    if (user && currentDoctorProfile) {
      setDoctorName(user.name);
      setSpecialization(currentDoctorProfile.specialization);
      setHospital(currentDoctorProfile.hospital);
      setBio(currentDoctorProfile.bio);
      setFee(currentDoctorProfile.appointment_fee);
      setDocAvailability(currentDoctorProfile.availability || []);
    }
  }, [user, currentDoctorProfile]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: doctorName,
      specialization,
      hospital,
      bio,
      appointment_fee: Number(fee)
    };
    await updateDoctorProfile(payload);
  };

  const handleAddMedication = () => {
    if (medicationInput.name && medicationInput.dosage && medicationInput.frequency) {
      setMedicationsList(prev => [...prev, medicationInput]);
      setMedicationInput({ name: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const handleRemoveMedication = (idx: number) => {
    setMedicationsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxAptId || !rxPatientId || !diagnosis || medicationsList.length === 0) return;

    const payload = {
      appointment_id: rxAptId,
      patient_id: rxPatientId,
      diagnosis,
      medications: medicationsList,
      instructions,
    };

    const success = await createPrescription(payload);
    if (success) {
      setRxAptId(null);
      setDiagnosis('');
      setInstructions('');
      setMedicationsList([]);
    }
  };

  const handleAddAvailabilitySlot = (day: string, slot: string) => {
    setDocAvailability(prev => {
      const matchIdx = prev.findIndex(item => item.day === day);
      if (matchIdx !== -1) {
        const currentSlots = prev[matchIdx].slots;
        if (!currentSlots.includes(slot)) {
          const updated = [...prev];
          updated[matchIdx].slots = [...currentSlots, slot].sort();
          return updated;
        }
        return prev;
      } else {
        return [...prev, { day, slots: [slot] }];
      }
    });
  };

  const handleRemoveAvailabilitySlot = (day: string, slot: string) => {
    setDocAvailability(prev => {
      const matchIdx = prev.findIndex(item => item.day === day);
      if (matchIdx !== -1) {
        const updated = [...prev];
        updated[matchIdx].slots = prev[matchIdx].slots.filter(s => s !== slot);
        if (updated[matchIdx].slots.length === 0) {
          return updated.filter(item => item.day !== day);
        }
        return updated;
      }
      return prev;
    });
  };

  const handleSaveAvailability = async () => {
    const payload = {
      availability: docAvailability
    };
    await updateDoctorProfile(payload);
  };

  const doctorAppointments = appointments.filter(a => a.doctor_id === user?.id);
  const pendingCount = doctorAppointments.filter(a => a.status === 'pending').length;
  const confirmedCount = doctorAppointments.filter(a => a.status === 'confirmed').length;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const potentialSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Banner Details */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white mb-10 overflow-hidden relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-medical-600/30 to-slate-950/25 pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              Certified Specialist Profile
            </span>
            <h1 className="text-3xl font-display font-bold text-white">
              Welcome, Dr. {doctorName || 'Practice'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Define your flexible practice hourly shifts, approve outpatient visits, or issue drug prescription cards.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 px-5 py-4 border border-white/10 rounded-2xl flex items-center gap-4 text-xs">
            {currentDoctorProfile?.approved ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Roster Credentials Approved</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Awaiting Admin Signoff</span>
              </div>
            )}
          </div>
        </div>

        {/* Bento Dashboard Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Tab Sidebar Nav */}
          <div className="lg:col-span-3 bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
            <button
              id="doc-tab-appointments"
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'appointments' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              My Clinical Consultations
            </button>
            <button
              id="doc-tab-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'schedule' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Practice Shifts Availability
            </button>
            <button
              id="doc-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'profile' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Clinical Desk Bio
            </button>
          </div>

          {/* Core Panel Content */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* APPOINTMENTS COMPONENT */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                
                {/* Stats board */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pending Approvals</p>
                    <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
                    <span className="text-[10px] text-amber-600 font-medium">Awaiting weekday slot signoff</span>
                  </div>
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Confirmed Schedules</p>
                    <p className="text-3xl font-bold text-slate-900">{confirmedCount}</p>
                    <span className="text-[10px] text-emerald-600 font-medium">Upcoming certified visits</span>
                  </div>
                </div>

                {/* Consultation records list */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-base text-slate-900 border-b pb-3 mb-2">Clinic Consultations Register</h3>
                  
                  <div className="space-y-4">
                    {doctorAppointments.map(apt => (
                      <div key={apt.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 hover:border-slate-350 transition text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-base text-slate-800">{apt.patient_name}</h4>
                            <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                              apt.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                              apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              apt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {apt.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.time_slot}</span>
                            {apt.patient_details?.gender && (
                              <span className="bg-white px-2 py-0.5 border rounded">
                                {apt.patient_details.gender} • Blood: {apt.patient_details.blood_type}
                              </span>
                            )}
                          </div>

                          {apt.notes && (
                            <p className="text-xs bg-white border p-2 rounded-xl text-slate-500 max-w-xl italic mt-2">
                              "Patient complaint: {apt.notes}"
                            </p>
                          )}
                        </div>

                        {/* Actions block */}
                        <div className="flex gap-2 flex-wrap pb-2">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                id={`btn-approve-${apt.id}`}
                                onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                className="bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                <span>Confirm Visit</span>
                              </button>
                              <button
                                id={`btn-reject-${apt.id}`}
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="bg-rose-50 hover:bg-rose-150 text-rose-600 border border-rose-100 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {apt.status === 'confirmed' && (
                            <button
                              id={`btn-issue-rx-open-${apt.id}`}
                              onClick={() => {
                                setRxAptId(apt.id);
                                setRxPatientId(apt.patient_id);
                                setRxPatientName(apt.patient_name || 'Patient');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                            >
                              <Pill className="w-4 h-4" />
                              <span>Create Prescription Card</span>
                            </button>
                          )}

                          {apt.status === 'completed' && apt.prescription && (
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-xl">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Medicine Prescribed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {doctorAppointments.length === 0 && (
                      <p className="text-slate-405 text-sm py-8 text-center bg-slate-50 rounded-2xl">No outpatient visits are scheduled yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* SCHEDULE TIMESLOT GENERATOR */}
            {activeTab === 'schedule' && (
              <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <main className="border-b pb-4 space-y-1">
                  <h3 className="text-xl font-display font-bold text-slate-900">Declare Shifts Calendar Availability</h3>
                  <p className="text-xs text-slate-500">Pick clinical days and choose hour segments representing your availability so patients can schedule reservations.</p>
                </main>

                <div className="space-y-6">
                  {daysOfWeek.map(day => {
                    const activeDayConfig = docAvailability.find(cfg => cfg.day === day);
                    const activeSlots = activeDayConfig?.slots || [];

                    return (
                      <div key={day} className="border-b pb-4 last:border-0 text-left space-y-3">
                        <h4 className="font-display font-bold text-sm text-slate-800">{day}</h4>
                        <div className="flex flex-wrap gap-2">
                          {potentialSlots.map(slot => {
                            const isAssigned = activeSlots.includes(slot);

                            return (
                              <button
                                key={slot}
                                id={`btn-avail-${day}-${slot}`}
                                onClick={() => {
                                  if (isAssigned) {
                                    handleRemoveAvailabilitySlot(day, slot);
                                  } else {
                                    handleAddAvailabilitySlot(day, slot);
                                  }
                                }}
                                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                                  isAssigned 
                                    ? 'bg-medical-600 text-white border-medical-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    id="btn-save-availability"
                    onClick={handleSaveAvailability}
                    className="bg-medical-700 hover:bg-medical-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow cursor-pointer transition flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Active Calendar Shifts</span>
                  </button>
                </div>
              </div>
            )}

            {/* PROFILE BIO UPDATE */}
            {activeTab === 'profile' && (
              <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b pb-4 space-y-1">
                  <h3 className="text-xl font-display font-bold text-slate-900">Specialist Clinical Bio & Parameters</h3>
                  <p className="text-xs text-slate-500">Update consultation credentials displayed to patients researching the roster clinics.</p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Your Professional Name</label>
                      <input
                        type="text"
                        required
                        value={doctorName}
                        onChange={e => setDoctorName(e.target.value)}
                        className="bg-slate-50 border px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-medical-500"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Medical Specialty focus</label>
                      <select
                        value={specialization}
                        onChange={e => setSpecialization(e.target.value)}
                        className="bg-slate-50 border p-2.5 rounded-xl text-sm"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Practicing Hospital Center</label>
                      <input
                        type="text"
                        required
                        value={hospital}
                        onChange={e => setHospital(e.target.value)}
                        className="bg-slate-50 border px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 Outline-none focus:bg-white focus:border-medical-500"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        Desk Consulting fee ($USD)
                      </label>
                      <input
                        type="number"
                        required
                        value={fee}
                        onChange={e => setFee(Number(e.target.value))}
                        className="bg-slate-50 border px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-medical-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Specialist Biography Summary</label>
                    <textarea
                      rows={4}
                      required
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="bg-slate-50 border px-4 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-medical-500"
                    />
                  </div>

                  <button
                    id="btn-save-doc-profile"
                    type="submit"
                    className="bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Specialist Resume</span>
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* -------------------- PRESCRIPTION WRITER MODAL -------------------- */}
      {rxAptId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border shadow-2xl text-left space-y-6 animate-fade-in my-8 ">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                <Pill className="w-4 h-4" />
                Prescribe Medication: {rxPatientName}
              </span>
              <button onClick={() => setRxAptId(null)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Diagnosis Statement</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Mild Hypertension & Arterial Strain reviews"
                  className="bg-slate-50 border px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800"
                />
              </div>

              {/* Add medication line */}
              <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Add Medication Lines</p>
                
                <div className="grid sm:grid-cols-2 gap-3 pb-2">
                  <input
                    type="text"
                    placeholder="Dry Chemical Name (e.g. Lisinopril)"
                    value={medicationInput.name}
                    onChange={e => setMedicationInput(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white border text-slate-800 px-3 py-2 rounded-lg text-xs font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Dose Line (e.g. 10mg)"
                    value={medicationInput.dosage}
                    onChange={e => setMedicationInput(prev => ({ ...prev, dosage: e.target.value }))}
                    className="bg-white border text-slate-800 px-3 py-2 rounded-lg text-xs font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g. Once daily after meals)"
                    value={medicationInput.frequency}
                    onChange={e => setMedicationInput(prev => ({ ...prev, frequency: e.target.value }))}
                    className="bg-white border text-slate-800 px-3 py-2 rounded-lg text-xs font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Course Hours Duration (e.g. 30 Days)"
                    value={medicationInput.duration}
                    onChange={e => setMedicationInput(prev => ({ ...prev, duration: e.target.value }))}
                    className="bg-white border text-slate-800 px-3 py-2 rounded-lg text-xs font-medium"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Medicine Line</span>
                </button>
              </div>

              {/* Medication Lists display */}
              {medicationsList.length > 0 && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-500 uppercase">Issued Recipe Summary:</p>
                  <div className="space-y-2">
                    {medicationsList.map((med, index) => (
                      <div key={index} className="bg-white border rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{med.name} ({med.dosage})</p>
                          <p className="text-[10px] text-slate-500">{med.frequency} • {med.duration}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(index)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Precautionary Clinical Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g. Check repeating serum sodium in 6 weeks. Engulf capsule with water daily."
                  className="bg-slate-50 border px-4 py-2 rounded-xl text-sm font-medium text-slate-800"
                />
              </div>

              <div className="border-t pt-4 flex gap-3 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setRxAptId(null)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close Panel
                </button>
                <button
                  id="btn-confirm-presc"
                  type="submit"
                  disabled={medicationsList.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow transition"
                >
                  Confirm Medicine Prescription Card
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
