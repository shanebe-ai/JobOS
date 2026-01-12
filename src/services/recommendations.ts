import type { Application } from '../domain/application';
import { type Action, type ActionType, type ActionPriority } from '../domain/action';

export const RecommendationService = {
    getSuggestedActions: (app: Application): Action[] => {
        const suggestions: Action[] = [];

        const lastAction = new Date(app.lastActionDate);
        const diffTime = Math.abs(new Date().getTime() - lastAction.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dateStr = lastAction.toLocaleDateString();

        // Rule: Identify Stalled Applications
        // (This logic mirrors the domain rule but generates a concrete Action)

        if (app.status === 'Applied') {
            if (diffDays > 3) {
                suggestions.push(createSuggestion(app.id, 'FollowUp', 'Follow up on application', `It has been ${diffDays} days since you applied (${dateStr}). Consider a light follow-up.`, 'Medium'));
            }
        }

        if (app.status === 'OutreachStarted') {
            if (diffDays > 3) {
                suggestions.push(createSuggestion(app.id, 'FollowUp', 'Follow up on outreach', `No reply since ${dateStr}? A polite bump might help.`, 'High'));
            }
        }

        if (app.status === 'Saved') {
            suggestions.push(createSuggestion(app.id, 'Apply', 'Apply to this role', 'You saved this job. Review requirements and apply.', 'High'));
        }

        if (app.status === 'Interviewing') {
            suggestions.push(createSuggestion(app.id, 'SendThankYou', 'Send Thank You Note', 'If you recently had an interview, don\'t forget the thank you note.', 'High'));
        }

        return suggestions;
    }
};

const createSuggestion = (
    appId: string,
    type: ActionType,
    title: string,
    description: string,
    priority: ActionPriority
): Action => {
    return {
        id: crypto.randomUUID(),
        applicationId: appId,
        type,
        title,
        description,
        status: 'Pending',
        createdDate: new Date().toISOString(),
        priority,
        isSystemSuggested: true,
    };
};
