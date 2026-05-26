/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogIn, UserPlus, HeartPulse, Key, Info, HelpCircle } from 'lucide-react';

export default function Auth() {
  const { login, register, forgotPassword } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [hospital, setHospital] = useState('');
  const [fee, setFee] = useState(150);
  const [bio, setBio] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [forgotActive, setForgotActive] = useState(false);

  // Parse queries like ?register=true or ?doctor=true to set tab presets
  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegister(true);
    }
    if (searchParams.get('doctor') === 'true') {
      setIsRegister(true);
      setRole('doctor');
    }
  }, [searchParams]);

  const fillTestAccount = (userType: 'patient' | 'doctor' | 'admin') => {
    setIsRegister(false);
    setForgotActive(false);
    if (userType === 'patient') {
      setEmail('patient@medicare.com');
      setPassword('patient123');
    } else if (userType === 'doctor') {
      setEmail('doctor@medicare.com');
      setPassword('doctor123');
    } else if (userType === 'admin') {
      setEmail('admin@medicare.com');
      setPassword('admin123');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (forgotActive) {
      await forgotPassword(email);
      setForgotActive(false);
      setIsLoading(false);
      return;
    }

    if (isRegister) {
      const regPayload: any = {
        email,
        password,
        role,
        name,
      };

      if (role === 'doctor') {
        regPayload.specialization = specialization;
        regPayload.hospital = hospital || 'Medicare Health Center';
        regPayload.appointment_fee = fee;
        regPayload.bio = bio;
      }

      const success = await register(regPayload);
      if (success) {
        navigate(`/dashboard/${role}`);
      }
    } else {
      const success = await login(email, password);
      if (success) {
        // Fetch role again using local variable logic or parse token
        try {
          const decoded = atob(localStorage.getItem('medicare_token') || '').split(':');
          const finalRole = decoded[1];
          navigate(`/dashboard/${finalRole}`);
        } catch (e) {
          navigate('/');
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto px-4 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Informational panel */}
        <div className="lg:col-span-6 text-left space-y-6">
          <span className="inline-flex items-center gap-1.5 bg-medical-100 text-medical-800 text-xs font-semibold px-3 py-1 rounded-full border border-medical-200">
            <HeartPulse className="w-3.5 h-3.5 text-medical-500 fill-medical-50" />
            MediCare Portal Core v2.0
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight">
            Comprehensive Hospital Clinical Outpatient Portal
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Our clinic terminal integrates medical calendars, digital card payments, patient history demographics databases, doctor diagnostic lockers, and secure administration.
          </p>

          {/* Preset Buttons Board */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Key className="w-4 h-4 text-medical-500" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider">Test-Drive Credentials Drawer</p>
            </div>
            <p className="text-xs text-slate-500">Click a preset below to instantly simulate authentic client role authorization profiles:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                id="btn-test-patient"
                onClick={() => fillTestAccount('patient')}
                className="bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-sky-100 transition cursor-pointer"
              >
                Patient Account
              </button>
              <button
                id="btn-test-doctor"
                onClick={() => fillTestAccount('doctor')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-emerald-100 transition cursor-pointer"
              >
                Doctor Specialist
              </button>
              <button
                id="btn-test-admin"
                onClick={() => fillTestAccount('admin')}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-purple-100 transition cursor-pointer"
              >
                Administrator
              </button>
            </div>
          </div>
        </div>

        {/* Right Auth Card Form */}
        <div className="lg:col-span-6 bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-md">
          {forgotActive ? (
            <form onSubmit={handleAuthSubmit} className="space-y-6 text-left">
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold text-slate-900">Forgot Password?</h3>
                <p className="text-xs text-slate-400">Input your login email and we will simulate dispatching recovery reset instructions.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. support@medicare.com"
                  className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-medical-500 text-sm"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  id="btn-auth-reset"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-medical-600 hover:bg-medical-700 text-white font-medium text-sm py-3 rounded-xl transition shadow flex items-center justify-center cursor-pointer"
                >
                  Confirm Reset Recovery
                </button>
                <button
                  type="button"
                  onClick={() => setForgotActive(false)}
                  className="text-xs text-center font-medium text-slate-500 hover:text-slate-800 transition py-1"
                >
                  Return to login tab
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              
              {/* Form Tab Selectors */}
              <div className="flex border-b">
                <button
                  onClick={() => setIsRegister(false)}
                  className={`flex-1 text-center py-2 text-sm font-semibold transition cursor-pointer ${
                    !isRegister
                      ? 'border-b-2 border-medical-500 text-medical-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </span>
                </button>
                <button
                  onClick={() => setIsRegister(true)}
                  className={`flex-1 text-center py-2 text-sm font-semibold transition cursor-pointer ${
                    isRegister
                      ? 'border-b-2 border-medical-500 text-medical-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    Create Profile
                  </span>
                </button>
              </div>

              {/* Real Form form */}
              <form onSubmit={handleAuthSubmit} className="space-y-5 text-left">
                
                {isRegister && (
                  <div className="space-y-4">
                    {/* Role Pick */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">You want to register as:</label>
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1 rounded-xl border border-slate-150">
                        <button
                          type="button"
                          onClick={() => setRole('patient')}
                          className={`text-xs font-semibold py-2 rounded-lg transition ${
                            role === 'patient'
                              ? 'bg-white text-medical-600 shadow'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Outpatient Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('doctor')}
                          className={`text-xs font-semibold py-2 rounded-lg transition ${
                            role === 'doctor'
                              ? 'bg-white text-medical-600 shadow'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Doctor Specialist
                        </button>
                      </div>
                    </div>

                    {/* Name input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={role === 'doctor' ? 'e.g. Dr. Jane Foster' : 'e.g. John Doe'}
                        className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-medical-500 text-sm font-medium text-slate-800"
                      />
                    </div>

                    {/* Doctor parameters specifically */}
                    {role === 'doctor' && (
                      <div className="grid sm:grid-cols-2 gap-4 border-l-2 border-medical-500 pl-4 space-y-2 sm:space-y-0">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Focus Specialty</label>
                          <select
                            value={specialization}
                            onChange={e => setSpecialization(e.target.value)}
                            className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl outline-none text-sm"
                          >
                            <option value="Cardiology">Cardiology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="General Medicine">General Medicine</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Primary Hospital</label>
                          <input
                            type="text"
                            required
                            value={hospital}
                            onChange={e => setHospital(e.target.value)}
                            placeholder="e.g. Mercy General"
                            className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl outline-none text-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Consulting Desk Fee ($USD)</label>
                          <input
                            type="number"
                            required
                            value={fee}
                            onChange={e => setFee(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl outline-none text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Email address */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. patient@medicare.com"
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-medical-500 text-sm font-medium text-slate-800"
                  />
                </div>

                {/* Password locker */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-500 uppercase">Password Sequence</label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => setForgotActive(true)}
                        className="text-medical-600 hover:text-medical-800 font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-medical-500 text-sm"
                  />
                </div>

                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-medical-600 hover:bg-medical-700 text-white font-medium text-sm py-3 rounded-2xl cursor-pointer shadow hover:shadow-md transition flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Decrypting Session...' : isRegister ? 'Commit & Register' : 'Authorize Credentials'}
                </button>
              </form>

              {role === 'doctor' && isRegister && (
                <div className="bg-slate-50 p-4 rounded-xl border flex gap-2 items-start text-xs text-slate-500">
                  <Info className="w-5 h-5 text-medical-500 flex-shrink-0" />
                  <p>Doctors require system administrator approval before their profiles are added to the public certified specialists active directory roster.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
