import { Package, Globe, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border-main bg-bg-soft py-24 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-1 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary p-2 rounded-xl">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">ShipEasy</span>
            </div>
            <p className="text-text-muted text-base leading-relaxed font-medium">
              The modern shipping hub for everyone. We make logistics human, transparent, and affordable for individuals and businesses alike.
            </p>
            <div className="flex items-center gap-6">
              {[Globe, Globe, Mail].map((Icon, i) => (
                <a key={i} href="#" className="text-text-muted hover:text-brand-primary transition-all hover:-translate-y-1"><Icon className="w-5 h-5" /></a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-10 text-text-main">Product</h4>
            <ul className="space-y-5 text-sm font-bold text-text-muted">
              <li><Link to="/" className="hover:text-brand-primary transition-colors">How it works</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-primary transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/partner" className="hover:text-brand-primary transition-colors">Courier Partners</Link></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-10 text-text-main">Company</h4>
            <ul className="space-y-5 text-sm font-bold text-text-muted">
              <li><Link to="/about" className="hover:text-brand-primary transition-colors">About Us</Link></li>
              <li><Link to="/sustainability" className="hover:text-brand-primary transition-colors">Sustainability</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-primary transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-10 text-text-main">Support</h4>
            <ul className="space-y-5 text-sm font-bold text-text-muted">
              <li><Link to="/help" className="hover:text-brand-primary transition-colors">Help Center</Link></li>
              <li><Link to="/tracking" className="hover:text-brand-primary transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-brand-primary transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border-main mt-24 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">
          <p>© 2024 ShipEasy — A Premium Logistics Platform.</p>
          <div className="flex gap-12">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
