import { describe, it, expect } from 'vitest';
import { ALLOWED_TRANSITIONS, isStalled, type Application } from '../application';

describe('Domain: Application', () => {
    describe('ALLOWED_TRANSITIONS', () => {
        it('should allow Saved -> Applied', () => {
            expect(ALLOWED_TRANSITIONS['Saved']).toContain('Applied');
        });

        it('should NOT allow Saved -> Offer', () => {
            expect(ALLOWED_TRANSITIONS['Saved']).not.toContain('Offer');
        });

        it('should allow Applied -> OutreachStarted', () => {
            expect(ALLOWED_TRANSITIONS['Applied']).toContain('OutreachStarted');
        });
    });

    describe('isStalled', () => {
        const baseApp: Application = {
            id: 'test-1',
            jobId: 'job-1',
            status: 'Applied',
            lastActionDate: new Date().toISOString(),
            notes: '',
            archived: false,
        };

        it('should return false if last action was recent', () => {
            const recentApp = { ...baseApp, lastActionDate: new Date().toISOString() };
            expect(isStalled(recentApp, 7)).toBe(false);
        });

        it('should return true if last action was older than threshold', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 10);
            const staleApp = { ...baseApp, lastActionDate: oldDate.toISOString() };
            expect(isStalled(staleApp, 7)).toBe(true);
        });

        it('should return false for Saved status even if old', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 20);
            const staleSavedApp = { ...baseApp, status: 'Saved' as const, lastActionDate: oldDate.toISOString() };
            expect(isStalled(staleSavedApp, 7)).toBe(false);
        });

        it('should return false for Rejected status even if old', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 20);
            const staleRejectedApp = { ...baseApp, status: 'Rejected' as const, lastActionDate: oldDate.toISOString() };
            expect(isStalled(staleRejectedApp, 7)).toBe(false);
        });
    });
});
