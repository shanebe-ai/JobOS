export type ArtifactType =
    | 'Resume'
    | 'CoverLetter'
    | 'OutreachMessage'
    | 'InterviewNotes'
    | 'Portfolio';

export interface Artifact {
    id: string;
    applicationId?: string;
    type: ArtifactType;
    name: string; // e.g. "Resume - Senior PM - Google"
    content: string; // For text-based artifacts or paths to files
    version: number;
    createdDate: string;
    lastModifiedDate: string;
}
