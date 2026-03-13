import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const LoginView: React.FC = () => {
    const { signIn } = useAuth();
    const btnRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        const tryInit = () => {
            const g = (window as any).google;
            if (!g?.accounts?.id || !CLIENT_ID || !btnRef.current) return false;

            g.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: (response: { credential: string }) => {
                    signIn(response.credential);
                },
                auto_select: false,
            });

            g.accounts.id.renderButton(btnRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: 280,
            });

            initialized.current = true;
            return true;
        };

        // GSI script may still be loading — retry until ready
        if (!tryInit()) {
            const interval = setInterval(() => {
                if (tryInit()) clearInterval(interval);
            }, 200);
            return () => clearInterval(interval);
        }
    }, [signIn]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem',
        }}>
            {/* Logo / Brand */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                    width: '64px', height: '64px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', margin: '0 auto 1rem',
                }}>
                    💼
                </div>
                <h1 style={{ color: 'white', margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: '700' }}>JobOS</h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Your personal job search operating system</p>
            </div>

            {/* Card */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                textAlign: 'center',
            }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>Welcome</h2>
                <p style={{ margin: '0 0 2rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Sign in with Google to access your board.<br />
                    Your data is saved privately per account.
                </p>

                {!CLIENT_ID ? (
                    <div style={{
                        background: '#fff7ed', border: '1px solid #fed7aa',
                        borderRadius: '8px', padding: '1rem', fontSize: '0.85rem', color: '#92400e', textAlign: 'left',
                    }}>
                        <strong>Setup required</strong>
                        <p style={{ margin: '0.5rem 0 0' }}>
                            Add <code>VITE_GOOGLE_CLIENT_ID=your_client_id</code> to your <code>.env</code> file and restart the dev server.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div ref={btnRef} />
                    </div>
                )}

                <p style={{ margin: '2rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    We only collect your name and email from Google.<br />All job data stays on this server.
                </p>
            </div>
        </div>
    );
};
