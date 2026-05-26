/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShieldCheck, Users, Activity, ExternalLink, ArrowRight, HeartPulse, Sparkles, Medal } from 'lucide-react';

export default function Home() {
  const departments = [
    { name: 'Cardiology', desc: 'Heart diagnostics, preventative cardiology, and pacemaker care.', icon: <Activity className="w-6 h-6 text-medical-600" /> },
    { name: 'Pediatrics', desc: 'Compassionate childcare, developmental testing, and vaccinations.', icon: <Users className="w-6 h-6 text-emerald-600" /> },
    { name: 'Neurology', desc: 'Brain, spinal nerve diagnostics, migraine therapy, and neuro-care.', icon: <Sparkles className="w-6 h-6 text-purple-600" /> },
    { name: 'Orthopedics', desc: 'Bone joints, alignment care, sports medicine, and physio-plans.', icon: <Medal className="w-6 h-6 text-amber-600" /> },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-medical-50 via-white to-sky-100/30 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 bg-medical-100 text-medical-800 text-xs font-semibold px-3 py-1 rounded-full border border-medical-200">
                <HeartPulse className="w-3.5 h-3.5 text-medical-500" />
                Your Trusted Health Sanctuary
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-tight">
                Modern Healthcare, <br />
                <span className="text-medical-600">Perfectly Scheduled</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connect seamlessly with leading clinical specialists, coordinate digital appointment bookings, review diagnoses, and track prescriptions—all within our highly secure healthcare portal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-3">
                <Link
                  to="/auth?register=true"
                  className="bg-medical-600 hover:bg-medical-700 text-white font-medium px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <span>Create Patient Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/doctors"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-8 py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <span>Browse Specialist Roster</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-slate-900">99.8%</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Satisfaction Rates</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">45+</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Specialists</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">30k+</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Bookings Handled</p>
                </div>
              </div>
            </div>

            {/* Right Graphics */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-medical-300 to-emerald-400 rounded-3xl blur-3xl opacity-20 -z-10 rotate-12"></div>
              <div className="bg-white rounded-3xl shadow-2xl border p-6 max-w-sm mx-auto space-y-6">
                <div className="flex justify-between items-center">
                  <p className="font-display font-bold text-lg text-slate-800">Direct Portal Stats</p>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="p-2 bg-medical-50 rounded-lg border border-medical-200">
                      <Calendar className="w-5 h-5 text-medical-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Real-time Bookings</p>
                      <p className="text-sm font-bold text-slate-800">Double Booking Prevented</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Secure Integration</p>
                      <p className="text-sm font-bold text-slate-800">Supabase Auth Certified</p>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="text-center">
                  <p className="text-[11px] text-slate-400 font-mono">
                    SECURED BY MEDICARE CORE V2
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Specialty Highlights Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Specialized Care Centers
          </h2>
          <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
            Medicare operates top-tier infrastructure for targeted clinics, featuring modern testing equipment and on-demand certified professionals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm hover:shadow-md transition text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-150">
                {dept.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">{dept.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{dept.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Features Callout */}
      <section className="bg-slate-900 py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Are You a Professional Medical Specialist?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
            Register your specialized credentials to obtain administrative verification. Once approved, manage upcoming slots, consult patients, and write cloud prescriptions instantly.
          </p>
          <div>
            <Link
              to="/auth?doctor=true"
              className="bg-medical-500 hover:bg-medical-400 text-slate-950 font-semibold px-8 py-3.5 rounded-2xl transition cursor-pointer"
            >
              Apply as Doctor Specialist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
