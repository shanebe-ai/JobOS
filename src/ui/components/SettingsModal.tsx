import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { GoogleGeminiProvider } from '../../services/ai/providers/gemini';

import { ConfirmationModal } from './ConfirmationModal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    // Import Flow State
    const [importWarningOpen, setImportWarningOpen] = useState(false);
    const [importSuccessOpen, setImportSuccessOpen] = useState(false);
    const [importErrorOpen, setImportErrorOpen] = useState(false);
    const [importPendingFile, setImportPendingFile] = useState<File | null>(null);

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

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportPendingFile(file);
        setImportWarningOpen(true);
        // Reset input value so same file can be selected again if needed
        e.target.value = '';
    };

    const processImport = () => {
        if (!importPendingFile) return;
        setImportWarningOpen(false);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const success = StorageService.importData(content);
                if (success) {
                    setImportSuccessOpen(true);
                } else {
                    setImportErrorOpen(true);
                }
            }
        };
        reader.readAsText(importPendingFile);
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

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1rem' }}>💾 Data Management</h3>

                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Export Data</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Download a JSON backup of all your jobs and artifacts.</div>
                            </div>
                            <button className="btn btn-outline" onClick={() => {
                                const data = StorageService.exportAllData();
                                const blob = new Blob([data], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `jobos_backup_${new Date().toISOString().split('T')[0]}.json`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}>
                                ⬇️ Download
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Import Backup</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Restore from a previously saved JSON file.</div>
                            </div>
                            <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                                📂 Restore
                                <input
                                    type="file"
                                    accept=".json"
                                    style={{ display: 'none' }}
                                    onChange={onFileSelect}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-outline" onClick={onClose}>Done</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={!apiKey || status === 'validating'}
                    >
                        {status === 'validating' ? 'Verifying...' : 'Test & Save Key'}
                    </button>
                </div>

                {/* Confirm Import Warning */}
                <ConfirmationModal
                    isOpen={importWarningOpen}
                    title="⚠️ Overwrite Data Warning"
                    message="Importing this backup will PERMANENTLY ERASE and overwrite all your current data. This action cannot be undone. Are you sure you want to proceed?"
                    confirmText="Overwrite Everything"
                    cancelText="Cancel"
                    onConfirm={processImport}
                    onCancel={() => {
                        setImportWarningOpen(false);
                        setImportPendingFile(null);
                    }}
                />

                {/* Import Success */}
                <ConfirmationModal
                    isOpen={importSuccessOpen}
                    title="✅ Import Successful"
                    message="Your data has been successfully restored from the backup file. The application will now reload to apply changes."
                    confirmText="Reload App"
                    cancelText={null}
                    onConfirm={() => window.location.reload()}
                    onCancel={() => { }}
                />

                {/* Import Error */}
                <ConfirmationModal
                    isOpen={importErrorOpen}
                    title="❌ Import Failed"
                    message="The selected file either is not a valid JobOS backup or is corrupted. No data was changed."
                    confirmText="Close"
                    cancelText={null}
                    onConfirm={() => setImportErrorOpen(false)}
                    onCancel={() => setImportErrorOpen(false)}
                />

            </div>
        </div>
    );
};
