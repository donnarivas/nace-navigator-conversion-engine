/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpenCheck, Brain, CalendarClock, Flame, HelpCircle, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Contact } from '../types';

interface StatsDashboardProps {
  contacts: Contact[];
  dueRemindersCount: number;
}

export default function StatsDashboard({ contacts, dueRemindersCount }: StatsDashboardProps) {
  // Compute Stats
  const total = contacts.length;
  const contacted = contacts.filter(c => c.status !== 'Not Contacted').length;
  const sitA = contacts.filter(c => c.campaign === 'Situation A').length;
  const sitB = contacts.filter(c => c.campaign === 'Situation B').length;
  
  const sitA_contacted = contacts.filter(c => c.campaign === 'Situation A' && c.status !== 'Not Contacted').length;
  const sitB_contacted = contacts.filter(c => c.campaign === 'Situation B' && c.status !== 'Not Contacted').length;
  
  const questionnairesDone = contacts.filter(c => c.status === 'Questionnaire Completed' || c.questionnaireAnswers !== null).length;
  
  const contactedPercent = total > 0 ? Math.round((contacted / total) * 100) : 0;
  const qPercent = contacted > 0 ? Math.round((questionnairesDone / contacted) * 100) : 0;
  
  const sitA_percent = sitA > 0 ? Math.round((sitA_contacted / sitA) * 100) : 0;
  const sitB_percent = sitB > 0 ? Math.round((sitB_contacted / sitB) * 100) : 0;

  // Render a responsive bento grid of metric cards
  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Reach Database */}
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/60 relative overflow-hidden flex flex-col justify-between"
          id="stat-total-contacts"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-100/40 rounded-bl-full -z-10" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-brand-600 font-semibold tracking-wider uppercase">CRM Database</span>
            <div className="p-2 bg-brand-50 rounded-xl text-brand-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-display font-extrabold text-brand-950">{total.toLocaleString()}</span>
            <span className="block text-xs font-sans text-brand-500 mt-1">Total Loaded Contacts</span>
          </div>
          <div className="mt-4 pt-3 border-t border-brand-50 flex items-center justify-between text-xs font-mono text-brand-600">
            <span>Contacted: <strong className="text-brand-950">{contacted}</strong></span>
            <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-bold">{contactedPercent}% Tracked</span>
          </div>
        </motion.div>

        {/* Card 2: Situation A (Logic) */}
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/60 relative overflow-hidden flex flex-col justify-between"
          id="stat-situation-a"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-100/40 rounded-bl-full -z-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-brand-800 font-semibold tracking-wider uppercase">Situation A</span>
              <span className="text-[10px] font-sans text-brand-500">Logic &bull; Resume Ready</span>
            </div>
            <div className="p-2 bg-brand-50 rounded-xl text-brand-800">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-display font-extrabold text-brand-950">{sitA_contacted} <span className="text-xs font-normal text-brand-400 font-sans">/ {sitA}</span></span>
            <span className="block text-xs font-sans text-brand-500 mt-1">Active Interactions Logged</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-brand-50 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-800 h-full rounded-full transition-all duration-500" style={{ width: `${sitA_percent}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-brand-700 mt-2">
              <span>Conversion</span>
              <span>{sitA_percent}%</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Situation B (Emotion) */}
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/60 relative overflow-hidden flex flex-col justify-between"
          id="stat-situation-b"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-100/40 rounded-bl-full -z-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-brand-600 font-semibold tracking-wider uppercase">Situation B</span>
              <span className="text-[10px] font-sans text-brand-500">Emotion &bull; Fulfillment</span>
            </div>
            <div className="p-2 bg-brand-100/50 rounded-xl text-brand-600">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-display font-extrabold text-brand-950">{sitB_contacted} <span className="text-xs font-normal text-brand-400 font-sans">/ {sitB}</span></span>
            <span className="block text-xs font-sans text-brand-500 mt-1">Active Interactions Logged</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-brand-50 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${sitB_percent}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-brand-600 mt-2">
              <span>Conversion</span>
              <span>{sitB_percent}%</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Follow-up Reminders & Forms */}
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/60 relative overflow-hidden flex flex-col justify-between"
          id="stat-reminders"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-100/40 rounded-bl-full -z-10" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-emerald-700 font-semibold tracking-wider uppercase">Outcomes & Consults</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <BookOpenCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="block text-3xl font-display font-extrabold text-brand-950">{questionnairesDone}</span>
            <span className="block text-xs font-sans text-brand-500 mt-1">Questionnaires Filled Out</span>
          </div>
          <div className="mt-4 pt-3 border-t border-brand-50 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-brand-600">
              <CalendarClock className="w-4 h-4 text-amber-500" />
              Reminders: <strong className={dueRemindersCount > 0 ? "text-amber-600 font-bold animate-pulse" : "text-brand-950"}>{dueRemindersCount}</strong>
            </span>
            <span className="text-emerald-700 font-bold">{qPercent}% of Contacted</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
