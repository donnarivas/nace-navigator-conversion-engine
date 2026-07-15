/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

interface ContactFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCompanyType: string;
  setSelectedCompanyType: (type: string) => void;
  selectedCampaign: string;
  setSelectedCampaign: (campaign: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedCustomTag: string;
  setSelectedCustomTag: (tag: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onlyDueReminders: boolean;
  setOnlyDueReminders: (val: boolean) => void;
  companyTypes: string[];
  availableTags: string[];
  resetFilters: () => void;
}

export default function ContactFilters({
  searchQuery,
  setSearchQuery,
  selectedCompanyType,
  setSelectedCompanyType,
  selectedCampaign,
  setSelectedCampaign,
  selectedStatus,
  setSelectedStatus,
  selectedCustomTag,
  setSelectedCustomTag,
  sortBy,
  setSortBy,
  onlyDueReminders,
  setOnlyDueReminders,
  companyTypes,
  availableTags,
  resetFilters
}: ContactFiltersProps) {
  
  const hasActiveFilters = searchQuery !== '' || 
                           selectedCompanyType !== 'All' || 
                           selectedCampaign !== 'All' || 
                           selectedStatus !== 'All' || 
                           selectedCustomTag !== 'All' ||
                           onlyDueReminders;

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/55">
      <div className="flex items-center justify-between mb-4 border-b border-brand-100/30 pb-3">
        <div className="flex items-center gap-2 text-brand-950 font-display font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span>Filter & Sort Directory Control Center</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2 lg:col-span-1">
          <label className="block text-[11px] font-mono text-brand-500 uppercase tracking-wider mb-1.5 font-bold">Search Contacts</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-brand-50/50 border border-brand-100 rounded-xl py-2 pl-9 pr-4 text-xs text-brand-950 placeholder-brand-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        {/* Company Type Dropdown */}
        <div>
          <label className="block text-[11px] font-mono text-brand-500 uppercase tracking-wider mb-1.5 font-bold">Org Type</label>
          <select
            value={selectedCompanyType}
            onChange={(e) => setSelectedCompanyType(e.target.value)}
            className="w-full bg-brand-50/50 border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-sans cursor-pointer"
          >
            <option value="All">All Types</option>
            {companyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Campaign Dropdown */}
        <div>
          <label className="block text-[11px] font-mono text-brand-500 uppercase tracking-wider mb-1.5 font-bold">Outreach Campaign</label>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full bg-brand-50/50 border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-sans font-semibold cursor-pointer"
          >
            <option value="All">All Campaigns</option>
            <option value="None">No Campaign (Unassigned)</option>
            <option value="Situation A">Situation A (Logic)</option>
            <option value="Situation B">Situation B (Emotion)</option>
          </select>
        </div>

        {/* Contact Status Dropdown */}
        <div>
          <label className="block text-[11px] font-mono text-brand-500 uppercase tracking-wider mb-1.5 font-bold">Outreach Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-brand-50/50 border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-sans cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Not Contacted">Not Contacted</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-up Scheduled">Follow-up Scheduled</option>
            <option value="Questionnaire Completed">Questionnaire Completed</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        {/* Custom Tags Dropdown */}
        <div>
          <label className="block text-[11px] font-mono text-brand-500 uppercase tracking-wider mb-1.5 font-bold">Custom Tag Filter</label>
          <select
            value={selectedCustomTag}
            onChange={(e) => setSelectedCustomTag(e.target.value)}
            className="w-full bg-brand-50/50 border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-sans cursor-pointer font-medium text-brand-800"
          >
            <option value="All">All Custom Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div>
          <label className="block text-[11px] font-mono text-brand-500 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-brand-500" />
            <span>Sort Directory</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-brand-50/50 border border-brand-100 rounded-xl py-2 px-3 text-xs text-brand-950 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-sans font-bold cursor-pointer"
          >
            <option value="name-asc">Name (A &rarr; Z)</option>
            <option value="name-desc">Name (Z &rarr; A)</option>
            <option value="date-contacted-newest">Date Reached (Newest)</option>
            <option value="date-contacted-oldest">Date Reached (Oldest)</option>
            <option value="follow-up-asc">Follow-up Date (Earliest)</option>
            <option value="follow-up-desc">Follow-up Date (Latest)</option>
            <option value="custom-tag">Custom Tag (A &rarr; Z)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-brand-50">
        {/* Toggle Switch for Reminders */}
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyDueReminders}
            onChange={(e) => setOnlyDueReminders(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-brand-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
          <span className="text-xs font-sans text-brand-700 font-medium">Show only contacts with due/pending follow-up reminders</span>
        </label>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-900 border border-brand-200 hover:border-brand-300 px-3 py-1.5 rounded-xl transition-all font-sans cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Active Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
