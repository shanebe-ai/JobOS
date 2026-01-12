import React, { useState, useEffect } from 'react';
import type { Suggestion, Frequency } from '../../domain/suggestion';

interface SuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (suggestion: Partial<Suggestion>) => void;
    initialData?: Suggestion | null;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState<Frequency>('Daily');
    const [frequencyDetails, setFrequencyDetails] = useState<{ daysOfWeek?: number[], dayOfMonth?: number }>({});

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setFrequency(initialData.frequency);
            setFrequencyDetails(initialData.frequencyDetails || {});
        } else {
            setTitle('');
            setDescription('');
            setFrequency('Daily');
            setFrequencyDetails({});
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(initialData || {}),
            title,
            description,
            frequency,
            frequencyDetails
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '400px', background: 'white' }}>
                <h2 style={{ marginTop: 0 }}>{initialData ? 'Edit Suggestion' : 'New Suggestion'}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="suggestion-title" style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                        <input
                            id="suggestion-title"
                            type="text"
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <textarea
                            style={{ width: '100%', padding: '0.5rem', height: '80px' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Frequency</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem' }}
                            value={frequency}
                            onChange={e => setFrequency(e.target.value as Frequency)}
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Once">Once</option>
                        </select>
                    </div>

                    {frequency === 'Weekly' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', margin: 0 }}>Repeats on</label>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}
                                    onClick={() => setFrequencyDetails({ ...frequencyDetails, daysOfWeek: [1, 2, 3, 4, 5] })}
                                >
                                    Work Days (M-F)
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={frequencyDetails?.daysOfWeek?.includes(idx) || false}
                                            onChange={(e) => {
                                                const current = frequencyDetails?.daysOfWeek || [];
                                                const next = e.target.checked
                                                    ? [...current, idx]
                                                    : current.filter(d => d !== idx);
                                                setFrequencyDetails({ ...frequencyDetails, daysOfWeek: next });
                                            }}
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {frequency === 'Monthly' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Day of Month</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                style={{ width: '100px', padding: '0.5rem' }}
                                value={frequencyDetails?.dayOfMonth || 1}
                                onChange={e => setFrequencyDetails({ ...frequencyDetails, dayOfMonth: parseInt(e.target.value) })}
                            />
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
