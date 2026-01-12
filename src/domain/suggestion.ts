export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Once';

export interface SuggestionHistoryEntry {
    date: string; // ISO Date
    action: 'Completed' | 'Skipped' | 'Unnecessary';
    note?: string;
}

export interface Suggestion {
    id: string;
    title: string;
    description?: string;
    frequency: Frequency;
    frequencyDetails?: {
        daysOfWeek?: number[]; // 0=Sunday, 1=Monday...
        dayOfMonth?: number; // 1-31
    };
    nextDueDate: string; // ISO Date
    isActive: boolean;
    history: SuggestionHistoryEntry[];
    createdAt: string;
}
