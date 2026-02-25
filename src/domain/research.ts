export interface CompanyResearchData {
    id: string;
    jobId: string;
    mission: string;
    size: string;
    industry: string;
    techStack: string; // comma-separated or freeform
    culture: string;
    recentNews: string;
    funding: string;
    whyJoin: string;
    notes: string; // freeform catch-all
    lastUpdated: string;
}
