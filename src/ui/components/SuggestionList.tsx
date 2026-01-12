import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import type { Suggestion, SuggestionHistoryEntry } from '../../domain/suggestion';
import { SuggestionCard } from './SuggestionCard';
import { SuggestionModal } from './SuggestionModal';
import { ConfirmationModal } from './ConfirmationModal';

export const SuggestionList: React.FC = () => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);

    const refreshSuggestions = () => {
        const all = StorageService.getSuggestions();
        // Determine "Active" as: Marked Active AND (Due Date is today/past OR it's a new task)
        // Actually, simplest is: Is Active AND Next Due Date <= End of Today.
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const due = all.filter(s => {
            if (!s.isActive) return false;
            const due = new Date(s.nextDueDate);
            return due <= endOfToday;
        });

        setSuggestions(due);
    };

    useEffect(() => {
        refreshSuggestions();
    }, []);


    const handleSave = (suggestionData: Partial<Suggestion>) => {
        if (editingSuggestion) {
            // Edit
            const updated = { ...editingSuggestion, ...suggestionData };
            StorageService.saveSuggestion(updated);
        } else {
            // New
            const newSuggestion: Suggestion = {
                id: crypto.randomUUID(),
                title: suggestionData.title!,
                description: suggestionData.description,
                frequency: suggestionData.frequency!,
                nextDueDate: new Date().toISOString(),
                isActive: true,
                history: [],
                createdAt: new Date().toISOString(),
                ...suggestionData
            } as Suggestion;
            StorageService.saveSuggestion(newSuggestion);
        }
        setEditingSuggestion(null);
        refreshSuggestions();
    };

    const handleAction = (id: string, actionType: 'Completed' | 'Skipped' | 'Unnecessary') => {
        const suggestion = suggestions.find(s => s.id === id);
        if (!suggestion) return;

        const historyEntry: SuggestionHistoryEntry = {
            date: new Date().toISOString(),
            action: actionType
        };

        const updatedHistory = [historyEntry, ...suggestion.history];
        let updatedSuggestion = { ...suggestion, history: updatedHistory };

        // Calculate next due date
        if (actionType === 'Completed' || actionType === 'Skipped') {
            const now = new Date();
            let nextDate = new Date(now);

            if (suggestion.frequency === 'Daily') {
                nextDate.setDate(now.getDate() + 1);
            }
            else if (suggestion.frequency === 'Weekly') {
                const days = suggestion.frequencyDetails?.daysOfWeek;
                if (days && days.length > 0) {
                    // Find next enabled day
                    let found = false;
                    for (let i = 1; i <= 7; i++) {
                        const check = new Date(now);
                        check.setDate(now.getDate() + i);
                        if (days.includes(check.getDay())) {
                            nextDate = check;
                            found = true;
                            break;
                        }
                    }
                    // Fallback: +1 week if logic fails or no days set? 
                    if (!found) nextDate.setDate(now.getDate() + 7);
                } else {
                    nextDate.setDate(now.getDate() + 7);
                }
            }
            else if (suggestion.frequency === 'Monthly') {
                // Move to next month
                nextDate.setMonth(now.getMonth() + 1);
                // Set to specific day if preferred
                if (suggestion.frequencyDetails?.dayOfMonth) {
                    const preferredDay = suggestion.frequencyDetails.dayOfMonth;
                    // Handle short months (e.g. asking for 31st in Feb)
                    const daysInNextMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
                    nextDate.setDate(Math.min(preferredDay, daysInNextMonth));
                }
            }
            else if (suggestion.frequency === 'Once') {
                updatedSuggestion.isActive = false;
            }

            updatedSuggestion.nextDueDate = nextDate.toISOString();
        } else if (actionType === 'Unnecessary') {
            updatedSuggestion.isActive = false;
        }

        StorageService.saveSuggestion(updatedSuggestion);
        refreshSuggestions();
    };

    const [suggestionToDelete, setSuggestionToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setSuggestionToDelete(id);
    };

    const confirmDelete = () => {
        if (suggestionToDelete) {
            StorageService.deleteSuggestion(suggestionToDelete);
            refreshSuggestions();
            setSuggestionToDelete(null);
        }
    };

    return (
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>My Routine</h2>
                <div>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>+ Add</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {suggestions.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No active routine tasks.</p>}

                {suggestions.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()).map(s => (
                    <SuggestionCard
                        key={s.id}
                        suggestion={s}
                        onComplete={(id) => handleAction(id, 'Completed')}
                        onSkip={(id) => handleAction(id, 'Skipped')}
                        onEdit={(s) => { setEditingSuggestion(s); setIsAddModalOpen(true); }}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            <SuggestionModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingSuggestion(null); }}
                onSave={handleSave}
                initialData={editingSuggestion}
            />



            {/* Assuming ConfirmationModal is available globally or imported - need to add import if not present */}
            <ConfirmationModal
                isOpen={!!suggestionToDelete}
                title="Delete Activity"
                message="Are you sure you want to delete this activity? This will remove all history and future reminders."
                onConfirm={confirmDelete}
                onCancel={() => setSuggestionToDelete(null)}
            />
        </div>
    );
};

