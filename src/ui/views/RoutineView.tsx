import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import type { Suggestion, SuggestionHistoryEntry } from '../../domain/suggestion';
import { SuggestionModal } from '../components/SuggestionModal';
import { SuggestionCard } from '../components/SuggestionCard';
import { SuggestionCard } from '../components/SuggestionCard';

import { AppHeader } from '../components/AppHeader';

interface RoutineViewProps {
    onNavigate: (view: 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine') => void;
    isAddModalOpen: boolean;
    onSetAddModalOpen: (isOpen: boolean) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ onNavigate, isAddModalOpen, onSetAddModalOpen }) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    // Removed local isAddModalOpen state
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    // We need state for edit/delete modals if we want them to work perfectly
    // For now, let's keep it simple or minimal.
    // To support EDIT, we need editingSuggestion state
    const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);

    const refreshSuggestions = () => {
        setSuggestions(StorageService.getSuggestions());
    };

    useEffect(() => {
        refreshSuggestions();
    }, []);

    const handleSave = (suggestionData: Partial<Suggestion>) => {
        if (editingSuggestion) {
            const updated = { ...editingSuggestion, ...suggestionData };
            StorageService.saveSuggestion(updated);
        } else {
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

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            StorageService.deleteSuggestion(id);
            refreshSuggestions();
        }
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
                    if (!found) nextDate.setDate(now.getDate() + 7);
                } else {
                    nextDate.setDate(now.getDate() + 7);
                }
            }
            else if (suggestion.frequency === 'Monthly') {
                nextDate.setMonth(now.getMonth() + 1);
                if (suggestion.frequencyDetails?.dayOfMonth) {
                    const preferredDay = suggestion.frequencyDetails.dayOfMonth;
                    const daysInNextMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
                    nextDate.setDate(Math.min(preferredDay, daysInNextMonth));
                }
            }
            else if (suggestion.frequency === 'Once') {
                updatedSuggestion.isActive = false;
            }

            updatedSuggestion.nextDueDate = nextDate.toISOString();
        }

        StorageService.saveSuggestion(updatedSuggestion);
        refreshSuggestions();
    };

    // Flatten history for the table
    const historyItems = suggestions.flatMap(s =>
        s.history.map(h => ({
            ...h,
            suggestionTitle: s.title,
            suggestionId: s.id
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <AppHeader
                title="My Routine"
                onNavigate={onNavigate}
                currentView="routine"
            />

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                <button
                    style={{
                        background: 'none', border: 'none', padding: '0.5rem 0',
                        borderBottom: activeTab === 'active' ? '2px solid var(--primary-color)' : 'none',
                        fontWeight: activeTab === 'active' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('active')}
                >
                    Active Tasks
                </button>
                <button
                    style={{
                        background: 'none', border: 'none', padding: '0.5rem 0',
                        borderBottom: activeTab === 'history' ? '2px solid var(--primary-color)' : 'none',
                        fontWeight: activeTab === 'history' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('history')}
                >
                    History Log
                </button>
            </div>

            {activeTab === 'active' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {suggestions.map(suggestion => {
                        // Determine if it should be shown for TODAY
                        const todayStr = new Date().toDateString();
                        const nextDue = new Date(suggestion.nextDueDate);

                        // Check history for today's action
                        const lastAction = suggestion.history[0];
                        const actionDate = lastAction ? new Date(lastAction.date).toDateString() : null;
                        const actedToday = actionDate === todayStr;

                        // If it's not active, and wasn't acted on today, hide it
                        if (!suggestion.isActive && !actedToday) return null;

                        let status: 'Completed' | 'Skipped' | 'Open' | null = null;
                        let shouldShow = false;

                        if (actedToday) {
                            shouldShow = true;
                            status = lastAction.action as 'Completed' | 'Skipped';
                        } else if (suggestion.isActive) {
                            const endOfToday = new Date();
                            endOfToday.setHours(23, 59, 59, 999);
                            if (nextDue <= endOfToday) {
                                shouldShow = true;
                                status = 'Open';
                            }
                        }

                        if (!shouldShow) return null;

                        return (
                            <SuggestionCard
                                key={suggestion.id}
                                suggestion={suggestion}
                                statusOverride={status !== 'Open' ? status : null}
                                onComplete={(id) => handleAction(id, 'Completed')}
                                onSkip={(id) => handleAction(id, 'Skipped')}
                                onEdit={(s) => { setEditingSuggestion(s); onSetAddModalOpen(true); }}
                                onDelete={(id) => handleDelete(id)}
                            />
                        );
                    })}
                    {suggestions.every(s => {
                        const todayStr = new Date().toDateString();
                        const lastAction = s.history[0];
                        const actedToday = lastAction && new Date(lastAction.date).toDateString() === todayStr;
                        const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);
                        const isDue = s.isActive && new Date(s.nextDueDate) <= endOfToday;
                        return !(actedToday || isDue);
                    }) && <p className="text-secondary">No tasks for today!</p>}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>Date</th>
                                <th style={{ padding: '0.75rem' }}>Task</th>
                                <th style={{ padding: '0.75rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyItems.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.75rem' }}>{new Date(item.date).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem' }}>{item.suggestionTitle}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span className={`badge ${item.action === 'Completed' ? 'badge-success' : 'badge-secondary'}`}
                                            style={{ background: item.action === 'Completed' ? '#dcfce7' : '#f1f5f9', color: item.action === 'Completed' ? '#166534' : '#475569' }}>
                                            {item.action}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {historyItems.length === 0 && <p style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No history yet.</p>}
                </div>
            )}

            <SuggestionModal
                isOpen={isAddModalOpen}
                onClose={() => { onSetAddModalOpen(false); setEditingSuggestion(null); }}
                onSave={handleSave}
                initialData={editingSuggestion}
            />
        </div>
    );
};
