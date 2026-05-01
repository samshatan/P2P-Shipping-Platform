import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent! Our team will get back to you within 24 hours.')
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 text-left">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-8">
          <MessageSquare className="w-4 h-4" /> 24/7 Premium Support
        </div>
        <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">How can we <span className="text-brand-primary">help?</span></h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-medium">
          Have a question about a shipment or want to partner with us? Our global support team is ready to assist you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-bg-main p-8 rounded-[2.5rem] border border-border-main shadow-xl glass space-y-8 relative overflow-hidden">
             <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl"></div>
             
             <h3 className="text-2xl font-black tracking-tight relative z-10">Get in Touch</h3>
             
             <div className="space-y-6 relative z-10">
               <div className="flex items-start gap-5 group">
                 <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                   <Mail className="w-6 h-6 text-brand-primary group-hover:text-white" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Email us</p>
                   <p className="font-bold text-lg">support@parcel.com</p>
                 </div>
               </div>

               <div className="flex items-start gap-5 group">
                 <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-500 group-hover:text-white transition-all duration-500">
                   <Phone className="w-6 h-6 text-green-500 group-hover:text-white" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Call us</p>
                   <p className="font-bold text-lg">+91 1800 123 4567</p>
                 </div>
               </div>

               <div className="flex items-start gap-5 group">
                 <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                   <MapPin className="w-6 h-6 text-orange-500 group-hover:text-white" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">HQ Location</p>
                   <p className="font-bold text-lg leading-snug">Cyber City, Phase 3, Gurgaon, Haryana, India</p>
                 </div>
               </div>
             </div>

             <div className="pt-8 border-t border-border-main/50 grid grid-cols-2 gap-4">
               <div className="p-4 bg-bg-soft rounded-2xl border border-border-main">
                  <Clock className="w-5 h-5 text-brand-primary mb-2" />
                  <p className="text-[9px] font-black uppercase text-text-muted">Response Time</p>
                  <p className="text-xs font-bold">&lt; 2 Hours</p>
               </div>
               <div className="p-4 bg-bg-soft rounded-2xl border border-border-main">
                  <ShieldCheck className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-[9px] font-black uppercase text-text-muted">Security</p>
                  <p className="text-xs font-bold">SSL Encrypted</p>
               </div>
             </div>
          </div>

          <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-brand-primary/20">
             <Globe className="w-10 h-10 mb-6 opacity-80" />
             <h4 className="text-xl font-black mb-2">Global Presence</h4>
             <p className="text-sm font-medium opacity-90 leading-relaxed">
               We operate in 220+ countries with localized support centers in New York, London, Dubai, and Singapore.
             </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-bg-main p-8 sm:p-12 rounded-[3rem] border border-border-main shadow-2xl glass space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-16 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all"
                  placeholder="Steve Jobs"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full h-16 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all"
                  placeholder="steve@apple.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Subject</label>
              <select 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full h-16 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg appearance-none transition-all cursor-pointer"
              >
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership Request</option>
                <option>Billing Question</option>
                <option>Bulk Shipping Discount</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Your Message</label>
              <textarea 
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full p-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all resize-none"
                placeholder="How can we help you today?"
              />
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full h-20 bg-brand-primary text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-brand-secondary transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Message...' : (
                <>Send Message <Send className="w-6 h-6" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
