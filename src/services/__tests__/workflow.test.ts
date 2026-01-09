import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowService } from '../workflow';
import { StorageService } from '../storage'; // We will mock this
import { type Application } from '../../domain/application';

// Mock StorageService
vi.mock('../storage', () => ({
    StorageService: {
        saveApplication: vi.fn(),
    }
}));

describe('Service: WorkflowService', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('canTransition', () => {
        it('should return true for valid transitions', () => {
            expect(WorkflowService.canTransition('Saved', 'Applied')).toBe(true);
        });

        it('should return false for invalid transitions', () => {
            expect(WorkflowService.canTransition('Saved', 'Offer')).toBe(false);
        });
    });

    describe('transition', () => {
        const baseApp: Application = {
            id: 'app-1',
            jobId: 'job-1',
            status: 'Saved',
            lastActionDate: '2023-01-01T00:00:00.000Z',
            notes: 'Initial note',
            archived: false
        };

        it('should update status and lastActionDate on valid transition', () => {
            const updated = WorkflowService.transition(baseApp, 'Applied');

            expect(updated.status).toBe('Applied');
            expect(updated.notes).toBe('Initial note'); // No new notes added
            // Date should be recent (approx now)
            expect(new Date(updated.lastActionDate).getTime()).toBeGreaterThan(new Date('2023-01-02').getTime());

            expect(StorageService.saveApplication).toHaveBeenCalledWith(updated);
        });

        it('should append notes if provided', () => {
            const updated = WorkflowService.transition(baseApp, 'Applied', 'Sent via LinkedIn');
            expect(updated.notes).toContain('Initial note');
            expect(updated.notes).toContain('Sent via LinkedIn');
            expect(updated.notes).toContain('State changed to Applied');
        });

        it('should throw error on invalid transition', () => {
            expect(() => {
                WorkflowService.transition(baseApp, 'Offer');
            }).toThrow(/Invalid transition/);
        });
    });
});
