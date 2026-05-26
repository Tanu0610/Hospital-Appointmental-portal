/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, ShieldCheck, Heart, Users } from 'lucide-react';

export default function About() {
  const milestones = [
    { year: '2014', title: 'Medicare Foundation', desc: 'Inaugurated with 5 core diagnostic specialty labs and 8 physicians.' },
    { year: '2019', title: 'Regional Expansion', desc: 'Grew into a multi-facility private clinical network supporting outpatient procedures.' },
    { year: '2023', title: 'Digital Upgrade', desc: 'Introduced integrated scheduling algorithms, securing automated slot preservation.' },
  ];

  const values = [
    { title: 'Compassionate Care', desc: 'Prioritizing patient comfort, understanding, and dignity throughout the diagnostic lifecycle.', icon: <Heart className="w-6 h-6 text-rose-500" /> },
    { title: 'Peerless Quality', desc: 'Maintaining certifications and equipment calibration of the highest standard.', icon: <Award className="w-6 h-6 text-amber-500" /> },
    { title: 'Secured Data Privacy', desc: 'Applying RLS constraints to safeguard medical files from third parties.', icon: <ShieldCheck className="w-6 h-6 text-emerald-500" /> },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-20">
        
        {/* Header Block */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-medical-600 uppercase tracking-widest bg-medical-50 border border-medical-200 px-3 py-1 rounded-full">
            Our Legacy
          </span>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
            Pioneering Clinical Excellence & Seamless Experience
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            At MediCare, we believe that accessing premium medical consultations should belong in the palm of your hand. That is why we combine absolute specialized clinical talent with clean modern digital booking infrastructure. No queues, no double bookings—only prompt healthcare solutions.
          </p>
        </div>

        {/* Dynamic Values */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                {v.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">{v.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Milestone Timeline */}
        <div className="space-y-12">
          <h2 className="text-2xl font-display font-bold text-slate-900">Our Shared Milestone Journey</h2>
          <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-10">
            {milestones.map((m, i) => (
              <div key={i} className="relative">
                {/* Bullet */}
                <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-medical-500 shadow"></div>
                
                <span className="text-xs font-mono font-bold text-medical-600 bg-medical-100 px-2.5 py-1 rounded-md">
                  {m.year}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-2">{m.title}</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xl leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
