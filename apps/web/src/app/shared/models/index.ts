export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  location?: string;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  applications?: JobApplication[];
  createdAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  companyId: string;
  title: string;
  description?: string;
  salary?: string;
  location?: string;
  url?: string;
  notes?: string;
  status: string;
  resumeText?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  interviews?: Interview[];
  coverLetters?: CoverLetter[];
  analyses?: AIAnalysis[];
}

export interface Interview {
  id: string;
  applicationId: string;
  companyId: string;
  type: string;
  dateTime: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  prepNotes?: string;
  feedback?: string;
  completed: boolean;
  company?: Company;
  application?: JobApplication;
  questions?: InterviewQuestion[];
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  question: string;
  answer?: string;
  sortOrder: number;
}

export interface CoverLetter {
  id: string;
  applicationId: string;
  content: string;
  tone: string;
  length: string;
  version: number;
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  applicationId: string;
  resumeText: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  modelUsed: string;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  resumeText?: string;
  theme: string;
  preferences?: any;
}

export interface DashboardKPI {
  totalApps: number;
  inProgress: number;
  interviews: number;
  responseRate: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  status: string;
  companyName: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CoverLetterOptions {
  applicationId: string;
  tone: string;
  length: string;
}

export interface SseEvent {
  type: string;
  data: any;
}

export const APPLICATION_STATUSES = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
