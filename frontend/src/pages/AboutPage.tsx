import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Users, Award, Heart, ArrowRight, Package, Target, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'Packages Delivered', value: '1.2M+', icon: Package },
  { label: 'Happy Customers', value: '500K+', icon: Heart },
  { label: 'Courier Partners', value: '15+', icon: Zap },
  { label: 'Countries Reached', value: '220+', icon: Globe }
]

const values = [
  {
    title: "Radical Transparency",
    description: "No hidden fees. We show you the exact breakdown of every rupee you spend on shipping.",
    icon: Shield,
    color: "blue"
  },
  {
    title: "Velocity First",
    description: "Our algorithms find the fastest route across multiple carriers to save you days, not just hours.",
    icon: Rocket,
    color: "purple"
  },
  {
    title: "Customer Obsessed",
    description: "We don't just ship boxes; we ship promises. Our support team treats every parcel like their own.",
    icon: Users,
    color: "orange"
  }
]

export function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 text-left">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-24"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-8">
          <Target className="w-4 h-4" /> Our Mission
        </div>
        <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-tight">Redefining how the <span className="text-brand-primary">world moves.</span></h1>
        <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed font-medium">
          Parcel was born out of a simple frustration: shipping is too complex and too expensive. 
          We built a platform that levels the playing field for everyone—from solo entrepreneurs to global enterprises.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-main p-8 rounded-[2.5rem] border border-border-main text-center hover:shadow-2xl hover:border-brand-primary/30 transition-all group"
          >
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
               <stat.icon className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Values Section */}
      <div className="space-y-20 mb-32">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-tight mb-4">Values that drive us</h2>
          <p className="text-text-muted font-medium">Built by logistics experts, powered by world-class engineering.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <div key={value.title} className="bg-bg-soft p-10 rounded-[3rem] border border-border-main space-y-6 hover:bg-bg-main transition-all duration-500">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-bg-main shadow-lg`}>
                  <value.icon className="w-7 h-7 text-brand-primary" />
               </div>
               <h4 className="text-2xl font-black tracking-tight">{value.title}</h4>
               <p className="text-text-muted font-medium leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-text-main text-bg-main p-12 md:p-20 rounded-[4rem] flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
         
         <div className="flex-1 space-y-8 relative z-10">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">It started in a small warehouse in Delhi.</h3>
            <p className="text-lg opacity-80 font-medium leading-relaxed">
              In 2023, we saw small business owners waiting in long lines at local courier shops, paying premium prices for unpredictable service. 
              We knew there was a better way. By aggregating the world's best couriers into one smart interface, we've saved our users millions in shipping costs and years in collective wait time.
            </p>
            <div className="flex items-center gap-8">
               <div className="flex flex-col">
                  <span className="text-3xl font-black">2023</span>
                  <span className="text-[10px] font-black uppercase opacity-60">Founded</span>
               </div>
               <div className="w-[1px] h-10 bg-white/20"></div>
               <div className="flex flex-col">
                  <span className="text-3xl font-black">HQ</span>
                  <span className="text-[10px] font-black uppercase opacity-60">Gurgaon, India</span>
               </div>
            </div>
         </div>

         <div className="flex-1 relative z-10">
            <div className="aspect-square bg-white/10 rounded-[3rem] border border-white/20 flex items-center justify-center backdrop-blur-sm">
               <Award className="w-32 h-32 text-brand-primary animate-pulse" />
            </div>
         </div>
      </div>

      {/* Call to action */}
      <div className="mt-32 text-center">
         <h3 className="text-3xl font-black mb-8">Ready to join the shipping revolution?</h3>
         <Link 
           to="/calculator"
           className="h-20 px-12 bg-brand-primary text-white rounded-3xl font-black text-xl inline-flex items-center gap-4 hover:bg-brand-secondary transition-all hover:scale-[1.05] shadow-2xl shadow-brand-primary/30"
         >
           Book Your First Parcel <ArrowRight className="w-6 h-6" />
         </Link>
      </div>
    </div>
  )
}
