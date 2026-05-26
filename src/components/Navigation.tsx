/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { HeartPulse, Bell, LogOut, Menu, X, ShieldAlert, User as UserIcon, CalendarDays } from 'lucide-react';

export default function Navigation() {
  const { user, notifications, markAllNotificationsRead, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Services', path: '/services' },
    { name: 'Our Doctors', path: '/doctors' },
    { name: 'Contact', path: '/contact' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-150 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-medical-700 font-display font-bold text-xl md:text-2xl">
              <HeartPulse className="w-8 h-8 text-medical-500 fill-medical-50" />
              <span>Medi<span className="text-slate-900">Care</span></span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-medical-600 font-semibold border-b-2 border-medical-500 py-1'
                    : 'text-slate-600 hover:text-medical-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth / Avatar Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    id="btn-notif"
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      if (unreadCount > 0) markAllNotificationsRead();
                    }}
                    className="p-2 rounded-full hover:bg-slate-100 transition relative text-slate-600 hover:text-slate-800"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-semibold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Box */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-800">Alert Center</span>
                        <span className="text-xs bg-medical-50 text-medical-600 px-2 py-0.5 rounded-full font-medium">
                          {notifications.length} total
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-slate-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${!n.read ? 'bg-medical-50/40' : ''}`}>
                              <p className="font-semibold text-xs text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-slate-100 text-center">
                          <button
                            onClick={() => setNotifDropdownOpen(false)}
                            className="text-xs font-medium text-medical-600 hover:text-medical-800 transition"
                          >
                            Close Panel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dashboard / Account Route */}
                <Link
                  to={`/dashboard/${user.role}`}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition"
                >
                  <img
                    src={user.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'}
                    alt="avatar"
                    className="w-7 h-7 rounded-lg object-cover bg-medical-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono capitalize leading-tight flex items-center gap-1">
                      {user.role === 'admin' && <ShieldAlert className="w-3 h-3 text-amber-500" />}
                      {user.role}
                    </p>
                  </div>
                </Link>

                {/* Log out */}
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth"
                  className="text-slate-600 hover:text-medical-600 font-medium text-sm transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?register=true"
                  className="bg-medical-600 hover:bg-medical-700 text-white font-medium text-sm px-4 py-2 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            {user && (
              <button
                id="btn-mobile-notif"
                onClick={() => navigate(`/dashboard/${user.role}`)}
                className="p-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 w-2.5 h-2.5 rounded-full"></span>
                )}
              </button>
            )}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner animate-fade-in">
          {publicLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-base font-medium transition ${
                isActive(link.path)
                  ? 'bg-medical-50 text-medical-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-slate-100 space-y-1">
            {user ? (
              <>
                <Link
                  to={`/dashboard/${user.role}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  <img
                    src={user.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'}
                    alt="avatar"
                    className="w-8 h-8 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role} Portal</p>
                  </div>
                </Link>
                <button
                  id="btn-mobile-logout"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-2">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?register=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 bg-medical-600 text-white rounded-xl text-sm font-semibold hover:bg-medical-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
