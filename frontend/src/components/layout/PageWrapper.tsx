import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function PageWrapper({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  )
}
