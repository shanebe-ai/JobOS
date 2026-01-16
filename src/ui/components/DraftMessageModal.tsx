import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { GoogleGeminiProvider } from '../../services/ai/providers/gemini';
import { LetsMCPProvider } from '../../services/ai/providers/letsmcp';
import type { OutreachDraftContext } from '../../domain/ai';

interface DraftMessageModalProps {
    context: OutreachDraftContext;
    initialDraft?: string;
    onClose: () => void;
    onSave: (message: string, status: 'Draft' | 'Sent') => void;
}

export const DraftMessageModal: React.FC<DraftMessageModalProps> = ({ context: initialContext, initialDraft, onClose, onSave }) => {
    const [context, setContext] = useState<OutreachDraftContext>(initialContext);
    const [loading, setLoading] = useState(false);
    const [draft, setDraft] = useState(initialDraft || '');
    const [rationale, setRationale] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Auto-generate on mount only if there is no initial draft provided
    useEffect(() => {
        if (!initialDraft) {
            generate();
        }
    }, []);

    // Smart Templates System (Offline Fallback)
    const getFallbackTemplate = (ctx: OutreachDraftContext): string => {
        const { recipientName, recipientRole, companyName, intent, jobTitle, jobDescription } = ctx;
        const myName = StorageService.getUserProfile()?.name || '[My Name]';

        switch (intent) {
            case 'FollowUp':
                return `Subject: Following up on my application for ${jobTitle}\n\nHi ${recipientName},\n\nI hope you're having a great week.\n\nI recently applied for the ${jobTitle} role at ${companyName} and wanted to briefly reiterate my strong interest. Given my background, I am confident I can contribute immediately to the team's goals.\n\nI know you're busy, but I'd love the chance to discuss how my experience aligns with what you're looking for.\n\nBest regards,\n${myName}`;

            case 'PeerOutreach':
                return `Subject: Quick question / Connecting\n\nHi ${recipientName},\n\nI noticed we both work in the tech space and I've been following ${companyName}'s work on [Specific Project/Topic]. I see you're working as a ${recipientRole} there.\n\nI'm currently exploring new opportunities and just wanted to connect with peers to learn more about the engineering culture at ${companyName}. No pressure at all, but would you be open to a quick 10-minute chat?\n\nCheers,\n${myName}`;

            case 'ReferralRequest':
                return `Subject: Quick question about ${companyName}\n\nHi ${recipientName},\n\nI hope this email finds you well.\n\nI'm a big fan of ${companyName} and noticed the open ${jobTitle} role. Based on my experience in [My Field/Skill], I think I'd be a great fit.\n\nI noticed you're a ${recipientRole} there. Would you be open to sharing a bit about your experience at the company? If you think it makes sense, I'd technically love a referral, but primarily I'd just value your perspective.\n\nBest,\n${myName}`;

            case 'Connect':
            default:
                return `Subject: Connecting\n\nHi ${recipientName},\n\nI've been following ${companyName} for a while and am very impressed by the team's direction. I noticed you are a ${recipientRole} and wanted to reach out.\n\nI am currently looking for my next challenge in ${jobTitle} roles and would love to connect to keep in touch.\n\nBest,\n${myName}`;
        }
    };

    const generate = async () => {
        setLoading(true);
        setError(null);
        setRationale('');

        try {
            const settings = StorageService.getSettings();
            const userProfile = StorageService.getUserProfile();
            const myName = userProfile?.name || 'Job Seeker';

            // 1. Try LetsMCP first
            if (settings.aiProvider === 'letsmcp' || !settings.apiKey) {
                try {
                    const mcpProvider = new LetsMCPProvider({
                        baseUrl: settings.mcpUrl || '',
                        provider: settings.mcpProvider as 'groq' | 'claude' | 'gemini',
                    });

                    const isAvailable = await mcpProvider.isAvailable();
                    const hasAI = await mcpProvider.hasAIProvider();

                    if (isAvailable && hasAI) {
                        console.log('Attempting LetsMCP email draft...');
                        const result = await mcpProvider.draftEmail({
                            recipientName: context.recipientName,
                            recipientRole: context.recipientRole,
                            companyName: context.companyName,
                            jobTitle: context.jobTitle,
                            tone: context.tone,
                            intent: context.intent,
                            jobDescription: context.jobDescription,
                        });

                        if (result.body) {
                            const emailText = result.subject
                                ? `Subject: ${result.subject}\n\n${result.body}`
                                : result.body;
                            setDraft(emailText.trim());
                            setRationale(`✨ AI Generated via LetsMCP (${settings.mcpProvider || 'groq'}) based on intent '${context.intent}'.`);
                            setLoading(false);
                            return;
                        }
                    }
                    console.warn('LetsMCP unavailable or has no AI, trying Gemini...');
                } catch (err) {
                    console.warn('LetsMCP draft failed, falling back to Gemini:', err);
                }
            }

            // 2. Try Gemini if API Key is configured
            if (settings.apiKey) {
                try {
                    const provider = new GoogleGeminiProvider(settings.apiKey, settings.model);

                    const prompt = `
                    Act as an expert career coach and copywriter.
                    Write a cold outreach email.

                    **Context:**
                    - **Sender Name:** ${myName}
                    - **Recipient:** ${context.recipientName} (${context.recipientRole}) at ${context.companyName}.
                    - **My Intent:** ${context.intent}
                    - **Job Target:** ${context.jobTitle}
                    - **Job Description Snippet:** "${context.jobDescription ? context.jobDescription.substring(0, 500) : 'N/A'}..."

                    **Refined Instructions for Intent '${context.intent}':**
                    ${context.intent === 'Connect' ? '- Objective: Start a loose conversation. NOT asking for a job directly. Ask about their experience.' : ''}
                    ${context.intent === 'PeerOutreach' ? '- Objective: Connect with a future peer. NO cover letter vibes. Focus on shared interests, culture, or specific tech/work they do. Be casual.' : ''}
                    ${context.intent === 'ReferralRequest' ? '- Objective: Politely ask for a referral after establishing a reason why I am a good fit. Be humble but confident.' : ''}
                    ${context.intent === 'FollowUp' ? '- Objective: Professional nudge on a past application. Reiteration of interest. Professional tone.' : ''}

                    **General Guidelines:**
                    1. Keep it concise (under 150 words).
                    2. Tone should be **${context.tone}** (Crucial!).
                    3. Sign off with: Best, [Sender Name]

                    **Output:**
                    - Just the email body text. No subject line. No markdown wrapping.
                    `;

                    const result = await provider.generateText(prompt);
                    setDraft(result.trim());
                    setRationale(`✨ AI Generated (Gemini ${settings.model}) based on intent '${context.intent}'.`);
                    setLoading(false);
                    return;
                } catch (err: any) {
                    console.warn('Gemini draft failed:', err);
                }
            }

            // 3. Final fallback: Smart Template
            console.warn('All AI providers failed, using template.');
            setDraft(getFallbackTemplate(context));
            setRationale("⚠️ OFFLINE MODE: Using Smart Template (AI unavailable).");

        } catch (err: any) {
            console.error('Generation Error:', err);
            setDraft(getFallbackTemplate(context));

            let errorMsg = "Unknown Error";
            if (err.message) errorMsg = err.message;
            if (errorMsg.includes('429')) errorMsg = "Quota Exceeded";

            setRationale(`⚠️ FALLBACK MODE: AI request failed (${errorMsg}). Used Smart Template instead.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '600px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>✨ AI Email Drafter</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Intent</label>
                        <select
                            className="input"
                            style={{ width: '100%' }}
                            value={context.intent}
                            onChange={(e) => setContext({ ...context, intent: e.target.value as any })}
                        >
                            <option value="FollowUp">Follow Up (Application)</option>
                            <option value="PeerOutreach">Peer Outreach (Culture/Team)</option>
                            <option value="Connect">General Connect</option>
                            <option value="ReferralRequest">Ask for Referral</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Tone</label>
                        <select
                            className="input"
                            style={{ width: '100%' }}
                            value={context.tone}
                            onChange={(e) => setContext({ ...context, tone: e.target.value as any })}
                        >
                            <option value="Professional">Professional</option>
                            <option value="Casual">Casual / Friendly</option>
                            <option value="Enthusiastic">Enthusiastic</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--primary-color)' }}>
                        <div className="loading-dot">Thinking...</div>
                    </div>
                ) : (
                    <>
                        {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}

                        {rationale && (
                            <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                🤖 {rationale}
                            </div>
                        )}

                        <textarea
                            className="input"
                            style={{ height: '250px', fontFamily: 'sans-serif', lineHeight: '1.5' }}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            placeholder="Email draft will appear here..."
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <button className="btn btn-outline" onClick={generate}>🔄 Regenerate</button>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-outline" onClick={() => onSave(draft, 'Draft')}>
                                    💾 Save Draft
                                </button>
                                <button className="btn btn-primary" onClick={() => onSave(draft, 'Sent')}>
                                    ✈️ Log as Sent
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
