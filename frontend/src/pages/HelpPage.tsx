import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Truck, CreditCard, Shield, Package, HelpCircle, MessageCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const faqCategories = [
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    icon: Truck,
    color: 'blue',
    questions: [
      { q: "How long does domestic shipping take?", a: "Most domestic shipments are delivered within 2-5 business days depending on the service level chosen (Express vs Economy)." },
      { q: "Do you offer same-day pickup?", a: "Yes, if you book before 12 PM local time, our partners usually attempt pickup on the same day." },
      { q: "What items are prohibited?", a: "Prohibited items include explosives, flammable liquids, toxic substances, and illegal goods. Check our full list for more details." }
    ]
  },
  {
    id: 'tracking',
    title: 'Tracking & Orders',
    icon: Package,
    color: 'orange',
    questions: [
      { q: "Where can I find my tracking ID?", a: "Your tracking ID (AWB) is sent via email and SMS immediately after booking. You can also find it in your Dashboard." },
      { q: "My tracking status hasn't updated in 24 hours.", a: "Don't worry! Sometimes tracking updates are delayed while the package is in transit between major hubs." }
    ]
  },
  {
    id: 'billing',
    title: 'Payments & Billing',
    icon: CreditCard,
    color: 'green',
    questions: [
      { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, and popular digital wallets." },
      { q: "Can I get a GST invoice?", a: "Yes, GST invoices are automatically generated and can be downloaded from your Shipment History." }
    ]
  }
]

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('shipping')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const currentCategory = faqCategories.find(c => c.id === activeCategory) || faqCategories[0]

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 text-left">
      {/* Header & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-tight">Help <span className="text-brand-primary">Center</span></h1>
        <div className="relative max-w-2xl mx-auto group">
           <div className="absolute inset-0 bg-brand-primary/10 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-700"></div>
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-brand-primary transition-colors z-10" />
           <input 
             type="text" 
             placeholder="Search for questions (e.g. tracking, returns...)"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-20 pl-16 pr-8 bg-bg-main border border-border-main rounded-[2rem] focus:border-brand-primary outline-none font-bold text-xl transition-all shadow-xl relative z-10 glass"
           />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-4 mb-4">Categories</p>
           {faqCategories.map((cat) => (
             <button
               key={cat.id}
               onClick={() => { setActiveCategory(cat.id); setOpenIndex(0); }}
               className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${activeCategory === cat.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105' : 'bg-bg-main border border-border-main text-text-muted hover:border-brand-primary hover:text-brand-primary'}`}
             >
               <cat.icon className="w-6 h-6" />
               <span className="font-black tracking-tight">{cat.title}</span>
             </button>
           ))}

           <div className="mt-12 p-8 bg-bg-soft rounded-[2.5rem] border border-border-main space-y-6">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                 <HelpCircle className="w-6 h-6 text-brand-primary" />
              </div>
              <h4 className="font-black text-xl leading-tight">Couldn't find what you need?</h4>
              <Link 
                to="/contact"
                className="flex items-center justify-between group w-full text-brand-primary font-black text-xs uppercase tracking-widest"
              >
                Chat with us <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>
        </div>

        {/* FAQ Content */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight">{currentCategory.title}</h2>
              <span className="text-xs font-bold text-text-muted bg-bg-soft px-4 py-2 rounded-full border border-border-main">
                {currentCategory.questions.length} Articles
              </span>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="wait">
                {currentCategory.questions.map((faq, i) => (
                  <motion.div 
                    key={faq.q}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-bg-main border rounded-[2rem] overflow-hidden transition-all duration-500 ${openIndex === i ? 'border-brand-primary shadow-xl ring-4 ring-brand-primary/5' : 'border-border-main'}`}
                  >
                    <button 
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full flex items-center justify-between p-8 text-left group"
                    >
                      <h4 className={`text-xl font-black tracking-tight transition-colors ${openIndex === i ? 'text-brand-primary' : 'text-text-main'}`}>
                        {faq.q}
                      </h4>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === i ? 'bg-brand-primary text-white rotate-180' : 'bg-bg-soft text-text-muted group-hover:bg-brand-primary/10 group-hover:text-brand-primary'}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-8 pb-8 pt-0">
                            <p className="text-lg text-text-muted font-medium leading-relaxed border-t border-border-main/50 pt-6">
                              {faq.a}
                            </p>
                            <div className="mt-8 flex items-center gap-4">
                               <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">
                                 Was this helpful?
                               </button>
                               <div className="w-1 h-1 rounded-full bg-border-main"></div>
                               <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main">
                                 Report an issue
                               </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           {/* More Help Card */}
           <div className="mt-16 bg-bg-soft p-12 rounded-[3.5rem] border border-border-main border-dashed flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center shadow-inner">
                    <MessageCircle className="w-10 h-10 text-green-500" />
                 </div>
                 <div className="text-left">
                    <h4 className="text-2xl font-black tracking-tight">Need dedicated support?</h4>
                    <p className="text-text-muted font-medium">Our agents are online and ready to help.</p>
                 </div>
              </div>
              <Link 
                to="/contact"
                className="h-16 px-10 bg-text-main text-bg-main rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-brand-primary transition-all active:scale-95 shadow-xl shadow-black/5"
              >
                Contact Support <ExternalLink className="w-5 h-5" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}
