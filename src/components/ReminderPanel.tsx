/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarClock, Check, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact } from '../types';

interface ReminderPanelProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onRemoveReminder: (id: string) => void;
}

export default function ReminderPanel({ contacts, onSelectContact, onRemoveReminder }: ReminderPanelProps) {
  // Assume today is 2026-07-14
  const todayStr = '2026-07-14';
  const today = new Date(todayStr + 'T00:00:00');

  // Filter contacts with reminders
  const reminderContacts = contacts.filter(c => c.reminderDate !== null);

  // Sort: due ones first (reminderDate <= today), then others sorted chronologically
  const sortedReminders = [...reminderContacts].sort((a, b) => {
    const dateA = new Date(a.reminderDate! + 'T00:00:00');
    const dateB = new Date(b.reminderDate! + 'T00:00:00');
    return dateA.getTime() - dateB.getTime();
  });

  const dueReminders = sortedReminders.filter(c => new Date(c.reminderDate! + 'T00:00:00') <= today);
  const upcomingReminders = sortedReminders.filter(c => new Date(c.reminderDate! + 'T00:00:00') > today);

  if (reminderContacts.length === 0) {
    return (
      <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm text-center">
        <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <CalendarClock className="w-6 h-6 text-brand-400" />
        </div>
        <h3 className="text-sm font-display font-bold text-brand-950">No Active Reminders</h3>
        <p className="text-xs text-brand-500 mt-1 max-w-[240px] mx-auto">
          Reminders help you stay on top of your outreach pipeline. Add them when managing contacts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4.5 h-4.5 text-brand-700" />
          <h3 className="text-sm font-display font-bold text-brand-950">Outreach Queue & Reminders</h3>
        </div>
        <span className="bg-brand-100 text-brand-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
          {reminderContacts.length} Total
        </span>
      </div>

      {/* Due Reminders Group */}
      {dueReminders.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
            ACTION REQUIRED (DUE / OVERDUE)
          </span>
          <div className="flex flex-col gap-2.5">
            {dueReminders.map(contact => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start justify-between gap-3 transition-colors group"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-brand-950 truncate max-w-[170px]">
                    {contact.firstName} {contact.lastName}
                  </span>
                  <span className="text-[10px] text-brand-500 truncate max-w-[170px]">
                    {contact.company}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-semibold text-amber-800">
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Due: {contact.reminderDate}</span>
                  </div>
                  {contact.reminderText && (
                    <p className="text-[10px] text-brand-600 bg-white/70 border border-amber-100/30 rounded px-1.5 py-0.5 mt-1 leading-normal italic">
                      "{contact.reminderText}"
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => onSelectContact(contact)}
                    className="p-1.5 bg-white text-brand-800 border border-brand-200 rounded-lg hover:border-brand-400 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shadow-sm transition-all"
                    title="View details and log interaction"
                  >
                    <span>View</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => onRemoveReminder(contact.id)}
                    className="p-1.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 text-[10px] font-bold flex items-center justify-center cursor-pointer transition-all"
                    title="Mark follow-up completed"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders Group */}
      {upcomingReminders.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-brand-500">
            UPCOMING SCHEDULED FOLLOW-UPS
          </span>
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {upcomingReminders.map(contact => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-brand-50/20 hover:bg-brand-50/50 border border-brand-100 rounded-xl p-2.5 flex items-start justify-between gap-3 transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-brand-950 truncate max-w-[170px]">
                    {contact.firstName} {contact.lastName}
                  </span>
                  <span className="text-[10px] text-brand-500 truncate max-w-[170px]">
                    {contact.company}
                  </span>
                  <span className="text-[9px] font-mono font-medium text-brand-600 mt-1">
                    Scheduled: {contact.reminderDate}
                  </span>
                </div>
                <button
                  onClick={() => onSelectContact(contact)}
                  className="p-1 bg-white hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-md text-[10px] cursor-pointer shadow-sm"
                >
                  Edit
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
