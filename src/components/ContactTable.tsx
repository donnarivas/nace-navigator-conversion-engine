/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Mail, 
  MessageSquareCode, 
  Phone, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CampaignType, Contact, ContactStatus } from '../types';

interface ContactTableProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onUpdateStatus: (id: string, status: ContactStatus) => void;
  onUpdateCampaign: (id: string, campaign: CampaignType) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage?: number;
  onAddContact?: () => void;
}

export default function ContactTable({
  contacts,
  onSelectContact,
  onUpdateStatus,
  onUpdateCampaign,
  currentPage,
  setCurrentPage,
  itemsPerPage = 15,
  onAddContact
}: ContactTableProps) {
  
  // Calculate Pagination
  const totalItems = contacts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  
  const startIndex = (adjustedCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = contacts.slice(startIndex, endIndex);

  // Helper for rendering status badges
  const getStatusStyle = (status: ContactStatus) => {
    switch (status) {
      case 'Not Contacted':
        return 'bg-brand-50 text-brand-700 border-brand-100';
      case 'Contacted':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Follow-up Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Questionnaire Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Declined':
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  // Helper for rendering campaign badges
  const getCampaignBadge = (campaign: CampaignType) => {
    switch (campaign) {
      case 'Situation A':
        return (
          <span className="inline-flex items-center gap-1 bg-[#2d5a2715] border border-[#2d5a2733] text-brand-900 font-bold px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase">
            <span className="w-1.5 h-1.5 bg-brand-800 rounded-full" />
            Sit A: Logic
          </span>
        );
      case 'Situation B':
        return (
          <span className="inline-flex items-center gap-1 bg-[#a8c69f33] border border-[#a8c69f66] text-brand-950 font-bold px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
            Sit B: Emotion
          </span>
        );
      case 'None':
        return (
          <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 text-brand-500 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase">
            Unassigned
          </span>
        );
    }
  };

  // Checks if a reminder is active and due (assuming today is 2026-07-14)
  const isReminderDue = (dateStr: string | null) => {
    if (!dateStr) return false;
    const reminderDate = new Date(dateStr + 'T00:00:00');
    const today = new Date('2026-07-14T00:00:00');
    return reminderDate <= today;
  };

  const tableHeaderStyle = "px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-brand-600 font-semibold bg-brand-50/70 border-b border-brand-100";

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:bg-white/50 transition-all duration-300" id="contacts-table-container">
      
      {/* Directory Count Header */}
      <div className="px-5 py-4 border-b border-brand-100/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-display font-bold text-brand-950">Outreach List</span>
          <span className="bg-brand-100 text-brand-800 text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono">
            {totalItems.toLocaleString()} Contacts Found
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-sans text-brand-400">
            Showing {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} of {totalItems}
          </span>
          {onAddContact && (
            <button
              onClick={onAddContact}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer font-sans"
            >
              <span>+ Add Contact</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className={tableHeaderStyle}>Contact Name</th>
              <th className={tableHeaderStyle}>Organization & Title</th>
              <th className={tableHeaderStyle}>Contact Details</th>
              <th className={tableHeaderStyle}>Campaign Track</th>
              <th className={tableHeaderStyle}>Outreach Status</th>
              <th className={tableHeaderStyle}>Reminders / Notes</th>
              <th className={`${tableHeaderStyle} text-right pr-6`}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {currentItems.length > 0 ? (
              currentItems.map((contact, idx) => {
                const isDue = isReminderDue(contact.reminderDate);
                return (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-brand-50/20 transition-colors duration-150 group"
                  >
                    {/* Name */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-display font-bold text-brand-950 text-sm group-hover:text-brand-600 transition-colors">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-[10px] text-brand-400 font-mono mt-0.5 uppercase tracking-wide">
                        ID: {contact.id}
                      </div>
                    </td>

                    {/* Organization & Title */}
                    <td className="px-4 py-3.5">
                      <div className="font-sans font-semibold text-brand-950 max-w-[220px] truncate" title={contact.company}>
                        {contact.company}
                      </div>
                      <div className="text-xs text-brand-500 flex items-center gap-1.5 mt-0.5 max-w-[220px] truncate" title={contact.title}>
                        <span className="bg-brand-50 text-brand-700 text-[10px] font-medium font-mono px-1 py-0.2 rounded border border-brand-100/40">{contact.companyType}</span>
                        <span className="truncate">{contact.title}</span>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-xs">
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="flex items-center gap-1.5 text-brand-600 hover:text-brand-900 group/link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="w-3.5 h-3.5 text-brand-400 group-hover/link:text-brand-600" />
                          <span className="underline select-all">{contact.email}</span>
                        </a>
                        <div className="flex items-center gap-1.5 text-brand-500">
                          <Phone className="w-3.5 h-3.5 text-brand-300" />
                          <span className="select-all">{contact.phone}</span>
                        </div>
                        {contact.dateContacted && (
                          <div className="inline-flex items-center gap-1 text-[9px] text-brand-700 bg-brand-100 border border-brand-200/50 px-1.5 py-0.5 rounded font-mono font-medium w-fit mt-0.5">
                            Reached: {contact.dateContacted}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Campaign Track */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        {getCampaignBadge(contact.campaign)}
                        
                        {/* Quick toggle link */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateCampaign(contact.id, contact.campaign === 'Situation A' ? 'Situation B' : 'Situation A')}
                            className="text-[9px] font-mono font-bold text-brand-500 hover:text-brand-900 underline bg-transparent border-none p-0 cursor-pointer"
                          >
                            Switch Track
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Outreach Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={contact.status}
                          onChange={(e) => onUpdateStatus(contact.id, e.target.value as ContactStatus)}
                          className={`text-xs border rounded-lg py-1 px-2 font-medium focus:outline-none transition-all ${getStatusStyle(contact.status)}`}
                        >
                          <option value="Not Contacted">Not Contacted</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                          <option value="Questionnaire Completed">Questionnaire Completed</option>
                          <option value="Declined">Declined</option>
                        </select>
                        
                        {contact.customTags && contact.customTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[140px] mt-0.5">
                            {contact.customTags.map(tag => (
                              <span 
                                key={tag} 
                                className="bg-brand-50 border border-brand-100 text-brand-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Reminders / Notes */}
                    <td className="px-4 py-3.5">
                      {contact.reminderDate ? (
                        <div className={`flex items-start gap-1.5 text-xs p-1.5 rounded-lg border ${isDue ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-brand-50/40 border-brand-100/60 text-brand-600'}`}>
                          <CalendarClock className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDue ? 'text-amber-500' : 'text-brand-400'}`} />
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-[10px]">
                              {isDue ? 'DUE TODAY' : `Follow-up: ${contact.reminderDate}`}
                            </span>
                            <span className="text-[10px] leading-tight max-w-[150px] truncate" title={contact.reminderText || ''}>
                              {contact.reminderText || 'Remind follow-up'}
                            </span>
                          </div>
                        </div>
                      ) : contact.notes ? (
                        <div className="text-[11px] text-brand-500 max-w-[160px] truncate italic" title={contact.notes}>
                          "{contact.notes}"
                        </div>
                      ) : (
                        <span className="text-xs text-brand-300 italic font-sans">No reminders set</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* Manage details button */}
                        <button
                          onClick={() => onSelectContact(contact)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-900 bg-brand-50 hover:bg-brand-100 border border-brand-200 hover:border-brand-300 rounded-xl transition-all cursor-pointer shadow-sm font-sans"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-brand-400 font-sans">
                  No contacts found matching the filters. Try resetting search queries or changing selection filters!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-brand-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-50/30">
          <span className="text-xs font-mono text-brand-500 font-medium">
            Page {adjustedCurrentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, adjustedCurrentPage - 1))}
              disabled={adjustedCurrentPage === 1}
              className="p-1.5 border border-brand-200 rounded-lg hover:bg-brand-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-brand-700" />
            </button>
            
            {/* Show compressed pagination numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, k) => {
              // Sliding window of page numbers
              let pageNum = k + 1;
              if (adjustedCurrentPage > 3) {
                if (adjustedCurrentPage + 2 <= totalPages) {
                  pageNum = adjustedCurrentPage - 2 + k;
                } else {
                  pageNum = totalPages - 4 + k;
                }
              }
              // clamp values
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold rounded-lg transition-all ${adjustedCurrentPage === pageNum ? 'bg-brand-800 text-white' : 'border border-brand-100 hover:bg-brand-50 text-brand-700'}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, adjustedCurrentPage + 1))}
              disabled={adjustedCurrentPage === totalPages}
              className="p-1.5 border border-brand-200 rounded-lg hover:bg-brand-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-brand-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
