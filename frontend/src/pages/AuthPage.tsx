import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowLeft, Mail, Lock, User, Loader2, KeyRound } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');
    setError(null);
    setShowOtpInput(false);
  }, [searchParams]);

  const toggleMode = () => {
    setSearchParams({ mode: isLogin ? 'signup' : 'login' });
    setShowOtpInput(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        if (res.data.success) {
          login(res.data.data.token || res.data.token, res.data.data.user || res.data.user);
          navigate('/');
        }
      } else {
        if (!showOtpInput) {
          const res = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email: formData.email });
          if (res.data.success) setShowOtpInput(true);
        } else {
          if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP');
            setIsLoading(false);
            return;
          }
          const res = await axios.post(`${API_BASE_URL}/auth/register`, { ...formData, otp });
          if (res.data.success) {
            login(res.data.data.token || res.data.token, res.data.data.user || res.data.user);
            navigate('/');
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleLoading(true);
        setError(null);
        const res = await axios.post(`${API_BASE_URL}/auth/google`, { token: tokenResponse.access_token });
        if (res.data.success) {
          login(res.data.token, res.data.user);
          navigate('/');
        } else {
          setError(res.data.message || 'Login failed');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to authenticate with Google');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => setError('Google login was cancelled or failed'),
  });

  const accentGradient = isLogin
    ? 'from-blue-600 to-cyan-500'
    : 'from-purple-600 to-fuchsia-500';

  return (
    <div className="font-sans flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden text-white">

      {/* ── Card ─────────────────────────────────────── */}
      <div className="w-full max-w-sm relative z-10 glass-panel rounded-2xl p-5 space-y-4 h-auto">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Logo + heading */}
        <div className="text-center mb-6">

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-head' : showOtpInput ? 'otp-head' : 'signup-head'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-black tracking-tight mb-1">
                {isLogin ? 'Welcome back' : showOtpInput ? 'Check your email' : 'Create account'}
              </h1>
              <p className="text-white/45 text-sm leading-snug">
                {isLogin
                  ? 'Sign in to manage your shipments'
                  : showOtpInput
                  ? `We sent a code to ${formData.email}`
                  : 'Start shipping smarter today'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Glass card ───────────────────────────────── */}
        <div className="glass-panel rounded-2xl p-5 space-y-4">

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-form' : showOtpInput ? 'otp-form' : 'signup-form'}
              initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* ── Google button ── */}
              {!showOtpInput && (
                <>
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    disabled={isGoogleLoading}
                    className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {/* Google icon */}
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="whitespace-nowrap">Continue with Google</span>
                      </>
                    )}
                  </button>

                  {/* ── OR divider ── */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                      or with email
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                </>
              )}

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Name — signup only */}
                {!isLogin && !showOtpInput && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
                    />
                  </div>
                )}

                {/* Email */}
                {!showOtpInput && (
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
                    />
                  </div>
                )}

                {/* Password */}
                {!showOtpInput && (
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
                    />
                  </div>
                )}

                {/* OTP */}
                {showOtpInput && (
                  <div className="space-y-3">
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="• • • • • •"
                        maxLength={6}
                        required
                        className="w-full h-14 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all text-center tracking-[0.6em] text-2xl font-black"
                      />
                    </div>
                    <p className="text-center text-xs text-white/40">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>
                )}

                {/* Forgot password */}
                {isLogin && !showOtpInput && (
                  <div className="flex justify-end">
                    <a href="#" className="text-xs text-white/35 hover:text-white/70 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-11 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r ${accentGradient} hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg mt-1`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    isLogin ? 'Sign In' : showOtpInput ? 'Verify & Create Account' : 'Continue'
                  )}
                </button>

                {/* Back from OTP */}
                {showOtpInput && (
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="w-full text-xs text-white/35 hover:text-white/60 transition-colors py-1"
                  >
                    ← Use a different email
                  </button>
                )}
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Toggle mode link */}
        {!showOtpInput && (
          <p className="text-center text-xs text-white/35 mt-5">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              className="text-white/70 font-semibold hover:text-white underline underline-offset-2 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
