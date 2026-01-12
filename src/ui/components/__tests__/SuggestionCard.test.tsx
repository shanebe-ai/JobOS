import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SuggestionCard } from '../SuggestionCard';
import type { Suggestion } from '../../../domain/suggestion';

const mockSuggestion: Suggestion = {
    id: 's-1',
    title: 'Test Suggestion',
    description: 'Do the thing',
    frequency: 'Daily',
    nextDueDate: '2023-01-01',
    isActive: true,
    history: [],
    createdAt: '2023-01-01'
};

describe('SuggestionCard', () => {
    it('renders suggestion details', () => {
        render(
            <SuggestionCard
                suggestion={mockSuggestion}
                onComplete={vi.fn()}
                onSkip={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );
        expect(screen.getByText('Test Suggestion')).toBeDefined();
        expect(screen.getByText('Do the thing')).toBeDefined();
        expect(screen.getByText('Daily')).toBeDefined();
    });

    it('calls onComplete when Done button is clicked', () => {
        const onComplete = vi.fn();
        render(
            <SuggestionCard
                suggestion={mockSuggestion}
                onComplete={onComplete}
                onSkip={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );
        fireEvent.click(screen.getByText('✅ Done'));
        expect(onComplete).toHaveBeenCalledWith('s-1');
    });

    it('calls onSkip when Skip button is clicked', () => {
        const onSkip = vi.fn();
        render(
            <SuggestionCard
                suggestion={mockSuggestion}
                onComplete={vi.fn()}
                onSkip={onSkip}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );
        fireEvent.click(screen.getByText('⏭ Skip'));
        expect(onSkip).toHaveBeenCalledWith('s-1');
    });
});
