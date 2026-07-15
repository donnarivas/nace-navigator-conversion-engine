/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  CalendarClock, 
  Check, 
  ClipboardList, 
  Copy, 
  Mail, 
  Phone, 
  Plus, 
  Save, 
  Trash2, 
  X,
  Tag,
  User,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { CampaignType, Contact, ContactStatus, QuestionnaireAnswers } from '../types';
import QuestionnaireForm from './QuestionnaireForm';

interface ContactDrawerProps {
  contact: Contact | null;
  onClose: () => void;
  onUpdateContact: (updatedContact: Contact) => void;
  availableTags: string[];
  onCreateTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ContactDrawer({ 
  contact, 
  onClose, 
  onUpdateContact,
  availableTags,
  onCreateTag,
  onDeleteTag,
  showToast
}: ContactDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'questionnaire' | 'email'>('details');
  const [status, setStatus] = useState<ContactStatus>('Not Contacted');
  const [campaign, setCampaign] = useState<CampaignType>('None');
  const [notes, setNotes] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderText, setReminderText] = useState('');
  
  // Editable core fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [companyType, setCompanyType] = useState('University / College');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateContacted, setDateContacted] = useState('');
  
  // Custom Tags state
  const [contactTags, setContactTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');

  // Local email generation state
  const [copied, setCopied] = useState(false);

  // Sync state with selected contact
  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName || '');
      setLastName(contact.lastName || '');
      setCompany(contact.company || '');
      setCompanyType(contact.companyType || 'University / College');
      setTitle(contact.title || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setDateContacted(contact.dateContacted || '');
      
      setStatus(contact.status);
      setCampaign(contact.campaign);
      setNotes(contact.notes || '');
      setReminderDate(contact.reminderDate || '');
      setReminderText(contact.reminderText || '');
      setContactTags(contact.customTags || []);
      setActiveTab('details');
    }
  }, [contact]);

  if (!contact) return null;

  const handleSaveDetails = () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('First Name and Last Name are required.', 'error');
      return;
    }

    const updated: Contact = {
      ...contact,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      companyType: companyType.trim(),
      title: title.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateContacted: dateContacted || null,
      status,
      campaign,
      notes,
      reminderDate: reminderDate || null,
      reminderText: reminderDate ? (reminderText || 'Follow-up scheduled') : null,
      customTags: contactTags
    };
    
    onUpdateContact(updated);
    showToast('Contact record saved successfully!', 'success');
  };

  const handleSaveQuestionnaire = (answers: QuestionnaireAnswers) => {
    const updated: Contact = {
      ...contact,
      status: 'Questionnaire Completed',
      questionnaireAnswers: answers
    };
    onUpdateContact(updated);
    showToast('Questionnaire response saved successfully!', 'success');
  };

  const handleDeleteReminder = () => {
    setReminderDate('');
    setReminderText('');
    const updated: Contact = {
      ...contact,
      reminderDate: null,
      reminderText: null
    };
    onUpdateContact(updated);
    showToast('Reminder removed.', 'info');
  };

  const setReminderPreset = (daysAhead: number) => {
    const date = new Date('2026-07-14'); // assume today is 2026-07-14
    date.setDate(date.getDate() + daysAhead);
    const isoString = date.toISOString().split('T')[0];
    setReminderDate(isoString);
    if (!reminderText) {
      setReminderText(`Follow-up regarding ${campaign === 'None' ? 'outreach' : campaign}`);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (contactTags.includes(tag)) {
      setContactTags(contactTags.filter(t => t !== tag));
    } else {
      setContactTags([...contactTags, tag]);
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const tag = newTagName.trim();
    onCreateTag(tag);
    if (!contactTags.includes(tag)) {
      setContactTags([...contactTags, tag]);
    }
    setNewTagName('');
  };

  // Generate Email Content
  const generateEmailDraft = () => {
    const isSitA = campaign === 'Situation A';
    const isSitB = campaign === 'Situation B';
    
    if (isSitA) {
      return `Subject: Partnership Proposal: Dual-Track Student Engagement Campaign (Logic Track)

Dear ${firstName} ${lastName},

At the Lean Education Agile Foundry (L-EAF) Laboratory, we have been following the incredible work that ${company} does to support students, and we would love to explore a potential partnership.

We are currently launching a new engagement initiative for Fall 2026 designed to help students confidently transition from studies into their careers. To optimize enrollment, we are conducting a focused A/B testing campaign. 

Under the "Logic" (Situation A) framework, our outreach focuses on tangible, resume-ready credentials and structured career skills. This ensures students see immediate, validated value and professional alignment in participating in career development.

By partnering with us, your department will receive a comprehensive Institutional Impact Analysis report containing validated growth data to support your office's goals and assist in justifying program expansions to university leadership.

We would be extremely grateful if you could take a few moments to fill out our brief consultation questionnaire to help align this initiative with your needs:
https://forms.gle/Ehi8r3mvshg8nYze7

Thank you so much for your time and leadership.

Best regards,

Donna Rivas
L-EAF Laboratory Outreach Team
donnaarivas10@gmail.com`;
    } else if (isSitB) {
      return `Subject: Supporting Student Fulfillment: Fall 2026 Career Discovery (Emotion Track)

Dear ${firstName} ${lastName},

At the Lean Education Agile Foundry (L-EAF) Laboratory, we have been following the incredible work that ${company} does to support students, and we would love to explore a potential partnership.

We are currently launching a new engagement initiative for Fall 2026 designed to help students confidently transition from studies into their careers. To optimize enrollment, we are conducting a focused A/B testing campaign. 

Under the "Emotion" (Situation B) framework, our outreach specifically addresses student sentiment—such as the "Fear of Being Unprepared"—using discovery-focused, self-actualizing narratives. This builds confidence and addresses psychological barriers to career participation.

By partnering with us, your department will receive a comprehensive Institutional Impact Analysis report containing validated growth data to support your office's goals and assist in justifying program expansions to university leadership.

We would be extremely grateful if you could take a few moments to fill out our brief consultation questionnaire to help align this initiative with your needs:
https://forms.gle/Ehi8r3mvshg8nYze7

Thank you so much for your time and leadership.

Best regards,

Donna Rivas
L-EAF Laboratory Outreach Team
donnaarivas10@gmail.com`;
    } else {
      return `Subject: Introduction: Lean Education Agile Foundry (L-EAF) Lab & ${company}

Dear ${firstName} ${lastName},

At the Lean Education Agile Foundry (L-EAF) Laboratory, we are deeply committed to bridging the gap between academic theory and professional implementation.

We have been following the incredible work ${company} does to support student outcomes, and we would love to schedule a brief consultation to explore a potential collaboration for the upcoming Fall 2026 semester.

Could you please take a few moments to fill out our brief consultation questionnaire to help us understand your department's top priorities?
https://forms.gle/Ehi8r3mvshg8nYze7

We look forward to connecting soon.

Best regards,

Donna Rivas
L-EAF Laboratory Outreach Team
donnaarivas10@gmail.com`;
    }
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(generateEmailDraft());
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-brand-100">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-brand-100 flex items-center justify-between bg-brand-50">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-brand-600">Contact File Manager</span>
            <h2 className="text-base font-display font-bold text-brand-950 truncate mt-0.5">
              {firstName || lastName ? `${firstName} ${lastName}` : 'New Contact Profile'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-brand-200/50 rounded-lg text-brand-500 hover:text-brand-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-brand-100 px-6 bg-brand-50/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'details' ? 'border-brand-900 text-brand-950 bg-white border-b-white font-semibold' : 'border-transparent text-brand-500 hover:text-brand-800'}`}
          >
            Details & Follow-up
          </button>
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`py-3 px-4 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'questionnaire' ? 'border-brand-900 text-brand-950 bg-white border-b-white font-semibold' : 'border-transparent text-brand-500 hover:text-brand-800'}`}
          >
            <ClipboardList className="w-4 h-4 text-brand-600" />
            <span>Questionnaire Response</span>
            {contact.questionnaireAnswers && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-4 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'email' ? 'border-brand-900 text-brand-950 bg-white border-b-white font-semibold' : 'border-transparent text-brand-500 hover:text-brand-800'}`}
          >
            <Mail className="w-4 h-4 text-brand-600" />
            <span>Outreach Templates</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* TAB 1: DETAILS & REMINDERS */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-6">
              
              {/* Profile Card & Core Fields Inputs */}
              <div className="bg-brand-50/40 border border-brand-100/60 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-1.5 border-b border-brand-100 pb-2">
                  <User className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-display font-bold text-brand-950">Core Contact Profile</span>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Donna"
                      className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Rivas"
                      className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-sans"
                    />
                  </div>
                </div>

                {/* Company & Org Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold">Organization / Center</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Florida Career Center"
                      className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold">Organization Type</label>
                    <input
                      type="text"
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      placeholder="e.g. University / College"
                      className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Director of Career Services"
                    className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-sans"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@univ.edu"
                      className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. (555) 012-3456"
                      className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Date Contacted */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-brand-500 uppercase tracking-wider font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>Date Reached / Contacted</span>
                  </label>
                  <input
                    type="date"
                    value={dateContacted}
                    onChange={(e) => setDateContacted(e.target.value)}
                    className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-mono"
                  />
                  <span className="text-[9px] text-brand-400">Record when you sent outreach or made contact. Helps track response times.</span>
                </div>
              </div>

              {/* Campaign track & status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-bold">Campaign Track</label>
                  <select
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value as CampaignType)}
                    className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm"
                  >
                    <option value="None">Unassigned</option>
                    <option value="Situation A">Situation A (Logic)</option>
                    <option value="Situation B">Situation B (Emotion)</option>
                  </select>
                  <span className="text-[9px] text-brand-400 leading-normal">
                    {campaign === 'Situation A' ? 'Resume ready, credentials focus' : campaign === 'Situation B' ? 'Discovery narrative, address fear' : 'Assign outreach theme'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-bold">Outreach Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ContactStatus)}
                    className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-semibold"
                  >
                    <option value="Not Contacted">Not Contacted</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                    <option value="Questionnaire Completed">Questionnaire Completed</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              {/* Custom Status Tags Section */}
              <div className="border-t border-brand-100 pt-5 flex flex-col gap-3">
                <span className="text-xs font-display font-bold text-brand-950 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-brand-600" />
                  <span>Custom Status Tags</span>
                </span>
                
                {/* Active tags on contact */}
                <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                  {contactTags.length > 0 ? (
                    contactTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-brand-100 text-brand-900 text-xs font-semibold px-2.5 py-1 rounded-xl">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className="w-3.5 h-3.5 rounded-full hover:bg-brand-200 flex items-center justify-center text-brand-500 hover:text-brand-800 text-[10px] cursor-pointer font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-brand-400 italic">No custom status tags assigned yet.</span>
                  )}
                </div>

                {/* Tag pool selector */}
                <div className="mt-1 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-brand-400 font-bold uppercase tracking-wider">Available Tags (Click to toggle)</span>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-1.5 bg-brand-50/50 rounded-xl border border-brand-100/40">
                    {availableTags.map(tag => {
                      const isAssigned = contactTags.includes(tag);
                      return (
                        <div key={tag} className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg shadow-xs border border-brand-100">
                          <button
                            type="button"
                            onClick={() => handleToggleTag(tag)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all cursor-pointer ${
                              isAssigned
                                ? 'bg-brand-900 border-brand-900 text-white font-semibold'
                                : 'bg-white border-brand-200 text-brand-700 hover:border-brand-400'
                            }`}
                          >
                            {tag}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTag(tag)}
                            title="Delete tag globally"
                            className="text-brand-300 hover:text-rose-600 transition-colors cursor-pointer text-xs font-bold leading-none p-0.5"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                    {availableTags.length === 0 && (
                      <span className="text-xs text-brand-400 italic p-1">No custom tags created yet.</span>
                    )}
                  </div>
                </div>

                {/* Create custom tag inline */}
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Create a new tag..."
                    className="flex-1 bg-white border border-brand-100 rounded-xl py-1.5 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className="bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Automated Reminder Scheduling Panel */}
              <div className="border-t border-brand-100 pt-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-brand-700" />
                    <span className="text-xs font-display font-bold text-brand-950">Automated Follow-up Reminder</span>
                  </div>
                  {reminderDate && (
                    <button
                      onClick={handleDeleteReminder}
                      className="text-[10px] font-mono font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-brand-500 font-bold uppercase tracking-wider">Follow-up Date</span>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="bg-white border border-brand-100 rounded-xl py-1.5 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-brand-500 font-bold uppercase tracking-wider">Quick Presets</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setReminderPreset(1)}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-800 text-[10px] py-1 rounded border border-brand-200 font-medium transition-all"
                      >
                        +1 Day
                      </button>
                      <button
                        onClick={() => setReminderPreset(3)}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-800 text-[10px] py-1 rounded border border-brand-200 font-medium transition-all"
                      >
                        +3 Days
                      </button>
                      <button
                        onClick={() => setReminderPreset(7)}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-800 text-[10px] py-1 rounded border border-brand-200 font-medium transition-all"
                      >
                        +1 Wk
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-brand-500 font-bold uppercase tracking-wider">Reminder Instructions</span>
                  <input
                    type="text"
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    placeholder="e.g. Email regarding Situation A track logic credentials..."
                    className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Interaction Notes */}
              <div className="border-t border-brand-100 pt-5 flex flex-col gap-2">
                <span className="text-xs font-display font-bold text-brand-950">Outreach Log Notes</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record interaction summaries, voice notes, next actions, or objections here..."
                  className="w-full bg-white border border-brand-100 rounded-xl p-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 shadow-sm leading-relaxed"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-brand-50 flex justify-end">
                <button
                  onClick={handleSaveDetails}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer font-sans"
                >
                  <Save className="w-4 h-4 text-brand-300" />
                  <span>Save Tracking Data</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUESTIONNAIRE FORM */}
          {activeTab === 'questionnaire' && (
            <div className="flex flex-col gap-4">
              <QuestionnaireForm 
                contact={contact} 
                onSaveAnswers={handleSaveQuestionnaire}
              />
            </div>
          )}

          {/* TAB 3: OUTREACH EMAIL TEMPLATE */}
          {activeTab === 'email' && (
            <div className="flex flex-col gap-4">
              <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl text-xs flex flex-col gap-1 leading-normal text-brand-700">
                <span className="font-bold text-brand-950">Dual-Track Strategy Guidance:</span>
                <span><strong>Situation A (Logic)</strong>: Highlights credentials, validated skills, and alignment with modern metrics.</span>
                <span><strong>Situation B (Emotion)</strong>: Focuses on career exploration, student fulfillment, and dismantling "Fear of preparedness".</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brand-500 font-bold uppercase tracking-wider">Outreach Message Draft</span>
                  <button
                    onClick={copyEmailToClipboard}
                    className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-brand-700 hover:text-brand-950 border border-brand-200 px-2.5 py-1.5 rounded-lg bg-white shadow-xs transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-brand-500" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-brand-50/30 border border-brand-100 rounded-xl p-4 font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-all max-h-[420px] overflow-y-auto">
                  {generateEmailDraft()}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
