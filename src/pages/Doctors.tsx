/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Star, Building2, Stethoscope, ArrowRight, ShieldAlert, Award } from 'lucide-react';

export default function Doctors() {
  const { doctors, user } = useApp();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('All');

  // Dynamically extract specializations for filter tags
  const availableSpecs: string[] = ['All', ...Array.from(new Set<string>(doctors.filter(d => d.approved).map(d => d.specialization)))];

  // Filter approved doctors
  const approvedDocs = doctors.filter(doctor => {
    const isApproved = doctor.approved;
    const matchesSearch = doctor.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = specFilter === 'All' || doctor.specialization === specFilter;
    return isApproved && matchesSearch && matchesSpec;
  });

  const handleBookClick = (doctor: any) => {
    if (!user) {
      navigate('/auth?register=true');
    } else {
      navigate('/dashboard/patient?book_doctor=' + doctor.id);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-12">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-medical-600 bg-medical-50 border border-medical-200 px-3 py-1 rounded-full uppercase">
              Roster Directory
            </span>
            <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
              Meet Our Board-Certified Specialists
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Every practicing physician has been thoroughly vetted by Medicare administrators. Select a specialist to book an outpatient slot instantly.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 text-sm w-fit self-start md:self-auto">
            <div className="p-2.5 bg-sky-50 rounded-xl">
              <Award className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Practicing</p>
              <p className="font-bold text-slate-800 text-base">{doctors.filter(d => d.approved).length} Specialities</p>
            </div>
          </div>
        </div>

        {/* Filter Widget */}
        <div className="grid md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by doctor's name or clinical focus..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 outline-none text-sm text-slate-800 focus:border-medical-500 focus:bg-white transition"
            />
          </div>
          <div className="md:col-span-6 flex items-center gap-2 overflow-x-auto py-1 whitespace-nowrap">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Filter:</span>
            {availableSpecs.map(spec => (
              <button
                key={spec}
                id={`btn-spec-${spec.toLowerCase()}`}
                onClick={() => setSpecFilter(spec)}
                className={`text-xs px-3.5 py-2 rounded-xl border text-slate-600 font-semibold cursor-pointer transition ${
                  specFilter === spec
                    ? 'bg-medical-600 text-white border-medical-600'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Cards */}
        {approvedDocs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-150 rounded-3xl space-y-4">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-display font-semibold text-lg text-slate-800">No Specialists Search Match Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              We couldn't locate any approved doctors fitting "{searchTerm || specFilter}". Try clearing search filters or picking another speciality segment.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {approvedDocs.map(doc => (
              <div key={doc.id} className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                
                {/* Visual Header */}
                <div className="p-6 text-left space-y-4 flex-1">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80'}
                      alt={doc.user_name}
                      className="w-14 h-14 rounded-xl object-cover border bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        <Stethoscope className="w-3 h-3" />
                        {doc.specialization}
                      </span>
                      <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">
                        {doc.user_name}
                      </h3>
                      {/* Rating */}
                      <span className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {doc.rating?.toFixed(1) || '5.0'}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mt-2 line-clamp-3">
                    {doc.bio}
                  </p>

                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-xs">
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                      <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      {doc.hospital}
                    </span>
                  </div>
                </div>

                {/* Booking Purchase Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">CONSULT FEE</span>
                    <span className="text-xl font-bold text-slate-800">${doc.appointment_fee}</span>
                  </div>
                  <button
                    id={`btn-book-${doc.id}`}
                    onClick={() => handleBookClick(doc)}
                    className="bg-medical-600 hover:bg-medical-700 text-white font-medium text-xs px-4.5 py-2.5 rounded-xl shadow cursor-pointer hover:shadow-md transition flex items-center gap-1.5"
                  >
                    <span>Secure Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
