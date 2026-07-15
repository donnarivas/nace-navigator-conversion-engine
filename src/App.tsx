/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import ContactFilters from './components/ContactFilters';
import ContactTable from './components/ContactTable';
import ReminderPanel from './components/ReminderPanel';
import ContactDrawer from './components/ContactDrawer';
import DemoPanel from './components/DemoPanel';
import QuestionnaireForm from './components/QuestionnaireForm';
import BackgroundNetwork from './components/BackgroundNetwork';
import { CampaignType, Contact, ContactStatus, QuestionnaireAnswers } from './types';
import rawContacts from './data/contacts.json';
import { CalendarClock, FileText, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const rawBase = [...(rawContacts as Contact[])];
    try {
      const savedContacts = localStorage.getItem('leaf_outreach_contacts');
      if (savedContacts) {
        return JSON.parse(savedContacts);
      }
      const savedModified = localStorage.getItem('leaf_outreach_modified_contacts');
      if (savedModified) {
        const modified: Contact[] = JSON.parse(savedModified);
        const modifiedMap = new Map<string, Contact>();
        const newContacts: Contact[] = [];
        modified.forEach(c => {
          if (c.id.startsWith('c_')) {
            modifiedMap.set(c.id, c);
          } else {
            newContacts.push(c);
          }
        });
        const mergedBase = rawBase.map(c => {
          if (modifiedMap.has(c.id)) {
            return modifiedMap.get(c.id)!;
          }
          return c;
        });
        return [...newContacts, ...mergedBase];
      }
    } catch (e) {
      console.warn("Error doing synchronous pre-load:", e);
    }
    return rawBase;
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyType, setSelectedCompanyType] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCustomTag, setSelectedCustomTag] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [onlyDueReminders, setOnlyDueReminders] = useState(false);

  // Custom Status Tags list
  const [customTags, setCustomTags] = useState<string[]>([]);

  // Background Scenery Settings (Networking Nodes locked to optimized settings)
  const [bgSettings] = useState({
    showNodes: true,
    opacity: 1.5,
    speed: 2.5,
    density: 140,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Right column tab selection ('reminders' or 'questionnaire')
  const [rightPanelTab, setRightPanelTab] = useState<'reminders' | 'questionnaire'>('reminders');

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Find which contacts have actual modifications compared to the baseline JSON to optimize localStorage space
  const getModifiedContacts = (updated: Contact[]): Contact[] => {
    const rawMap = new Map<string, any>();
    (rawContacts as any[]).forEach(c => rawMap.set(c.id, c));

    return updated.filter(c => {
      const original = rawMap.get(c.id);
      if (!original) return true; // New contact

      return (
        c.status !== original.status ||
        c.campaign !== original.campaign ||
        (c.notes || '') !== (original.notes || '') ||
        c.reminderDate !== original.reminderDate ||
        c.reminderText !== original.reminderText ||
        JSON.stringify(c.customTags || []) !== JSON.stringify(original.customTags || []) ||
        JSON.stringify(c.questionnaireAnswers || null) !== JSON.stringify(original.questionnaireAnswers || null) ||
        c.firstName !== original.firstName ||
        c.lastName !== original.lastName ||
        c.email !== original.email ||
        c.phone !== original.phone ||
        c.title !== original.title ||
        c.company !== original.company ||
        c.companyType !== original.companyType
      );
    });
  };

  // Load contacts & tags from Firestore with local storage fallback
  useEffect(() => {
    // 1. Subscribe to real-time changes in Firestore
    const q = collection(db, 'modified_contacts');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreModifiedMap = new Map<string, Contact>();
      const firestoreNewContacts: Contact[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Contact;
        if (data.id.startsWith('c_')) {
          firestoreModifiedMap.set(data.id, data);
        } else {
          firestoreNewContacts.push(data);
        }
      });

      const rawBase = [...(rawContacts as Contact[])];
      const mergedBase = rawBase.map(c => {
        if (firestoreModifiedMap.has(c.id)) {
          return firestoreModifiedMap.get(c.id)!;
        }
        return c;
      });

      const finalContacts = [...firestoreNewContacts, ...mergedBase];
      setContacts(finalContacts);

      // Cache locally as fallback/warmup
      try {
        localStorage.setItem('leaf_outreach_contacts', JSON.stringify(finalContacts));
        const modifiedOnly = finalContacts.filter(c => {
          const rawMap = new Map<string, any>();
          (rawContacts as any[]).forEach(rc => rawMap.set(rc.id, rc));
          const original = rawMap.get(c.id);
          if (!original) return true;
          return (
            c.status !== original.status ||
            c.campaign !== original.campaign ||
            (c.notes || '') !== (original.notes || '') ||
            c.reminderDate !== original.reminderDate ||
            c.reminderText !== original.reminderText ||
            JSON.stringify(c.customTags || []) !== JSON.stringify(original.customTags || []) ||
            JSON.stringify(c.questionnaireAnswers || null) !== JSON.stringify(original.questionnaireAnswers || null) ||
            c.firstName !== original.firstName ||
            c.lastName !== original.lastName ||
            c.email !== original.email ||
            c.phone !== original.phone ||
            c.title !== original.title ||
            c.company !== original.company ||
            c.companyType !== original.companyType
          );
        });
        localStorage.setItem('leaf_outreach_modified_contacts', JSON.stringify(modifiedOnly));
      } catch (e) {
        console.warn("Error updating local cache", e);
      }
    }, (error) => {
      console.error("Firestore loading error, falling back to local cache:", error);
      
      // Fallback to local storage if Firestore connection fails
      let loadedContacts: Contact[] = [];
      const savedContacts = localStorage.getItem('leaf_outreach_contacts');
      if (savedContacts) {
        try {
          loadedContacts = JSON.parse(savedContacts);
        } catch (e) {}
      }
      if (loadedContacts.length === 0) {
        const rawBase = [...(rawContacts as Contact[])];
        const savedModified = localStorage.getItem('leaf_outreach_modified_contacts');
        if (savedModified) {
          try {
            const modified: Contact[] = JSON.parse(savedModified);
            const modifiedMap = new Map<string, Contact>();
            const newContacts: Contact[] = [];
            
            modified.forEach(c => {
              if (c.id.startsWith('c_')) {
                modifiedMap.set(c.id, c);
              } else {
                newContacts.push(c);
              }
            });

            const mergedBase = rawBase.map(c => {
              if (modifiedMap.has(c.id)) {
                return modifiedMap.get(c.id)!;
              }
              return c;
            });

            loadedContacts = [...newContacts, ...mergedBase];
          } catch (e) {
            loadedContacts = rawBase;
          }
        } else {
          loadedContacts = rawBase;
        }
      }
      setContacts(loadedContacts);
    });

    const savedTags = localStorage.getItem('leaf_custom_tags');
    if (savedTags) {
      try {
        setCustomTags(JSON.parse(savedTags));
      } catch (e) {
        setCustomTags(["Priority", "Needs Follow-up", "Decision Maker", "Interested"]);
      }
    } else {
      const initialTags = ["Priority", "Needs Follow-up", "Decision Maker", "Interested"];
      setCustomTags(initialTags);
      localStorage.setItem('leaf_custom_tags', JSON.stringify(initialTags));
    }

    return () => unsubscribe();
  }, []);

  // Save contacts to Firestore and localStorage whenever they change
  const saveContactsState = async (updated: Contact[]) => {
    // Optimistic local UI update
    setContacts(updated);
    
    // Save to local storage for quick offline recovery
    try {
      localStorage.setItem('leaf_outreach_contacts', JSON.stringify(updated));
    } catch (e) {}

    // Synchronize delta state to Firestore
    try {
      const rawMap = new Map<string, any>();
      (rawContacts as any[]).forEach(rc => rawMap.set(rc.id, rc));

      const previouslyModifiedIds = new Set<string>(contacts.filter(c => {
        const original = rawMap.get(c.id);
        if (!original) return true; // New
        return (
          c.status !== original.status ||
          c.campaign !== original.campaign ||
          (c.notes || '') !== (original.notes || '') ||
          c.reminderDate !== original.reminderDate ||
          c.reminderText !== original.reminderText ||
          JSON.stringify(c.customTags || []) !== JSON.stringify(original.customTags || []) ||
          JSON.stringify(c.questionnaireAnswers || null) !== JSON.stringify(original.questionnaireAnswers || null) ||
          c.firstName !== original.firstName ||
          c.lastName !== original.lastName ||
          c.email !== original.email ||
          c.phone !== original.phone ||
          c.title !== original.title ||
          c.company !== original.company ||
          c.companyType !== original.companyType
        );
      }).map(c => c.id));

      const currentlyModified = getModifiedContacts(updated);
      const currentlyModifiedIds = new Set<string>(currentlyModified.map(c => c.id));

      // Items no longer modified (reverted to baseline) should be deleted from Firestore
      const toDeleteIds = Array.from(previouslyModifiedIds).filter((id: string) => !currentlyModifiedIds.has(id));

      // Save modified delta list to local storage
      localStorage.setItem('leaf_outreach_modified_contacts', JSON.stringify(currentlyModified));

      // Update changed documents
      if (currentlyModified.length > 10) {
        // Batch write for bulk changes (e.g. seeding)
        const batch = writeBatch(db);
        currentlyModified.forEach(c => {
          batch.set(doc(db, 'modified_contacts', c.id), c);
        });
        await batch.commit();
      } else {
        // Parallel setDocs for small changes
        const promises = currentlyModified.map(c => setDoc(doc(db, 'modified_contacts', c.id), c));
        await Promise.all(promises);
      }

      // Delete cleaned documents
      if (toDeleteIds.length > 0) {
        const deletePromises = toDeleteIds.map((id: string) => deleteDoc(doc(db, 'modified_contacts', id)));
        await Promise.all(deletePromises);
      }
    } catch (e) {
      console.error("Failed to synchronize state with Firestore:", e);
    }
    
    // Synchronize active drawer selection
    if (selectedContact) {
      const match = updated.find(c => c.id === selectedContact.id);
      if (match) {
        setSelectedContact(match);
      }
    }
  };

  // Custom status tags management callbacks
  const handleCreateTag = (tag: string) => {
    if (!tag.trim()) return;
    const cleanTag = tag.trim();
    if (!customTags.includes(cleanTag)) {
      const updated = [...customTags, cleanTag];
      setCustomTags(updated);
      localStorage.setItem('leaf_custom_tags', JSON.stringify(updated));
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const updatedTags = customTags.filter(t => t !== tagToDelete);
    setCustomTags(updatedTags);
    localStorage.setItem('leaf_custom_tags', JSON.stringify(updatedTags));
    
    // Clean up tag association from all contacts
    const updatedContacts = contacts.map(c => {
      if (c.customTags && c.customTags.includes(tagToDelete)) {
        return {
          ...c,
          customTags: c.customTags.filter(t => t !== tagToDelete)
        };
      }
      return c;
    });
    saveContactsState(updatedContacts);
  };

  // Extract unique organization types for filters
  const companyTypes = Array.from(new Set(contacts.map(c => c.companyType).filter(Boolean))) as string[];

  // Inline status update
  const handleUpdateStatus = (id: string, status: ContactStatus) => {
    const updated = contacts.map(c => {
      if (c.id === id) {
        // Automatically clear reminder if completed or declined
        let remDate = c.reminderDate;
        let remText = c.reminderText;
        if (status === 'Questionnaire Completed' || status === 'Declined') {
          remDate = null;
          remText = null;
        }
        return { 
          ...c, 
          status, 
          reminderDate: remDate, 
          reminderText: remText,
          // Set an initial campaign track if none was selected
          campaign: c.campaign === 'None' && status !== 'Not Contacted' ? 'Situation A' : c.campaign
        };
      }
      return c;
    });
    saveContactsState(updated);
  };

  // Inline campaign update
  const handleUpdateCampaign = (id: string, campaign: CampaignType) => {
    const updated = contacts.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          campaign,
          // If unassigned campaign is assigned, auto switch status to Contacted if it was not
          status: c.status === 'Not Contacted' && campaign !== 'None' ? 'Contacted' : c.status
        };
      }
      return c;
    });
    saveContactsState(updated);
  };

  // Drawer contact details update & contact creation
  const handleUpdateContact = (updatedContact: Contact) => {
    let updated: Contact[];
    if (updatedContact.id.startsWith('new_')) {
      // Assign persistent ID
      const nextNum = contacts.length + 1;
      const cleanContact = {
        ...updatedContact,
        id: `c_${nextNum}`
      };
      updated = [cleanContact, ...contacts];
      setSelectedContact(cleanContact);
    } else {
      updated = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
    }
    saveContactsState(updated);
  };

  // Add Contact draft creator
  const handleAddContact = () => {
    const draftContact: Contact = {
      id: `new_${Date.now()}`,
      firstName: '',
      lastName: '',
      company: '',
      companyType: 'University / College',
      title: '',
      jobLevel: '',
      email: '',
      phone: '',
      status: 'Not Contacted',
      campaign: 'None',
      notes: '',
      reminderDate: null,
      reminderText: null,
      questionnaireAnswers: null,
      customTags: [],
      dateContacted: null
    };
    setSelectedContact(draftContact);
  };

  // Remove/Complete a reminder
  const handleRemoveReminder = (id: string) => {
    const updated = contacts.map(c => {
      if (c.id === id) {
        return { ...c, reminderDate: null, reminderText: null, status: 'Contacted' as ContactStatus };
      }
      return c;
    });
    saveContactsState(updated);
  };

  // Checks if a reminder is active and due (assuming today is 2026-07-14)
  const isReminderDue = (dateStr: string | null) => {
    if (!dateStr) return false;
    const reminderDate = new Date(dateStr + 'T00:00:00');
    const today = new Date('2026-07-14T00:00:00');
    return reminderDate <= today;
  };

  const dueRemindersCount = contacts.filter(c => isReminderDue(c.reminderDate)).length;

  // Filter Contacts
  const filteredContacts = contacts.filter(contact => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    // Organization type filter
    const matchesOrgType = selectedCompanyType === 'All' || contact.companyType === selectedCompanyType;

    // Campaign filter
    const matchesCampaign = selectedCampaign === 'All' || 
      (selectedCampaign === 'None' ? contact.campaign === 'None' : contact.campaign === selectedCampaign);

    // Status filter
    const matchesStatus = selectedStatus === 'All' || contact.status === selectedStatus;

    // Custom tag filter
    const matchesCustomTag = selectedCustomTag === 'All' || (contact.customTags && contact.customTags.includes(selectedCustomTag));

    // Due reminders filter
    const matchesReminders = !onlyDueReminders || isReminderDue(contact.reminderDate);

    return matchesSearch && matchesOrgType && matchesCampaign && matchesStatus && matchesCustomTag && matchesReminders;
  });

  // Sort Contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'name-desc':
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case 'date-contacted-newest': {
        if (!a.dateContacted) return 1;
        if (!b.dateContacted) return -1;
        return new Date(b.dateContacted).getTime() - new Date(a.dateContacted).getTime();
      }
      case 'date-contacted-oldest': {
        if (!a.dateContacted) return 1;
        if (!b.dateContacted) return -1;
        return new Date(a.dateContacted).getTime() - new Date(b.dateContacted).getTime();
      }
      case 'follow-up-asc': {
        if (!a.reminderDate) return 1;
        if (!b.reminderDate) return -1;
        return new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime();
      }
      case 'follow-up-desc': {
        if (!a.reminderDate) return 1;
        if (!b.reminderDate) return -1;
        return new Date(b.reminderDate).getTime() - new Date(a.reminderDate).getTime();
      }
      case 'custom-tag': {
        const tagA = a.customTags && a.customTags.length > 0 ? a.customTags[0] : '';
        const tagB = b.customTags && b.customTags.length > 0 ? b.customTags[0] : '';
        if (!tagA) return 1;
        if (!tagB) return -1;
        return tagA.localeCompare(tagB);
      }
      default:
        return 0;
    }
  });

  // Handle filtering updates (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompanyType, selectedCampaign, selectedStatus, selectedCustomTag, sortBy, onlyDueReminders]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCompanyType('All');
    setSelectedCampaign('All');
    setSelectedStatus('All');
    setSelectedCustomTag('All');
    setSortBy('name-asc');
    setOnlyDueReminders(false);
  };

  // DEMO SIMULATION SEEDER
  const handleSeedSimulatedData = () => {
    // Pick specific popular colleges and set up historical logs
    const seedMap: Record<string, { campaign: CampaignType, status: ContactStatus, note: string, rDate: string | null, rText: string | null, answers?: QuestionnaireAnswers }> = {
      "c_3": {
        campaign: "Situation A",
        status: "Follow-up Scheduled",
        note: "Spoke with Danie on July 10. She mentioned the Florida center is highly focused on credentials and demonstrating ROI to university leadership. Follow-up email set for July 14 to send the A/B testing dual-track framework proposal.",
        rDate: "2026-07-14",
        rText: "Send follow-up Logic credentials proposal email"
      },
      "c_4": {
        campaign: "Situation A",
        status: "Questionnaire Completed",
        note: "David filled out the L-EAF consultation questionnaire on July 12. Florida Warrington College of Business wants to test integration with their current placement systems. Highly interested in Fall 2026 Launch.",
        rDate: null,
        rText: null,
        answers: {
          institutionDepartment: "University of Florida - Warrington College of Business Administration",
          contactNumber: "(352) 273-0120",
          availableTimes: {
            Monday: ["Morning"],
            Wednesday: ["Afternoon"],
            Friday: ["Morning", "Midday"]
          },
          challenges: "Students are overcommitted with classroom credits and struggle to find dedicated time for extra career prep. Low awareness of virtual services.",
          topicsToDiscuss: [
            "Integration with Existing Services: Identifying how the L-EAF Lab framework can complement your department's current career placement programs",
            "Institutional Impact & ROI: Reviewing how the Institutional Impact Analysis report can provide your office with validated growth data to justify program expansion to university leadership"
          ],
          fallPriority: "Demonstrating Program ROI",
          preferredContactMethod: "Zoom Meeting",
          comments: "Excited to partner up and analyze the conversion metrics between resume logic vs discovery narrative.",
          helpfulnessScale: 5,
          additionalMetrics: "We would like to track student engagement duration inside the observation portal."
        }
      },
      "c_5": {
        campaign: "Situation B",
        status: "Contacted",
        note: "Emailed Kevin regarding the Situation B Emotion campaign track (emphasizing discovery narratives and self-fulfillment to overcome prep anxiety). No response yet.",
        rDate: "2026-07-16",
        rText: "Send second-wave Situation B follow-up nudge"
      },
      "c_6": {
        campaign: "Situation B",
        status: "Questionnaire Completed",
        note: "Auburn University completed questionnaire. Spoke with Megan. They face large student barriers around 'fear of being unprepared' and want to explore narrative discovery strategy.",
        rDate: null,
        rText: null,
        answers: {
          institutionDepartment: "Auburn University - Academic Programs",
          contactNumber: "(334) 844-4744",
          availableTimes: {
            Tuesday: ["Morning", "Midday"],
            Thursday: ["Morning", "Afternoon"]
          },
          challenges: "The psychological barrier. Students feel they need a perfect resume to even talk to us. We need a way to build their confidence through narratives.",
          topicsToDiscuss: [
            "Addressing Student Sentiment: Discussing the \"Fear of Being Unprepared\" and how we can refine the campaign messaging to specifically address the unique psychological barriers your student body faces",
            "Campaign Strategy (A/B Test): Understanding our dual-track outreach approach—testing \"Logic\" (resume-ready credentials) versus \"Emotion\" (discovery-focused narratives) to optimize student engagement"
          ],
          fallPriority: "Enhancing Student Outcomes",
          preferredContactMethod: "Email",
          comments: "The dual track is exactly what we need to measure. We find logic alone intimidates some students.",
          helpfulnessScale: 4,
          additionalMetrics: "We want to segment results by undergraduate student year (freshman vs senior)."
        }
      },
      "c_7": {
        campaign: "Situation A",
        status: "Contacted",
        note: "Sent introductory outreach for Colorado School of Mines. Chelsey is interested in credentials tracking.",
        rDate: "2026-07-14",
        rText: "Call Chelsey back to review launch timeline"
      },
      "c_8": {
        campaign: "Situation B",
        status: "Follow-up Scheduled",
        note: "Kenia from Redlands wants to discuss narrative counseling. Scheduling Zoom meeting.",
        rDate: "2026-07-15",
        rText: "Prepare Zoom links and send consultation calendar invite"
      }
    };

    // Seed another ~30 random records with generic outreach histories to populate statistics
    const updated = contacts.map(c => {
      if (seedMap[c.id]) {
        return {
          ...c,
          campaign: seedMap[c.id].campaign,
          status: seedMap[c.id].status,
          notes: seedMap[c.id].note,
          reminderDate: seedMap[c.id].rDate,
          reminderText: seedMap[c.id].rText,
          questionnaireAnswers: seedMap[c.id].answers || null
        };
      }
      
      // Seed a subset of random contacts (every 35th contact)
      const numericId = parseInt(c.id.replace('c_', ''));
      if (numericId % 35 === 0) {
        const isSitA = numericId % 2 === 0;
        const randomStatuses: ContactStatus[] = ['Contacted', 'Follow-up Scheduled', 'Declined'];
        const status = randomStatuses[numericId % randomStatuses.length];
        
        let rDate = null;
        let rText = null;
        if (status === 'Follow-up Scheduled') {
          rDate = numericId % 3 === 0 ? '2026-07-14' : '2026-07-17';
          rText = `Check-in call for ${isSitA ? 'Logic Track credentials' : 'Emotion Track exploration'}`;
        }

        return {
          ...c,
          campaign: isSitA ? 'Situation A' : 'Situation B' as CampaignType,
          status,
          notes: `Simulated interaction log for record #${numericId}. Outreach sent via standard template. Discussing Fall 2026 launch alignment.`,
          reminderDate: rDate,
          reminderText: rText
        };
      }

      return c;
    });

    saveContactsState(updated);
    triggerToast('Simulated outreach history successfully seeded! Check out the dashboard stats and active reminders queue on the right.', 'success');
  };

  const handleResetData = () => {
    triggerConfirm(
      'Reset All Tracking History?',
      'Are you sure you want to reset all tracking history? This will delete all customized notes, reminders, status updates, and questionnaire submissions, restoring the database back to pristine 2,467 uncontacted records.',
      async () => {
        setContacts(rawContacts as Contact[]);
        try {
          localStorage.removeItem('leaf_outreach_contacts');
          localStorage.removeItem('leaf_outreach_modified_contacts');
          const querySnapshot = await getDocs(collection(db, 'modified_contacts'));
          const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        } catch (e) {
          console.error("Failed to clear shared Firestore records:", e);
        }
        setSelectedContact(null);
        triggerToast('Tracker state reset to default.', 'info');
      }
    );
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `L-EAF_Lab_Outreach_Backup_2026-07-14.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (imported: Contact[]) => {
    saveContactsState(imported);
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col antialiased relative overflow-x-hidden">
      {/* Interactive Background Network Nodes */}
      <BackgroundNetwork 
        showNodes={bgSettings.showNodes}
        opacity={bgSettings.opacity}
        speed={bgSettings.speed}
        density={bgSettings.density}
      />

      {/* Brand Header Banner */}
      <Header />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 flex-1 w-full relative z-10">
        
        {/* Metric Cards Banner */}
        <StatsDashboard 
          contacts={contacts} 
          dueRemindersCount={dueRemindersCount}
        />

        {/* Database Seeding & Backup Tools */}
        <DemoPanel 
          onSeedData={handleSeedSimulatedData}
          onResetData={handleResetData}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          showToast={triggerToast}
        />

        {/* Filter Panel */}
        <ContactFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCompanyType={selectedCompanyType}
          setSelectedCompanyType={setSelectedCompanyType}
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedCustomTag={selectedCustomTag}
          setSelectedCustomTag={setSelectedCustomTag}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onlyDueReminders={onlyDueReminders}
          setOnlyDueReminders={setOnlyDueReminders}
          companyTypes={companyTypes}
          availableTags={customTags}
          resetFilters={handleResetFilters}
        />

        {/* Directory & Right Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Interactive Paginated Directory (Takes 2/3 of space on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <ContactTable
              contacts={sortedContacts}
              onSelectContact={setSelectedContact}
              onUpdateStatus={handleUpdateStatus}
              onUpdateCampaign={handleUpdateCampaign}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={15}
              onAddContact={handleAddContact}
            />
          </div>

          {/* Right Column: Queue Reminders / Questionnaire Reference Tab (Takes 1/3 space on desktop) */}
          <div className="flex flex-col gap-6">
            
            {/* Multi-tab Control for Right Panel */}
            <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:bg-white/50 transition-all duration-300">
              <div className="flex border-b border-brand-100/30 bg-brand-50/30">
                <button
                  onClick={() => setRightPanelTab('reminders')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${rightPanelTab === 'reminders' ? 'border-brand-900 text-brand-950 bg-white/50 backdrop-blur-xs' : 'border-transparent text-brand-500 hover:text-brand-800'}`}
                >
                  <CalendarClock className="w-4 h-4 text-brand-600" />
                  <span>Outreach Queue</span>
                  {dueRemindersCount > 0 && (
                    <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-mono font-bold animate-pulse">
                      {dueRemindersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setRightPanelTab('questionnaire')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${rightPanelTab === 'questionnaire' ? 'border-brand-900 text-brand-950 bg-white/50 backdrop-blur-xs' : 'border-transparent text-brand-500 hover:text-brand-800'}`}
                >
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>Questionnaire Form</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-4">
                {rightPanelTab === 'reminders' && (
                  <ReminderPanel
                    contacts={contacts}
                    onSelectContact={setSelectedContact}
                    onRemoveReminder={handleRemoveReminder}
                  />
                )}

                {rightPanelTab === 'questionnaire' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-brand-50/50 p-3.5 rounded-xl border border-brand-100 text-xs text-brand-700 leading-normal mb-2 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Questionnaire Reference Mode:</strong> Consult and review the form contents below. To save answers for a specific contact and update their campaign metrics, select the contact using <strong>Manage</strong> and use the questionnaire tab.
                      </div>
                    </div>
                    <QuestionnaireForm readOnly={true} />
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Bento Grid Reference Questionnaire Section */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl border-2 border-dashed border-brand-300/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mt-4 hover:bg-white/40 transition-all duration-300">
          <div className="max-w-xl">
            <h2 className="text-lg font-display font-bold text-brand-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Reference Questionnaire</span>
            </h2>
            <p className="text-xs text-brand-800 leading-relaxed font-sans">
              Ensure all outreach participants have completed the situational assessment for either Track A (Logic Framework) or Track B (Emotion Framework). Click below to preview the form template or filter the active dashboard records.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button 
              onClick={() => {
                setRightPanelTab('questionnaire');
                // Scroll to top of right panel / filters
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-white text-brand-900 border border-brand-300 hover:bg-brand-50 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer font-sans"
            >
              VIEW FORM TEMPLATE
            </button>
            <button 
              onClick={() => {
                setSelectedStatus('Questionnaire Completed');
                // Scroll to table
                document.getElementById('contacts-table-container')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-brand-900 text-white hover:bg-brand-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-sans"
            >
              SUBMISSION DASHBOARD
            </button>
          </div>
        </div>

      </main>

      {/* Floating sliding Side Drawer for Contact details */}
      <ContactDrawer
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdateContact={handleUpdateContact}
        availableTags={customTags}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
        showToast={triggerToast}
      />

      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => {
          let bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-900';
          let Icon = CheckCircle;
          let iconColor = 'text-emerald-500';
          if (t.type === 'error') {
            bgColor = 'bg-rose-50 border-rose-200 text-rose-900';
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
          } else if (t.type === 'info') {
            bgColor = 'bg-blue-50 border-blue-200 text-blue-900';
            Icon = Info;
            iconColor = 'text-blue-500';
          }

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-md animate-fade-in-up ${bgColor}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-semibold font-sans">{t.message}</div>
              <button
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-brand-400 hover:text-brand-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-brand-950/60 backdrop-blur-xs z-[9998] flex items-center justify-center p-4">
          <div className="bg-white border border-brand-100 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-brand-950 mb-1">{confirmModal.title}</h3>
                <p className="text-xs text-brand-700 leading-relaxed font-sans">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-brand-50">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-brand-950 text-brand-400 text-xs font-mono py-8 px-6 text-center border-t border-brand-900 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 Lean Education Agile Foundry (L-EAF) Laboratory. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://forms.gle/Ehi8r3mvshg8nYze7" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Google Form</a>
            <span>&bull;</span>
            <div className="flex items-center gap-3.5 select-none group">
              <div className="relative flex items-center justify-center w-16 h-16 drop-shadow-xl">
                <svg className="w-full h-full group-hover:scale-105 transition-transform duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer premium subtle ambient white glow */}
                  <circle cx="50" cy="50" r="45" fill="url(#footerLogoGlow)" opacity="0.3" />

                  {/* Outer Shield with beveled borders */}
                  <g filter="url(#premiumFooterShadow)">
                    {/* Outer Shield Backing */}
                    <path d="M 50,22 C 40,25 28,29 20,32 C 20,55 30,78 50,92 C 70,78 80,55 80,32 C 72,29 60,25 50,22 Z" 
                          fill="#0f172a" 
                          stroke="url(#shieldSilver)" 
                          strokeWidth="3" 
                          strokeLinejoin="round" />
                              
                    {/* Inner Shield border */}
                    <path d="M 50,27 C 42,29 32,33 25,35 C 25,54 33,74 50,86 C 67,74 75,54 75,35 C 68,33 58,29 50,27 Z" 
                          fill="none" 
                          stroke="url(#shieldSilver)" 
                          strokeWidth="1" 
                          opacity="0.6" />
                  </g>

                  {/* Central Lab Flask / Beaker */}
                  <g filter="url(#premiumFooterShadow)" opacity="0.95">
                    {/* Bubbles */}
                    <circle cx="50" cy="6" r="2.2" fill="url(#silverMetal)" />
                    <circle cx="53.5" cy="11.5" r="1.4" fill="url(#silverMetal)" />
                    <circle cx="47.5" cy="16" r="0.9" fill="url(#silverMetal)" />

                    {/* Flask Rim / Mouth */}
                    <path d="M 44,19 H 56 C 57,19 57,21 56,21 H 44 C 43,21 43,19 44,19 Z" fill="url(#silverMetal)" />
                    
                    {/* Flask Neck */}
                    <path d="M 46.5,21 V 27 H 53.5 V 21 Z" fill="url(#glassTransparency)" stroke="url(#silverMetal)" strokeWidth="0.5" />
                    
                    {/* Flask Body */}
                    <path d="M 46.5,27 L 38,44 C 37.5,45 38,46 39,46 H 61 C 62,46 62.5,45 62,44 L 53.5,27 Z" 
                          fill="url(#glassTransparency)" 
                          stroke="url(#silverMetal)" 
                          strokeWidth="1.2" />
                              
                    {/* Liquid inside Flask */}
                    <path d="M 42.5,35.5 L 39.5,42.5 C 39,43.5 39.5,44.5 40.5,44.5 H 59.5 C 60.5,44.5 61,43.5 60.5,42.5 L 57.5,35.5 Z" 
                          fill="url(#liquidSilver)" />

                    {/* Measuring Tick Marks */}
                    <line x1="48" y1="33" x2="51" y2="33" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                    <line x1="46" y1="37" x2="50" y2="37" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                    <line x1="44" y1="41" x2="49" y2="41" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                  </g>

                  {/* Interlocking Monogram J & D */}
                  <g filter="url(#premiumFooterShadow)">
                    {/* The J letter stem & curve */}
                    <path d="M 32,53 C 28,49 32,44 36,46 C 40,48 39,55 33.5,58.5 C 28,62 27,69 36,69 C 45,69 48.5,58 48.5,41 V 28" 
                          stroke="url(#silverMetal)" 
                          strokeWidth="4.8" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          fill="none" />

                    {/* The D letter */}
                    <path d="M 48.5,33 H 55.5 C 66.5,33 72.5,40.5 72.5,49.5 C 72.5,58.5 66.5,65.5 55.5,65.5 H 46 C 44,65.5 44,63.5 46,63.5 H 54 C 63,63.5 67.5,57.5 67.5,49.5 C 67.5,41.5 63,35.5 54,35.5 H 48.5" 
                          stroke="url(#silverMetal)" 
                          strokeWidth="4.8" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          fill="none" />

                    {/* Interlocking Overlap Overlay */}
                    <path d="M 46,34 C 47.5,39 48.5,44 48.5,49" 
                          stroke="url(#silverMetal)" 
                          strokeWidth="4.8" 
                          strokeLinecap="round" 
                          fill="none" />
                  </g>

                  <defs>
                    {/* Background Glow - white ambient backlight */}
                    <radialGradient id="footerLogoGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>

                    {/* Realistic drop shadow for premium depth */}
                    <filter id="premiumFooterShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="1.5" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
                    </filter>

                    {/* Silver/Platinum Metallic Gradient for Chrome-like reflections */}
                    <linearGradient id="silverMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#f8fafc" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                      <stop offset="75%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>

                    {/* Outer border metal rim with slight reflection */}
                    <linearGradient id="shieldSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="30%" stopColor="#f1f5f9" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                      <stop offset="70%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>

                    {/* Glass transparency gradient */}
                    <linearGradient id="glassTransparency" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.15" />
                    </linearGradient>

                    {/* Semi-transparent shiny silver liquid */}
                    <linearGradient id="liquidSilver" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-display font-bold tracking-wider text-sm group-hover:text-emerald-400 transition-colors leading-none">J&amp;D INC.</span>
                <span className="text-brand-400 font-sans font-extrabold tracking-widest text-[8px] mt-0.5 uppercase">Building Connections</span>
              </div>
            </div>
            <span>&bull;</span>
            <span className="text-brand-300">Outreach CRM System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
