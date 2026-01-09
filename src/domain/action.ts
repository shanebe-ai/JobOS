export type ActionType =
    | 'Apply'
    | 'Research'
    | 'Outreach'
    | 'FollowUp'
    | 'PrepareInterview'
    | 'SendThankYou'
    | 'Custom';

export type ActionPriority = 'High' | 'Medium' | 'Low';

export interface Action {
    id: string;
    applicationId?: string; // Optional, actions can be general
    personId?: string; // Optional, contacting a person
    type: ActionType;
    title: string;
    description?: string;
    status: 'Pending' | 'Completed' | 'Skipped';
    dueDate?: string;
    createdDate: string;
    completedDate?: string;
    priority: ActionPriority;
    isSystemSuggested: boolean;
}
