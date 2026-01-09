export type RelationshipType =
    | 'Recruiter'
    | 'HiringManager'
    | 'Referral'
    | 'Peer'
    | 'Alumni'
    | 'Other';

export interface Person {
    id: string;
    name: string;
    role: string;
    company: string;
    type: RelationshipType;
    email?: string;
    phone?: string;
    notes?: string;
    // Relationship tracking
    dateAdded: string;
    lastInteractionDate?: string;
}
