import { Timer, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ComingSoonPage({ title }: { title: string }) {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-bg-main p-16 rounded-[3rem] border border-border-main text-center glass shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50" />
        
        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 animate-float">
          <Timer className="w-12 h-12 text-brand-primary" />
        </div>
        
        <h2 className="text-5xl font-black mb-6 tracking-tight">{title}</h2>
        <p className="text-2xl text-text-muted leading-relaxed font-medium mb-12 max-w-2xl mx-auto">
          We're currently perfecting this part of the Parcel experience. Check back soon for updates!
        </p>
        
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary/5 rounded-full text-brand-primary font-bold text-sm uppercase tracking-widest mb-12">
          <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
          Under Construction
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-10 h-16 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-white/10"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
