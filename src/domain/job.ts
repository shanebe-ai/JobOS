export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  source: string;
  description: string;
  originalLink?: string;
  dateAdded: string;
  // Normalized signals (future proofing)
  level?: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  salaryRange?: string;
  // Extension-provided fields
  url?: string;
  scrapedAt?: string;
}

export type JobPreview = Pick<Job, 'id' | 'title' | 'company' | 'location' | 'isRemote' | 'dateAdded'>;
