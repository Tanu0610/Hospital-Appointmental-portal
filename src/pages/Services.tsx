/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, HeartPulse, Sparkles, Activity, FileText, CheckCircle2 } from 'lucide-react';

export default function Services() {
  const serviceList = [
    { name: 'Cardiology Diagnostics', fee: '$180', time: '30-45 mins', desc: 'Heart diagnostics under Dr. Sarah Jenkins. Fits general heart screening & hypertension therapy reviews.' },
    { name: 'Pediatric Medical Review', fee: '$120', time: '20-30 mins', desc: 'Children healthcare monitoring from toddler screenings to seasonal asthma reviews with Dr. Alex Patel.' },
    { name: 'General Outpatient Visit', fee: '$100', time: '15-20 mins', desc: 'Symptomatic review, general prescriptions, referrals, and initial wellness tracking.' },
    { name: 'Neurology Specialty Consultation', fee: '$200', time: '40-60 mins', desc: 'Nerve function check, brain wave diagnostics, migraine block therapy reviews.' },
  ];

  const valueProps = [
    'Zero Double-Booking Guarantee (with real-time calendar confirmation)',
    'Immediate digital prescription downloads upon consultation completion',
    'Flexible scheduling & instant panel cancellation if emergencies pop up',
    'Complete payment invoice generation for health insurance reimbursement',
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-16">
        
        {/* Title Block */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-medical-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
            Clinical Catalog
          </span>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
            Comprehensive Clinical Services
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            We provide peerless outpatient medical operations. Each listed specialty is supported by certified board doctors, with booking fees displayed transparently with no hidden administrative add-ons.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {serviceList.map((srv, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-150 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-300 hover:bg-slate-50/55 transition gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-display font-bold text-xl text-slate-900">{srv.name}</h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-medical-600">{srv.fee}</p>
                    <p className="text-[10px] text-slate-400 font-mono font-medium uppercase mt-0.5">{srv.time}</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{srv.desc}</p>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-medical-500" />
                  Direct Insurance Eligible
                </span>
                <span className="bg-white px-2.5 py-1 border rounded-lg text-slate-600 font-semibold font-mono">
                  CODE srv-{(idx + 1) * 100}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Panel */}
        <div className="bg-medical-50 text-slate-900 rounded-3xl p-8 md:p-12 border border-medical-100 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-2xl font-display font-bold text-medical-900">Why Book Through the Portal?</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              MediMedicare leverages backend validation filters that immediately check current schedules upon reservation, ensuring complete coordinate booking sync.
            </p>
          </div>
          <div className="md:col-span-6 space-y-3">
            {valueProps.map((prop, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-medical-600 flex-shrink-0 mt-0.5" />
                <span>{prop}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
