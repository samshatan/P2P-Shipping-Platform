import React from 'react'
import { motion } from 'framer-motion'
import { Leaf, Wind, Sun, Recycle, Droplets, TreePine, Globe, ShieldCheck, ArrowRight } from 'lucide-react'

const initiatives = [
  {
    title: "Carbon-Neutral Delivery",
    description: "We offset the carbon footprint of every shipment by investing in certified reforestation and renewable energy projects.",
    icon: Wind,
    color: "green"
  },
  {
    title: "Plastic-Free Packaging",
    description: "Our partner network is incentivized to use biodegradable mailers and recycled corrugated boxes for all fulfillments.",
    icon: Recycle,
    color: "emerald"
  },
  {
    title: "Electric Fleet Focus",
    description: "We prioritize courier partners who utilize EV bikes and vans for last-mile delivery in major metropolitan areas.",
    icon: Zap,
    color: "yellow"
  }
]

export function SustainabilityPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 text-left">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-24"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-xs font-black uppercase tracking-widest mb-8">
          <Leaf className="w-4 h-4" /> Green Logistics
        </div>
        <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-tight">Shipping that doesn't <span className="text-green-500">cost the Earth.</span></h1>
        <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed font-medium">
          We believe logistics can be a force for good. Parcel is committed to becoming the world's most sustainable shipping aggregator by 2030.
        </p>
      </motion.div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
         {[
           { label: 'Carbon Offset', value: '5,000 Tons', icon: Wind },
           { label: 'Trees Planted', value: '120,000+', icon: TreePine },
           { label: 'Eco-Partners', value: '85%', icon: Globe }
         ].map((stat, i) => (
           <div key={stat.label} className="p-10 bg-green-500/5 rounded-[3rem] border border-green-500/10 text-center space-y-4">
              <stat.icon className="w-12 h-12 text-green-500 mx-auto" />
              <h3 className="text-4xl font-black text-text-main">{stat.value}</h3>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
           </div>
         ))}
      </div>

      {/* Initiatives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        {initiatives.map((item, i) => (
          <div key={item.title} className="bg-bg-main p-10 rounded-[3rem] border border-border-main hover:border-green-500/30 transition-all shadow-xl shadow-black/5 flex flex-col items-center text-center space-y-6">
             <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                <item.icon className="w-8 h-8" />
             </div>
             <h4 className="text-2xl font-black tracking-tight">{item.title}</h4>
             <p className="text-text-muted font-medium leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Image/Story Section */}
      <div className="bg-bg-soft rounded-[4rem] border border-border-main p-8 md:p-20 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden mb-32">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
         
         <div className="flex-1 space-y-8 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Our "One Parcel, One Tree" Promise</h2>
            <p className="text-lg text-text-muted font-medium leading-relaxed">
              For every 10 international shipments booked through our platform, we plant a tree in a high-impact reforestation project. 
              We've partnered with global NGOs to restore biodiversity in the Amazon, Sub-Saharan Africa, and the Himalayan foothills.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <div className="flex items-center gap-2 px-5 py-3 bg-bg-main border border-border-main rounded-2xl font-black text-xs uppercase tracking-widest text-green-600 shadow-sm">
                  <ShieldCheck className="w-4 h-4" /> Verified by Ecologi
               </div>
               <div className="flex items-center gap-2 px-5 py-3 bg-bg-main border border-border-main rounded-2xl font-black text-xs uppercase tracking-widest text-green-600 shadow-sm">
                  <ShieldCheck className="w-4 h-4" /> Gold Standard Certified
               </div>
            </div>
         </div>

         <div className="flex-1 relative z-10 w-full">
            <div className="aspect-[4/3] bg-bg-main rounded-[3rem] border border-border-main shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-colors"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <TreePine className="w-32 h-32 text-green-500/40 group-hover:scale-125 transition-transform duration-700" />
               </div>
            </div>
         </div>
      </div>

      {/* Footer Callout */}
      <div className="text-center py-20 bg-green-500 rounded-[3.5rem] text-white shadow-2xl shadow-green-500/20">
         <h3 className="text-3xl md:text-4xl font-black mb-4">Make your next shipment a green one.</h3>
         <p className="text-white/80 font-medium mb-10 max-w-xl mx-auto">Toggle our "Green Shipping" option at checkout to offset your delivery's impact.</p>
         <button className="h-16 px-10 bg-white text-green-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">
            Learn More About Our Projects
         </button>
      </div>
    </div>
  )
}

import { Zap } from 'lucide-react'
