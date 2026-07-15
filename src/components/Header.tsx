/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FlaskConical, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="relative w-full overflow-hidden bg-gradient-to-r from-brand-950/70 via-brand-900/60 to-brand-950/70 backdrop-blur-md border-b border-brand-900/30 text-white shadow-xl">
      {/* Dynamic/Pencil Sketch Decorative SVG Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Conceptual organic/technical sketch overlays */}
          <path d="M 50 150 C 150 100, 200 250, 350 200 C 450 150, 500 80, 650 120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5,5" />
          <path d="M 800 50 C 950 150, 1050 50, 1200 120 C 1300 180, 1400 100, 1500 220" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          
          {/* Engineering symbols/beaker sketch circles */}
          <circle cx="250" cy="180" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle cx="250" cy="180" r="3" fill="rgba(255,255,255,0.3)" />
          <circle cx="1100" cy="80" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          
          {/* Organic Leaf-like wavy curve */}
          <path d="M-50,220 Q 200,100 450,240 T 950,150 T 1450,230" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Brand Logo & Name */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* L@B Branded Logo Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex items-center justify-center bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-inner border border-brand-200/50 w-24 h-24 shrink-0 select-none"
          >
            <div className="flex items-center justify-center font-display font-extrabold text-4xl text-brand-900 tracking-tighter">
              {/* L with a green leaf */}
              <span className="relative text-brand-950 flex items-center">
                L
                <motion.span
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="absolute -top-1.5 -left-1 text-emerald-600"
                >
                  <Leaf className="w-5 h-5 fill-emerald-500/20" />
                </motion.span>
              </span>
              
              {/* @ symbol styled inside/as a conical beaker flask */}
              <span className="relative flex items-center justify-center text-teal-600 px-0.5">
                <span className="relative z-10 text-2xl -top-0.5">@</span>
                <FlaskConical className="absolute w-10 h-10 text-teal-500/30 fill-teal-500/10 stroke-[1.5]" />
              </span>
              
              {/* B in dark blue */}
              <span className="text-brand-800">B</span>
            </div>
            
            {/* Small label below logo */}
            <div className="absolute -bottom-1 left-0 right-0 text-[7px] text-center font-mono font-medium tracking-tight text-brand-900 uppercase bg-brand-100 py-0.5 rounded-b-lg border-t border-brand-200">
              L-EAF Lab
            </div>
          </motion.div>

          {/* Heading Text */}
          <div className="flex flex-col">
            <motion.h1 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white"
            >
              Lean Education Agile Foundry Laboratory
            </motion.h1>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-brand-200 text-xs md:text-sm font-mono mt-1 tracking-wide"
            >
              Academic Engagement Initiative &bull; Fall 2026 Dual-Track Outreach
            </motion.p>
          </div>
        </div>

        {/* Live Status Tracker Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl flex flex-row items-center gap-4 text-xs font-mono text-brand-100 self-stretch md:self-auto justify-between"
        >
          <div className="flex flex-col">
            <span className="text-brand-300 font-sans text-[11px] font-semibold tracking-wider uppercase">Outreach Phase</span>
            <span className="text-white text-sm font-medium mt-0.5">Dual Campaign Launch</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-brand-300 font-sans text-[11px] font-semibold tracking-wider uppercase">A/B Testing Model</span>
            <span className="text-emerald-400 font-semibold text-sm mt-0.5">Logic vs. Emotion</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
