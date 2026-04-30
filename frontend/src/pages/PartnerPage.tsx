import { Building2, CheckCircle2, Sparkles, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PartnerPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
          <Building2 className="w-10 h-10 text-brand-primary" />
        </div>
        <h2 className="text-5xl font-black mb-6 tracking-tight">Partner with <span className="text-brand-primary">ShipEasy</span></h2>
        <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">Join India's most modern shipping network. Increase your volume and manage your fleet with our state-of-the-art partner dashboard.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-bg-main p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-brand-primary/5 border border-border-main space-y-8 glass">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Company Name</label>
              <input type="text" placeholder="FastTrack Logistics" className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none font-semibold transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Contact Person</label>
              <input type="text" placeholder="Aditya Sharma" className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none font-semibold transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Business Email</label>
            <input type="email" placeholder="partners@fasttrack.com" className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none font-semibold transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Fleet Size</label>
            <select className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none font-semibold appearance-none">
              <option>1-10 Vehicles</option>
              <option>10-50 Vehicles</option>
              <option>50+ Vehicles</option>
            </select>
          </div>
          <button className="w-full h-16 bg-brand-primary text-white rounded-2xl font-black text-lg hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/25 hover:-translate-y-1 active:translate-y-0">
            Submit Request
          </button>
        </div>

        <div className="space-y-10 py-6">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-black text-xl mb-2">Instant Visibility</h4>
              <p className="text-text-muted font-medium">Get your services in front of 50,000+ individual and business shippers across India.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h4 className="font-black text-xl mb-2">Automated Billing</h4>
              <p className="text-text-muted font-medium">No more chasing payments. Our system handles all billing and payouts automatically.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-black text-xl mb-2">Route Optimization</h4>
              <p className="text-text-muted font-medium">Access our advanced route planning tools to reduce fuel costs and delivery times.</p>
            </div>
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="mt-32 space-y-16">
        <div className="text-center">
          <h3 className="text-4xl font-black mb-4">Frequently Asked Questions</h3>
          <p className="text-text-muted font-medium">Everything you need to know about joining our network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { q: "How long does approval take?", a: "Once you submit your fleet details, our team usually reviews and approves your account within 2-3 business days." },
            { q: "What are the commission rates?", a: "We take a flat 5-8% service fee depending on your monthly shipment volume. No hidden costs." },
            { q: "Do you provide tracking hardware?", a: "We provide a state-of-the-art software dashboard. If your vehicles don't have GPS, we can recommend integrated hardware partners." },
            { q: "Can I join as an individual?", a: "Currently, we only partner with registered logistics companies and fleet owners with a minimum of 2 vehicles." }
          ].map((faq, i) => (
            <div key={i} className="p-8 bg-bg-soft/50 border border-border-main rounded-3xl hover:border-brand-primary/30 transition-all">
              <h4 className="font-black text-lg mb-3 text-text-main">Q: {faq.q}</h4>
              <p className="text-text-muted font-medium text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-32 bg-brand-primary p-12 sm:p-16 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl shadow-brand-primary/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10">
          <h3 className="text-4xl font-black mb-6 tracking-tight">Still have questions?</h3>
          <p className="text-xl text-white/80 font-medium mb-10 max-w-xl mx-auto">Our partnership team is ready to help you scale your logistics business.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="mailto:partners@shipeasy.com" className="flex items-center gap-3 px-10 h-16 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all">
              <Mail className="w-5 h-5" />
              Email Us
            </a>
            <div className="text-sm font-bold opacity-70">
              Response time: <span className="underline">Under 4 hours</span>
            </div>
          </div>
        </div>
      </div>

      <Link to="/" className="mt-16 mx-auto block text-xs font-black text-text-muted uppercase tracking-[0.3em] hover:text-brand-primary transition-colors text-center">
        Back to Home
      </Link>
    </div>
  )
}
