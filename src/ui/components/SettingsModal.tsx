import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { GoogleGeminiProvider } from '../../services/ai/providers/gemini';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            const settings = StorageService.getSettings();
            setApiKey(settings.apiKey || '');
            setStatus('idle');
            setStatusMessage('');
        }
    }, [isOpen]);

    const handleSave = async () => {
        setStatus('validating');
        setStatusMessage('Finding best model...');

        const provider = new GoogleGeminiProvider();
        try {
            const validModelName = await provider.validateKey(apiKey.trim()); // Returns model name or null

            if (validModelName) {
                // Save the specific model that worked (e.g., 'gemini-pro' vs 'gemini-1.5-flash')
                StorageService.saveSettings({
                    aiProvider: 'gemini',
                    apiKey: apiKey.trim(),
                    model: validModelName
                });
                setStatus('success');
                setStatusMessage(`Connected! Using model: ${validModelName}`);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setStatus('error');
                setStatusMessage('Invalid API Key or no supported models found.');
            }
        } catch (error: any) {
            setStatus('error');
            // Show the actual error message to the user for debugging
            setStatusMessage(`Error: ${error.message || 'Unknown error'}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>⚙️ Settings</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>AI Provider</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="radio" checked readOnly />
                            Google Gemini
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#999', cursor: 'not-allowed' }}>
                            <input type="radio" disabled />
                            OpenAI (Coming Soon)
                        </label>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Gemini API Key
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--primary-color)' }}
                        >
                            (Get Key)
                        </a>
                    </label>
                    <input
                        type="password"
                        className="input"
                        placeholder="AIza..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ width: '100%', fontFamily: 'monospace' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        Your key is stored locally in your browser. It is never sent to our servers.
                    </p>
                </div>

                {status !== 'idle' && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: status === 'error' ? '#fee2e2' : status === 'success' ? '#dcfce7' : '#f3f4f6',
                        color: status === 'error' ? '#991b1b' : status === 'success' ? '#166534' : '#1f2937'
                    }}>
                        {statusMessage}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={!apiKey || status === 'validating'}
                    >
                        {status === 'validating' ? 'Verifying...' : 'Save & Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
};
