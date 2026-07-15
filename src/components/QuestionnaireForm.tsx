/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Check, ClipboardList, Info, Star } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { Contact, QuestionnaireAnswers } from '../types';

interface QuestionnaireFormProps {
  contact?: Contact | null; // If provided, we are filling it out or editing it for them
  onSaveAnswers?: (answers: QuestionnaireAnswers) => void;
  readOnly?: boolean;
}

const defaultAnswers = (contact?: Contact | null): QuestionnaireAnswers => ({
  institutionDepartment: contact ? `${contact.company} - ${contact.title}` : '',
  contactNumber: contact ? contact.phone : '',
  availableTimes: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  },
  challenges: '',
  topicsToDiscuss: [],
  fallPriority: 'Enhancing Student Outcomes',
  preferredContactMethod: 'Email',
  comments: '',
  helpfulnessScale: 5,
  additionalMetrics: ''
});

export default function QuestionnaireForm({ contact, onSaveAnswers, readOnly = false }: QuestionnaireFormProps) {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(defaultAnswers(contact));
  const [isSaved, setIsSaved] = useState(false);

  // Sync state with selected contact
  useEffect(() => {
    if (contact && contact.questionnaireAnswers) {
      setAnswers(contact.questionnaireAnswers);
    } else {
      setAnswers(defaultAnswers(contact));
    }
    setIsSaved(false);
  }, [contact]);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];
  const timeSlots = ['Morning', 'Midday', 'Afternoon', 'Evening'];

  const handleTimeToggle = (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', slot: string) => {
    if (readOnly) return;
    setAnswers(prev => {
      const currentSlots = prev.availableTimes[day] || [];
      const updatedSlots = currentSlots.includes(slot)
        ? currentSlots.filter(s => s !== slot)
        : [...currentSlots, slot];
      return {
        ...prev,
        availableTimes: {
          ...prev.availableTimes,
          [day]: updatedSlots
        }
      };
    });
  };

  const handleTopicToggle = (topic: string) => {
    if (readOnly) return;
    setAnswers(prev => {
      const current = prev.topicsToDiscuss;
      const updated = current.includes(topic)
        ? current.filter(t => t !== topic)
        : [...current, topic];
      return {
        ...prev,
        topicsToDiscuss: updated
      };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (readOnly || !onSaveAnswers) return;
    
    onSaveAnswers(answers);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const topics = [
    "Integration with Existing Services: Identifying how the L-EAF Lab framework can complement your department's current career placement programs",
    "Institutional Impact & ROI: Reviewing how the Institutional Impact Analysis report can provide your office with validated growth data to justify program expansion to university leadership",
    "Campaign Strategy (A/B Test): Understanding our dual-track outreach approach—testing \"Logic\" (resume-ready credentials) versus \"Emotion\" (discovery-focused narratives) to optimize student engagement",
    "Addressing Student Sentiment: Discussing the \"Fear of Being Unprepared\" and how we can refine the campaign messaging to specifically address the unique psychological barriers your student body faces",
    "Operational Implementation: Reviewing the Fall 2026 launch cycle and the logistical requirements for the <48-hour high-velocity observation period"
  ];

  const priorities = [
    "Increasing Student Enrollment",
    "Demonstrating Program ROI",
    "Modernizing Career Strategy",
    "Enhancing Student Outcomes",
    "None"
  ];

  const contactMethods = ["Email", "Phone", "Zoom Meeting"];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-sans">
      
      {/* Questionnaire Intro Block */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 text-white p-5 rounded-2xl shadow-sm border border-brand-800">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5 text-teal-400" />
          <h3 className="text-base font-display font-bold">L-EAF Lab Outreach Questionnaire</h3>
        </div>
        <p className="text-[11px] leading-relaxed text-brand-100 font-sans">
          This questionnaire is designed to align our Fall 2026 dual-track campaign with your department's goals. It helps us evaluate whether the <strong>Logic (Resume Credentials)</strong> or <strong>Emotion (Narrative Discovery)</strong> track best drives student engagement.
        </p>
        
        {contact && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/15 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-teal-300 font-bold block text-[10px] uppercase">Recording Response For:</span>
              <span className="font-semibold text-white">{contact.firstName} {contact.lastName}</span>
            </div>
            <div className="text-right">
              <span className="text-brand-300 block text-[10px]">Track Selected:</span>
              <span className="bg-teal-500 text-brand-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {contact.campaign === 'None' ? 'Unassigned' : contact.campaign}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Field 1: Institution & Department */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-2">
        <label className="text-xs font-display font-bold text-brand-950 flex items-center gap-1">
          Institution & Department <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={readOnly}
          value={answers.institutionDepartment}
          onChange={(e) => setAnswers(prev => ({ ...prev, institutionDepartment: e.target.value }))}
          placeholder="e.g. University of Florida - Career Connections Center"
          className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3.5 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-all shadow-sm"
        />
      </div>

      {/* Field 2: Best Contact Number */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-2">
        <label className="text-xs font-display font-bold text-brand-950">
          Best Contact Number <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={readOnly}
          value={answers.contactNumber}
          onChange={(e) => setAnswers(prev => ({ ...prev, contactNumber: e.target.value }))}
          placeholder="e.g. (352) 392-1601"
          className="w-full bg-white border border-brand-100 rounded-xl py-2 px-3.5 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-all shadow-sm"
        />
      </div>

      {/* Field 3: Available Times Grid */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <label className="text-xs font-display font-bold text-brand-950 block">
            What times are you available?
          </label>
          <span className="text-[10px] text-brand-500 font-sans mt-0.5 block">Please select all that apply</span>
        </div>
        
        <div className="overflow-x-auto border border-brand-100/60 rounded-xl bg-white shadow-inner">
          <table className="w-full text-xs text-left min-w-[400px]">
            <thead>
              <tr className="bg-brand-50/50 border-b border-brand-150 text-[10px] uppercase font-mono font-bold text-brand-600">
                <th className="p-2.5">Day</th>
                {timeSlots.map(slot => (
                  <th key={slot} className="p-2.5 text-center">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/55">
              {days.map(day => (
                <tr key={day} className="hover:bg-brand-50/10">
                  <td className="p-2.5 font-semibold text-brand-950">{day}</td>
                  {timeSlots.map(slot => {
                    const isChecked = (answers.availableTimes[day] || []).includes(slot);
                    return (
                      <td key={slot} className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          disabled={readOnly}
                          checked={isChecked}
                          onChange={() => handleTimeToggle(day, slot)}
                          className="w-4 h-4 rounded text-brand-800 border-brand-200 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field 4: Current Student Engagement Challenges */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-2">
        <div>
          <label className="text-xs font-display font-bold text-brand-950 block">
            Current Student Engagement Challenges <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-brand-500 mt-0.5 block font-sans">
            What is the biggest hurdle your department faces when encouraging students to participate in career development programs?
          </span>
        </div>
        <textarea
          rows={3}
          required
          disabled={readOnly}
          value={answers.challenges}
          onChange={(e) => setAnswers(prev => ({ ...prev, challenges: e.target.value }))}
          placeholder="Describe hurdles (e.g. lack of student awareness, busy schedules, fear of preparedness)..."
          className="w-full bg-white border border-brand-100 rounded-xl p-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-all shadow-sm leading-relaxed"
        />
      </div>

      {/* Field 5: Items to Discuss */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <label className="text-xs font-display font-bold text-brand-950 block">
            Items to discuss:
          </label>
          <span className="text-[10px] text-brand-500 mt-0.5 block font-sans">
            Please select the topics you would like to cover during our upcoming consultation:
          </span>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {topics.map((topic, i) => {
            const isChecked = answers.topicsToDiscuss.includes(topic);
            return (
              <label 
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${isChecked ? 'bg-teal-50/30 border-teal-200 text-brand-950 font-medium' : 'bg-white border-brand-100 text-brand-600 hover:bg-brand-50/10'}`}
              >
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={isChecked}
                  onChange={() => handleTopicToggle(topic)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 border-brand-200 focus:ring-teal-500 cursor-pointer shrink-0"
                />
                <span className="leading-relaxed">{topic}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Field 6: Fall priority */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-3">
        <label className="text-xs font-display font-bold text-brand-950">
          Which of the following areas is your department's top priority for the upcoming fall semester?
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {priorities.map(priority => {
            const isChecked = answers.fallPriority === priority;
            return (
              <label
                key={priority}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${isChecked ? 'bg-indigo-50/30 border-indigo-200 text-brand-950 font-medium' : 'bg-white border-brand-100 text-brand-600 hover:bg-brand-50/10'}`}
              >
                <input
                  type="radio"
                  disabled={readOnly}
                  name="fallPriority"
                  checked={isChecked}
                  onChange={() => !readOnly && setAnswers(prev => ({ ...prev, fallPriority: priority }))}
                  className="w-4 h-4 text-indigo-600 border-brand-200 focus:ring-indigo-500 cursor-pointer shrink-0"
                />
                <span>{priority}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Field 7: Preferred Contact Method */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-3">
        <label className="text-xs font-display font-bold text-brand-950">
          Preferred Contact Method:
        </label>
        
        <div className="flex flex-wrap gap-2">
          {contactMethods.map(method => {
            const isChecked = answers.preferredContactMethod === method;
            return (
              <label
                key={method}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${isChecked ? 'bg-teal-50/30 border-teal-200 text-brand-950 font-medium' : 'bg-white border-brand-100 text-brand-600 hover:bg-brand-50/10'}`}
              >
                <input
                  type="radio"
                  disabled={readOnly}
                  name="preferredContactMethod"
                  checked={isChecked}
                  onChange={() => !readOnly && setAnswers(prev => ({ ...prev, preferredContactMethod: method }))}
                  className="w-4 h-4 text-teal-600 border-brand-200 focus:ring-teal-500 cursor-pointer"
                />
                <span>{method}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Field 8: Any other comments */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-2">
        <label className="text-xs font-display font-bold text-brand-950">
          Any other comments and/or questions?
        </label>
        <textarea
          rows={2}
          disabled={readOnly}
          value={answers.comments}
          onChange={(e) => setAnswers(prev => ({ ...prev, comments: e.target.value }))}
          placeholder="Optional comments..."
          className="w-full bg-white border border-brand-100 rounded-xl p-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-all shadow-sm"
        />
      </div>

      {/* Section Break: Refining Collaboration */}
      <div className="border-t border-brand-100 pt-5 mt-2">
        <h4 className="text-xs font-display font-bold text-brand-900 tracking-wide uppercase">Refining Our Collaboration</h4>
        <p className="text-[10px] text-brand-500 font-sans mt-0.5">
          We are committed to making this partnership process as streamlined and helpful as possible for your department. We would love to hear your thoughts on this questionnaire.
        </p>
      </div>

      {/* Field 9: How helpful scale (1-5) */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-3">
        <label className="text-xs font-display font-bold text-brand-950">
          How helpful was the information provided in this form in understanding the L-EAF Lab initiative and the A/B testing framework?
        </label>
        
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(score => {
            const isSelected = answers.helpfulnessScale === score;
            return (
              <button
                type="button"
                key={score}
                disabled={readOnly}
                onClick={() => setAnswers(prev => ({ ...prev, helpfulnessScale: score }))}
                className={`w-10 h-10 flex items-center justify-center font-semibold rounded-xl text-xs transition-all cursor-pointer ${isSelected ? 'bg-brand-900 text-white font-extrabold shadow-md scale-105 border-transparent' : 'bg-white text-brand-700 border border-brand-200 hover:border-brand-400'}`}
              >
                {score}
              </button>
            );
          })}
          <div className="flex items-center gap-1 text-[10px] text-brand-500 font-mono font-medium ml-4">
            <span>(1 = Least, 5 = Most)</span>
          </div>
        </div>
      </div>

      {/* Field 10: Additional Metrics */}
      <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex flex-col gap-2">
        <label className="text-xs font-display font-bold text-brand-950">
          Is there any additional information or specific metrics you feel we should have included in our discussion points?
        </label>
        <textarea
          rows={2}
          disabled={readOnly}
          value={answers.additionalMetrics}
          onChange={(e) => setAnswers(prev => ({ ...prev, additionalMetrics: e.target.value }))}
          placeholder="Optional feedback..."
          className="w-full bg-white border border-brand-100 rounded-xl p-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 transition-all shadow-sm"
        />
      </div>

      {/* Form Action Buttons */}
      {!readOnly && onSaveAnswers && (
        <div className="mt-4 flex items-center gap-3 self-end">
          {isSaved && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
              <Check className="w-4 h-4" /> Response Recorded!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer font-sans uppercase tracking-wider"
          >
            Record Questionnaire Response
          </button>
        </div>
      )}
    </form>
  );
}
