import { type AIServiceInterface, type OutreachDraftContext, type AIResponse, type OutreachDraft } from '../domain/ai';

const SIMULATED_LATENCY = 1000;

export const AIService: AIServiceInterface = {
    draftOutreach: async (context: OutreachDraftContext): Promise<AIResponse<OutreachDraft>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let body = '';
                let subject = '';
                let rationale = '';
                let confidence = 0.9;

                if (context.intent === 'Connect') {
                    subject = `${context.intent} - ${context.companyName}`;
                    body = `Hi ${context.recipientName},\n\nI've been following ${context.companyName}'s work on X, and I noticed you're a ${context.recipientRole} there. I'm currently exploring opportunities as a ${context.jobTitle} and would love to connect and learn more about your team's culture.`;
                    rationale = 'Drafted based on standard polite networking norms and your request context.';
                    confidence = 0.9;
                } else if (context.intent === 'FollowUp') {
                    // Simulated extraction logic
                    const jd = context.jobDescription?.toLowerCase() || '';
                    let goal = 'its product vision';
                    if (jd.includes('mission')) goal = 'its mission';
                    if (jd.includes('future of work')) goal = 'the future of work';
                    if (jd.includes('a11y')) goal = 'accessible web experiences';

                    subject = `${context.intent} - ${context.companyName}`;
                    body = `Hi ${context.recipientName},\n\nI wanted to circle back on my application for the ${context.jobTitle} role. I remain very interested in helping ${context.companyName} achieve ${goal}. Any updates on the timeline?`;
                    rationale = 'Compared JD keywords against your resume text.';
                    confidence = 0.85;
                } else if (context.intent === 'PeerOutreach') {
                    subject = `Touching base - ${context.jobTitle} application`;
                    body = `Hi ${context.recipientName},\n\nI just applied for the ${context.jobTitle} role at ${context.companyName} and wanted to briefly introduce myself.\n\nI've been following ${context.companyName}'s work on [Specific Product/Goal] (AI simulated extraction) and it aligns perfectly with my background.\n\nI noticed you are working as a ${context.recipientRole} there. I'd love to connect and hear a bit about your experience with the team if you're open to it.\n\nBest,\n[Your Name]`;
                    rationale = "Used a peer-to-peer approach. Acknowledged the application immediately to set context, then pivoted to a soft connection request based on shared professional interest.";
                    confidence = 0.9;
                }

                resolve({
                    data: {
                        subject,
                        body,
                    },
                    rationale,
                    confidence,
                });
            }, SIMULATED_LATENCY);
        });
    },

    analyzeResume: async (_jobDescription: string, _resumeText: string): Promise<AIResponse<string[]>> => {
        // Stub
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        'Add "React" to your skills section.',
                        'Highlight your experience with "System Design".',
                        'Quantify your impact in your last role (e.g. "Improved X by Y%").'
                    ],
                    rationale: 'Compared JD keywords against your resume text.',
                    confidence: 0.85
                });
            }, SIMULATED_LATENCY);
        });
    },
};
