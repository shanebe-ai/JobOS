import { type Application, type ApplicationStatus, ALLOWED_TRANSITIONS } from '../domain/application';
import type { Engagement } from '../domain/engagement';
import { StorageService } from './storage';
import { generateId } from '../utils/uuid';

export const WorkflowService = {
    canTransition: (currentStatus: ApplicationStatus, targetStatus: ApplicationStatus): boolean => {
        const allowed = ALLOWED_TRANSITIONS[currentStatus];
        return allowed.includes(targetStatus);
    },

    transition: (app: Application, targetStatus: ApplicationStatus, notes?: string): Application => {
        if (!WorkflowService.canTransition(app.status, targetStatus)) {
            throw new Error(`Invalid transition from ${app.status} to ${targetStatus}`);
        }

        const updatedApp: Application = {
            ...app,
            status: targetStatus,
            lastActionDate: new Date().toISOString(),
            notes: notes ? `${app.notes}\n[${new Date().toLocaleDateString()}] State changed to ${targetStatus}: ${notes}` : app.notes,
        };

        // Auto-Log Engagement
        const engagement: Engagement = {
            id: generateId(),
            applicationId: app.jobId, // Use jobId so it shows up in the Job log
            type: 'StatusChange',
            platform: 'Other', // System event
            description: `Status changed from ${app.status} to ${targetStatus}`,
            date: new Date().toISOString()
        };
        StorageService.saveEngagement(engagement);

        StorageService.saveApplication(updatedApp);
        return updatedApp;
    },

    createApplication: (jobId: string): Application => {
        const newApp: Application = {
            id: generateId(),
            jobId,
            status: 'Saved',
            lastActionDate: new Date().toISOString(),
            notes: '',
            archived: false,
        };
        StorageService.saveApplication(newApp);
        return newApp;
    }
};
