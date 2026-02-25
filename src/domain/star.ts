export interface StarStory {
    id: string;
    jobId: string;
    skill: string; // the competency this story demonstrates (e.g. "Leadership", "Conflict Resolution")
    situation: string;
    task: string;
    action: string;
    result: string;
    createdDate: string;
    lastModifiedDate: string;
}
