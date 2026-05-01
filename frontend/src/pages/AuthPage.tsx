import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowLeft, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const API_URL = API_BASE_URL;

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');
    setError(null);
    setShowOtpInput(false);
  }, [searchParams]);

  const toggleMode = () => {
    const newMode = isLogin ? 'signup' : 'login';
    setSearchParams({ mode: newMode });
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
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        
        if (res.data.success) {
          login(res.data.data.token || res.data.token, res.data.data.user || res.data.user);
          navigate('/');
        }
      } else {
        if (!showOtpInput) {
          const res = await axios.post(`${API_URL}/auth/send-otp`, { email: formData.email });
          if (res.data.success) {
            setShowOtpInput(true);
          }
        } else {
          if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP');
            setIsLoading(false);
            return;
          }
          
          const res = await axios.post(`${API_URL}/auth/register`, { ...formData, otp });
          
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
        
        const res = await axios.post(`${API_URL}/auth/google`, {
          token: tokenResponse.access_token
        });
        
        if (res.data.success) {
          login(res.data.token, res.data.user);
          navigate('/');
        } else {
          setError(res.data.message || 'Login failed');
        }
      } catch (err: any) {
        console.error('Google login error:', err);
        setError(err.response?.data?.message || 'Failed to authenticate with Google');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google login was cancelled or failed');
    }
  });

  return (
    <div className="min-h-screen text-white overflow-hidden font-sans flex items-center justify-center p-6 relative">
      
      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-1000 bg-gradient-to-tr ${isLogin ? 'from-blue-600 to-cyan-400' : 'from-purple-600 to-fuchsia-400'}`}>
              <Package className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : (showOtpInput ? 'otp' : 'signup')}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {isLogin ? 'Welcome back' : (showOtpInput ? 'Verify Email' : 'Create an account')}
                </h1>
                <p className="text-white/50 text-sm">
                  {isLogin
                    ? 'Log in to manage your shipments'
                    : (showOtpInput ? `Enter the code sent to ${formData.email}` : 'Start aggregating prices globally today')}
                </p>
              </div>

              {!showOtpInput && (
                <>
                  {/* OAuth Buttons */}
                  <div className="flex flex-col gap-3 mb-8">
                    <button
                      onClick={() => handleGoogleLogin()}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center mb-8">
                    <hr className="w-full border-white/10" />
                    <span className="absolute bg-[#0a0a0a] px-3 text-xs text-white/40 uppercase tracking-widest font-medium">Or</span>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {!isLogin && !showOtpInput && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      required
                    />
                  </div>
                )}
                
                {!showOtpInput && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      required
                    />
                  </div>
                )}
                
                {!showOtpInput && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      required
                    />
                  </div>
                )}

                {showOtpInput && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-center tracking-[0.5em] text-xl font-bold"
                      required
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <a href="#" className="text-xs text-white/50 hover:text-white transition-colors">Forgot password?</a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 mt-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all bg-gradient-to-r disabled:opacity-50 ${isLogin ? 'from-blue-600 to-cyan-500' : 'from-purple-600 to-fuchsia-500'}`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : (showOtpInput ? 'Verify & Register' : 'Continue'))}
                </button>

                {showOtpInput && (
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="text-xs text-white/50 hover:text-white mt-2 transition-colors"
                  >
                    Back to details
                  </button>
                )}
              </form>
              
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Toggle Mode */}
        {!showOtpInput && (
          <div className="text-center mt-8">
            <p className="text-white/50 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-white font-medium hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
