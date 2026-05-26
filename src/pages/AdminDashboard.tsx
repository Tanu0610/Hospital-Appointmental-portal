/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Stethoscope, CalendarDays, DollarSign, CheckCircle2, 
  XSquare, Lock, Unlock, ArrowUpRight, BarChart3, ShieldAlert, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';

export default function AdminDashboard() {
  const { 
    getAdminData, getAdminUsers, toggleUserStatus, approveDoctor, 
    updateAppointmentStatus, appointments 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpis' | 'doctors' | 'patients' | 'appointments'>('kpis');
  
  // Dynamic analytics states
  const [kpis, setKpis] = useState({ totalBookings: 0, totalDoctors: 0, totalPatients: 0, totalRevenue: 0 });
  const [specialtiesData, setSpecialtiesData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Reload state triggers
  const [loadToggle, setLoadToggle] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getAdminData();
      if (data) {
        setKpis(data.kpis);
        setSpecialtiesData(data.specialtyDistribution || []);
        setTrendData(data.bookingTrend || []);
      }
      const uList = await getAdminUsers();
      setUsersList(uList);
    }
    loadData();
  }, [loadToggle]);

  const handleToggleBlock = async (id: string) => {
    const success = await toggleUserStatus(id);
    if (success) setLoadToggle(prev => !prev);
  };

  const handleApproveDoctorSpec = async (id: string) => {
    const success = await approveDoctor(id);
    if (success) setLoadToggle(prev => !prev);
  };

  const adminDoctors = usersList.filter(u => u.role === 'doctor');
  const adminPatients = usersList.filter(u => u.role === 'patient');

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Admin Title Board */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white mb-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-medical-600/30 to-slate-950/25 pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              SYSTEM ROOT ADMINISTRATOR
            </span>
            <h1 className="text-3xl font-display font-bold text-white">
              Hospital Analytics & Registry Portal
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Manage clinical credential approvals, audit secure database tables, unblock user profiles, or review monthly financial statistics.
            </p>
          </div>
        </div>

        {/* Bento Board Controls */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Action Navigation Tabs */}
          <div className="lg:col-span-3 bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
            <button
              id="admin-tab-analytics"
              onClick={() => setActiveTab('kpis')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'kpis' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Strategic Analytics Hub
            </button>
            <button
              id="admin-tab-doctors"
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'doctors' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor Credentials Vetting
            </button>
            <button
              id="admin-tab-patients"
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'patients' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Patient Registry Audit
            </button>
            <button
              id="admin-tab-appointments"
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition ${
                activeTab === 'appointments' ? 'bg-medical-50 text-medical-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Universal Booking Logs
            </button>
          </div>

          {/* Core Panel Panels */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* STRATEGIC KPIS & GRAPHICS */}
            {activeTab === 'kpis' && (
              <div className="space-y-8">
                
                {/* Scorecards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gross Paid Revenue</p>
                    <p className="text-3xl font-extrabold text-slate-900">${kpis.totalRevenue?.toFixed(2)}</p>
                    <span className="text-[9px] text-emerald-600 font-medium">Synced payment records</span>
                  </div>

                  <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</p>
                    <p className="text-3xl font-extrabold text-slate-900">{kpis.totalBookings}</p>
                    <span className="text-[9px] text-sky-600 font-medium">All outpatient status fields</span>
                  </div>

                  <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Approved Physicians</p>
                    <p className="text-3xl font-extrabold text-slate-900">{kpis.totalDoctors}</p>
                    <span className="text-[9px] text-purple-600 font-medium font-mono">Verified board specialists</span>
                  </div>

                  <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Active Patients</p>
                    <p className="text-3xl font-extrabold text-slate-900">{kpis.totalPatients}</p>
                    <span className="text-[9px] text-slate-500">Demographic profiles registered</span>
                  </div>

                </div>

                {/* Recharts Analytics Displays */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Monthly Trend Specialty Line chart */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4 text-left">
                    <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-widest">Monthly Booking Trend line</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="appointments" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Specialization distributions Bar Chart */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4 text-left">
                    <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-widest">Bookings by Focus Specialty</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={specialtiesData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#024e84" name="Slots Reserved" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* DOCTORS VERIFICATION LIST */}
            {activeTab === 'doctors' && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                <main className="border-b pb-3 space-y-1 text-left">
                  <h3 className="text-lg font-display font-bold text-slate-900">Physicians Credentials Vetting Drawer</h3>
                  <p className="text-xs text-slate-500">Review doctors bio descriptions and toggle approve to authorize additions to the publicCertified Specialists active directory.</p>
                </main>

                <div className="space-y-4">
                  {adminDoctors.map(doc => (
                    <div key={doc.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 hover:border-slate-350 transition flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="text-left space-y-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={doc.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&q=80'}
                            alt={doc.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-display font-bold text-base text-slate-900">{doc.name}</h4>
                            <p className="text-[10px] text-slate-450 font-mono italic">{doc.email}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500">Specialty focus: <span className="font-bold text-slate-700">{doc.details?.specialization || 'Clinical'}</span> • Clinic: {doc.details?.hospital} • Fee: ${doc.details?.appointment_fee}</p>
                        
                        {doc.details?.bio && (
                          <p className="text-xs bg-white border p-2.5 rounded-xl text-slate-550 italic leading-relaxed">
                            "{doc.details.bio}"
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2.5">
                        {/* Approval trigger */}
                        {!doc.details?.approved ? (
                          <button
                            id={`btn-admin-approve-${doc.id}`}
                            onClick={() => handleApproveDoctorSpec(doc.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve Specialist</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Roster Approved</span>
                          </span>
                        )}

                        {/* Block / Unblock togglers */}
                        <button
                          id={`btn-block-doc-${doc.id}`}
                          onClick={() => handleToggleBlock(doc.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                            doc.status === 'blocked'
                              ? 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700'
                              : 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700'
                          }`}
                        >
                          {doc.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          <span>{doc.status === 'blocked' ? 'Unblock' : 'Block Account'}</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {adminDoctors.length === 0 && (
                    <p className="text-slate-400 py-6 text-center text-sm">No registered doctors registered in the system yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* PATIENTS DATA AUDIT */}
            {activeTab === 'patients' && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                <main className="border-b pb-3 space-y-1 text-left">
                  <h3 className="text-lg font-display font-bold text-slate-900">Patients Registry Audit</h3>
                  <p className="text-xs text-slate-500">View outpatient demographic entries, blood types, phones, and lock/unlock profiles instantly.</p>
                </main>

                <div className="space-y-4">
                  {adminPatients.map(pat => (
                    <div key={pat.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 hover:border-slate-350 transition flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="text-left space-y-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={pat.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'}
                            alt={pat.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-display font-medium text-base text-slate-900">{pat.name}</h4>
                            <p className="text-[10px] text-slate-450 font-mono">{pat.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 text-xs text-slate-500">
                          <span>Phone: {pat.details?.phone || 'Not provided'}</span>
                          <span>DOB: {pat.details?.date_of_birth || 'Not registered'}</span>
                          <span>Gender: {pat.details?.gender || 'N/A'}</span>
                          <span className="font-bold text-slate-800 bg-white border rounded px-1.5 py-0.5">Blood: {pat.details?.blood_type || 'Unknown'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* Status label banner */}
                        <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1 ${
                          pat.status === 'blocked' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {pat.status === 'blocked' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span>{pat.status}</span>
                        </span>

                        <button
                          id={`btn-block-patient-${pat.id}`}
                          onClick={() => handleToggleBlock(pat.id)}
                          className="bg-white border hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Modify Block Hold
                        </button>
                      </div>
                    </div>
                  ))}

                  {adminPatients.length === 0 && (
                    <p className="text-slate-450 text-center py-6 text-sm">No registered outpatients found in the database directory.</p>
                  )}
                </div>
              </div>
            )}

            {/* UNIVERSAL BOOKING LOGS */}
            {activeTab === 'appointments' && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                <main className="border-b pb-3 space-y-1 text-left">
                  <h3 className="text-lg font-display font-bold text-slate-900">Hospital Universal Booking logs</h3>
                  <p className="text-xs text-slate-500">Check comprehensive doctor shift coordinates and revoke booking status if clinic exceptions occur.</p>
                </main>

                <div className="space-y-4">
                  {appointments.map(apt => (
                    <div key={apt.id} className="bg-slate-50 border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-left space-y-1">
                        <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Appointment ID: #{apt.id}</p>
                        <h4 className="font-display font-bold text-base text-slate-900">Patient: {apt.patient_name}</h4>
                        <p className="text-xs text-slate-500">Vetted Doctor: <span className="font-bold">{apt.doctor_name} ({apt.specialization})</span></p>
                        <div className="flex gap-3 text-xs text-slate-400 font-medium">
                          <span>{apt.date} at {apt.time_slot}</span>
                          <span className="text-xs font-bold text-slate-700">Fee Charged: ${apt.fee}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold font-mono uppercase px-2 py-1 rounded border ${
                          apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          apt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {apt.status}
                        </span>

                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            id={`btn-admin-cancel-${apt.id}`}
                            onClick={async () => {
                              if (confirm("System-override: Lock cancellation on this appointment slot?")) {
                                await updateAppointmentStatus(apt.id, 'cancelled');
                                setLoadToggle(prev => !prev);
                              }
                            }}
                            className="text-xs font-semibold px-3 py-1 bg-rose-50 hover:bg-rose-105 rounded-xl border border-rose-200 text-rose-700 transition cursor-pointer"
                          >
                            Force Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {appointments.length === 0 && (
                    <p className="text-slate-450 py-6 text-center text-sm">No appointment reservation sessions created yet in hospital registers.</p>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
