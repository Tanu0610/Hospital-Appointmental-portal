/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Check } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: '', email: '', subject: '', message: '' });
      }, 4000);
    }
  };

  const contactOptions = [
    { title: 'Emergency Hotline', icon: <Phone className="w-5 h-5 text-rose-500" />, detail: '+1 (800) 555-9111', desc: 'Available 24/7/365' },
    { title: 'Inquiries & Support', icon: <Mail className="w-5 h-5 text-medical-600" />, detail: 'support@medicare.com', desc: 'Replies within 2 hours' },
    { title: 'Main Hospital Address', icon: <MapPin className="w-5 h-5 text-emerald-500" />, detail: '742 Clinical Plaza, Suite 90', desc: 'New York, NY 10019' },
    { title: 'Information Desk', icon: <Clock className="w-5 h-5 text-amber-500" />, detail: 'Mon - Fri, 8:00 AM - 6:00 PM', desc: 'Outpatient operations' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-medical-600 uppercase tracking-widest bg-medical-50 border border-medical-200 px-3 py-1 rounded-full">
            Connect
          </span>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
            How Can We Assist Your Medical Coordination?
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            If you need administrative support, corporate partner billing assistance, or are expounding feedback on outpatient sessions, leave us an electronic inquiry.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Quick Info Grid */}
          <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {contactOptions.map((opt, idx) => (
              <div key={idx} className="bg-white border rounded-2xl p-6 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border flex-shrink-0">
                  {opt.icon}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider">{opt.title}</h4>
                  <p className="font-semibold text-slate-800 text-base mt-1 break-all">{opt.detail}</p>
                  <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-8 bg-white border border-slate-150 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            {submitted ? (
              <div className="py-16 text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-900">Message Dispatched!</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-800">{form.name}</span>. An outpatient support representative will respond to your inquiry at <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded">{form.email}</span> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-2">
                  <MessageSquare className="w-5 h-5 text-medical-500" />
                  <h3 className="font-display font-bold text-lg text-slate-800">Electronic Support Desk</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. John Doe"
                      className="bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white px-4 py-2.5 rounded-xl outline-none text-sm font-medium text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. john@example.com"
                      className="bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white px-4 py-2.5 rounded-xl outline-none text-sm font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Booking Reschedule / Billing"
                    className="bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white px-4 py-2.5 rounded-xl outline-none text-sm font-medium text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write detailed inquiry notes here..."
                    className="bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white px-4 py-3 rounded-xl outline-none text-sm font-medium text-slate-800"
                  />
                </div>

                <button
                  id="btn-submit-contact"
                  type="submit"
                  className="bg-medical-600 hover:bg-medical-700 text-white font-medium text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Ticket</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
