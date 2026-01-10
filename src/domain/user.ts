export interface UserProfile {
    name: string;
    linkedInUrl?: string;
    aboutMe?: string;
    skills?: string[]; // Comma separated for MVP storage
    experienceSummary?: string;
}
