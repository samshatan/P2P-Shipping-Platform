import { Mail, Lock, ArrowRight, User, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

import { API_BASE_URL } from '../../config/api'

export function SignupPage({ onSwitch, onBack }: { onSwitch: () => void, onBack: () => void }) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const API_URL = API_BASE_URL

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const res = await axios.post(`${API_URL}/auth/register`, formData)
      
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user)
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleLoading(true)
        setError(null)
        
        const res = await axios.post(`${API_URL}/auth/google`, {
          token: tokenResponse.access_token
        })
        
        if (res.data.success) {
          login(res.data.token, res.data.user)
          navigate('/') 
        } else {
          setError(res.data.message || 'Signup failed')
        }
      } catch (err: any) {
        console.error('Google signup error:', err)
        setError(err.response?.data?.message || 'Failed to authenticate with Google')
      } finally {
        setIsGoogleLoading(false)
      }
    },
    onError: () => {
      setError('Google signup was cancelled or failed')
    }
  })

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-3 text-text-main tracking-tight">Join Parcel</h2>
        <p className="text-text-muted font-medium">Start shipping smarter and saving money today.</p>
      </div>

      <div className="bg-bg-main p-8 rounded-[2rem] shadow-2xl shadow-brand-primary/5 border border-border-main glass">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
                className="w-full h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="you@example.com"
                className="w-full h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Minimum 8 characters"
                className="w-full h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all outline-none font-bold"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-primary/25 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight className="w-6 h-6" /></>}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-main"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="bg-bg-main px-4 text-text-muted">Or join with</span>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => handleGoogleLogin()}
            disabled={isGoogleLoading}
            className="w-full h-14 bg-bg-main border-2 border-border-main rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-bg-soft transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-sm"
          >
            {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Google Account
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-text-muted">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-brand-primary font-bold hover:underline">Log in here</button>
        </p>
        <button onClick={onBack} className="mt-4 text-xs font-bold text-text-muted uppercase tracking-widest hover:text-text-main transition-colors">
          Back to Home
        </button>
      </div>
    </div>
  )
}
