export interface AIResponse<T> {
    data: T;
    rationale: string;
    confidence: number;
}

export interface OutreachDraftContext {
    recipientName: string;
    recipientRole: string;
    companyName: string;
    jobTitle: string;
    tone: 'Formal' | 'Casual' | 'Enthusiastic' | 'Professional';
    intent: 'Connect' | 'FollowUp' | 'ReferralRequest' | 'PeerOutreach';
    jobDescription?: string;
}

export interface OutreachDraft {
    subject?: string;
    body: string;
}

export interface AIServiceInterface {
    draftOutreach(context: OutreachDraftContext): Promise<AIResponse<OutreachDraft>>;
    analyzeResume(jobDescription: string, resumeText: string): Promise<AIResponse<string[]>>; // Returns suggestions
}
