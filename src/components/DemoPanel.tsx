/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Database, Download, RefreshCw, Upload } from 'lucide-react';
import { ChangeEvent, useRef } from 'react';
import { Contact } from '../types';

interface DemoPanelProps {
  onSeedData: () => void;
  onResetData: () => void;
  onExportBackup: () => void;
  onImportBackup: (imported: Contact[]) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DemoPanel({ 
  onSeedData, 
  onResetData, 
  onExportBackup, 
  onImportBackup, 
  showToast,
}: DemoPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.length > 0 && 'id' in json[0] && 'company' in json[0]) {
          onImportBackup(json as Contact[]);
          showToast(`Successfully imported ${json.length} contacts tracking records!`, 'success');
        } else {
          showToast('Invalid tracking data file format. Make sure it is a valid backup file.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/55">
      <div className="flex items-center gap-2 mb-4 text-brand-950 font-display font-semibold text-sm">
        <Database className="w-4.5 h-4.5 text-brand-700" />
        <span>Tracking Database Tools</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Seed Demo Data Button */}
        <button
          onClick={onSeedData}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm group font-sans"
          title="Seed some representative contacts with logs, statuses, and completed questionnaires"
        >
          <Database className="w-4 h-4 text-brand-300 group-hover:scale-110 transition-transform" />
          <span>Seed Simulated History</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetData}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-brand-200 hover:bg-brand-50 text-brand-700 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm font-sans"
          title="Restore the entire database back to pristine 2,467 uncontacted records"
        >
          <RefreshCw className="w-4 h-4 text-brand-400" />
          <span>Reset Tracker State</span>
        </button>

        {/* Export Backup Button */}
        <button
          onClick={onExportBackup}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-brand-200 hover:bg-brand-50 text-brand-700 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm font-sans"
          title="Download the current CRM tracking data as a JSON file"
        >
          <Download className="w-4 h-4 text-brand-400" />
          <span>Export Tracking Data</span>
        </button>

        {/* Import Backup Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={triggerFileInput}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-brand-200 hover:bg-brand-50 text-brand-700 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm font-sans"
            title="Restore a previous JSON tracking backup"
          >
            <Upload className="w-4 h-4 text-brand-400" />
            <span>Import Tracking Data</span>
          </button>
        </div>
      </div>
      
      <p className="text-[10px] text-brand-400 font-mono mt-3 leading-relaxed text-center sm:text-left">
        * Note: The outreach tracking database now runs on a real-time, shared Firebase Firestore cloud database. Any changes, status updates, or questionnaires filled out are synchronized instantly and are immediately visible to all other users.
      </p>
    </div>
  );
}
