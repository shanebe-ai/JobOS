import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuggestionList } from '../SuggestionList';
import { StorageService } from '../../../services/storage';

// Mock StorageService
vi.mock('../../../services/storage', () => ({
    StorageService: {
        getSuggestions: vi.fn(),
        saveSuggestion: vi.fn(),
        deleteSuggestion: vi.fn(),
    }
}));

describe('SuggestionList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock return
        vi.mocked(StorageService.getSuggestions).mockReturnValue([
            {
                id: 's-1',
                title: 'Existing Task',
                frequency: 'Daily',
                nextDueDate: new Date().toISOString(),
                isActive: true,
                history: [],
                createdAt: new Date().toISOString()
            }
        ]);
    });

    it('renders list of suggestions', () => {
        render(<SuggestionList />);
        expect(screen.getByText('Existing Task')).toBeDefined();
    });

    it('opens add modal when Add button is clicked', () => {
        render(<SuggestionList />);
        const addButton = screen.getByText('+ Add');
        fireEvent.click(addButton);
        expect(screen.getByText('New Suggestion')).toBeDefined(); // Modal Title
    });

    it('saves new suggestion', async () => {
        render(<SuggestionList />);
        fireEvent.click(screen.getByText('+ Add'));

        // Fill form
        fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Task' } });
        fireEvent.click(screen.getByText('Save'));

        expect(StorageService.saveSuggestion).toHaveBeenCalled();
    });
});
