import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Shield, Bell, Plus, Trash2, Save, Loader2, Home, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../config/api';

export function SettingsPage() {
  const { user, token, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const API_URL = API_BASE_URL;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab, token]);

  const fetchAddresses = async () => {
    if (!token) return;
    setIsLoadingAddresses(true);
    try {
      const res = await axios.get(`${API_URL}/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data.data.addresses);
    } catch (err) {
      console.error('Fetch addresses error:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await axios.patch(`${API_URL}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        login(token, res.data.data.user);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/users/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="mb-8 px-4">
            <h1 className="text-3xl font-black tracking-tight">Settings</h1>
            <p className="text-text-muted text-sm font-medium">Manage your account</p>
          </div>
          
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'addresses', icon: MapPin, label: 'Addresses' },
            { id: 'security', icon: Shield, label: 'Security' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                activeTab === tab.id 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                : 'text-text-muted hover:bg-bg-soft hover:text-text-main'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest mt-4 animate-bounce"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          )}

          <Link 
            to="/"
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-text-muted hover:bg-bg-soft hover:text-text-main transition-all font-bold text-sm mt-8"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-bg-main rounded-[2.5rem] border border-border-main p-8 md:p-12 shadow-2xl glass min-h-[600px] text-left">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-black mb-2">Personal Profile</h2>
                  <p className="text-text-muted font-medium">Update your identity and contact information.</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      disabled
                      className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl opacity-50 cursor-not-allowed font-bold"
                    />
                    <p className="text-[10px] text-text-muted font-bold italic">Email cannot be changed for security.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 00000 00000"
                      className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center gap-3 px-10 h-16 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-black mb-2">Saved Addresses</h2>
                    <p className="text-text-muted font-medium">Manage locations for faster shipping.</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary/10 text-brand-primary rounded-xl font-bold text-sm hover:bg-brand-primary hover:text-white transition-all">
                    <Plus className="w-5 h-5" /> Add New
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-primary/50" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-border-main rounded-[2rem] space-y-4">
                        <MapPin className="w-12 h-12 text-text-muted mx-auto opacity-20" />
                        <p className="text-text-muted font-bold">No saved addresses yet.</p>
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <div key={addr._id} className="group flex items-center justify-between p-6 bg-bg-soft border border-border-main rounded-2xl hover:border-brand-primary/50 transition-all">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-bg-main rounded-xl flex items-center justify-center shrink-0">
                              <MapPin className="w-6 h-6 text-brand-primary" />
                            </div>
                            <div>
                              <p className="font-black text-lg mb-1">{addr.name}</p>
                              <p className="text-sm text-text-muted font-medium leading-tight">
                                {addr.address_line_1}, {addr.city} - {addr.pincode}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteAddress(addr._id)}
                            className="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-black mb-2">Security & Privacy</h2>
                  <p className="text-text-muted font-medium">Protect your account and managed sessions.</p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[2rem] flex gap-4 items-start">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-orange-500 mb-1">Two-Factor Authentication</h4>
                    <p className="text-sm text-orange-500/80 font-medium">Add an extra layer of security to your account by enabling 2FA. (Coming Soon)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-6 bg-bg-soft border border-border-main rounded-2xl hover:bg-border-main transition-all group">
                    <span className="font-bold text-text-muted group-hover:text-text-main transition-colors">Change Password</span>
                    <ArrowRight className="w-5 h-5 text-text-muted" />
                  </button>
                  <button className="w-full flex items-center justify-between p-6 bg-bg-soft border border-border-main rounded-2xl hover:bg-red-500/5 hover:border-red-500/20 transition-all group">
                    <span className="font-bold text-red-500/70 group-hover:text-red-500 transition-colors">Delete Account</span>
                    <Trash2 className="w-5 h-5 text-red-500/70 group-hover:text-red-500" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
