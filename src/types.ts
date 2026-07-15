/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CampaignType = 'None' | 'Situation A' | 'Situation B';

export type ContactStatus = 'Not Contacted' | 'Contacted' | 'Follow-up Scheduled' | 'Questionnaire Completed' | 'Declined';

export interface QuestionnaireAnswers {
  institutionDepartment: string;
  contactNumber: string;
  availableTimes: {
    Monday?: string[];
    Tuesday?: string[];
    Wednesday?: string[];
    Thursday?: string[];
    Friday?: string[];
  };
  challenges: string;
  topicsToDiscuss: string[];
  fallPriority: string;
  preferredContactMethod: string;
  comments: string;
  helpfulnessScale: number;
  additionalMetrics: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  companyType: string;
  title: string;
  jobLevel: string;
  email: string;
  phone: string;
  campaign: CampaignType;
  status: ContactStatus;
  reminderDate: string | null; // ISO Date String (YYYY-MM-DD)
  reminderText: string | null;
  notes: string;
  questionnaireAnswers: QuestionnaireAnswers | null;
  customTags?: string[];
  dateContacted?: string | null; // ISO Date String (YYYY-MM-DD)
}
