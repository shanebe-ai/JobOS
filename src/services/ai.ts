import { type AIServiceInterface, type OutreachDraftContext, type AIResponse, type OutreachDraft } from '../domain/ai';

import { StorageService } from './storage';

const SIMULATED_LATENCY = 1500;

export const AIService: AIServiceInterface = {
    draftOutreach: (context: OutreachDraftContext) => {
        return new Promise((resolve) => {
            const userProfile = StorageService.getUserProfile();
            // Profile context is implicitly used via properties below

            setTimeout(() => {
                let body = '';
                let subject = '';
                let rationale = '';
                let confidence = 0.9;

                if (context.intent === 'Connect') {
                    subject = `${context.intent} - ${context.companyName}`;
                    body = `Hi ${context.recipientName},\n\nI've been following ${context.companyName}'s work on X, and I noticed you're a ${context.recipientRole} there. I'm currently exploring opportunities as a ${context.jobTitle} and would love to connect and learn more about your team's culture.`;

                    if (userProfile?.linkedInUrl) {
                        body += `\n\nMy LinkedIn: ${userProfile.linkedInUrl}`;
                    }

                    rationale = 'Drafted based on standard polite networking norms and your request context.';
                    confidence = 0.9;
                } else if (context.intent === 'FollowUp') {
                    // Simulated extraction logic
                    const jd = context.jobDescription?.toLowerCase() || '';
                    let goal = 'its mission';
                    if (jd.includes('future of work')) goal = 'the future of work';
                    if (jd.includes('a11y')) goal = 'accessible web experiences';

                    subject = `${context.intent} - ${context.companyName}`;
                    body = `Hi ${context.recipientName},\n\nI wanted to circle back on my application for the ${context.jobTitle} role. I remain very interested in helping ${context.companyName} achieve ${goal}. Any updates on the timeline?`;
                    rationale = 'Compared JD keywords against your resume text.';
                    confidence = 0.85;
                } else if (context.intent === 'PeerOutreach') {
                    subject = `Touching base - ${context.jobTitle} application`;
                    const intro = userProfile?.aboutMe ? `\n\nA bit about me: ${userProfile.aboutMe.slice(0, 100)}...` : '';

                    body = `Hi ${context.recipientName},\n\nI just applied for the ${context.jobTitle} role at ${context.companyName} and wanted to briefly introduce myself.\n\nI've been following ${context.companyName}'s work and it aligns perfectly with my background.\n\nI noticed you are working as a ${context.recipientRole} there. I'd love to connect and hear a bit about your experience with the team if you're open to it.${intro}\n\nBest,\n${userProfile?.name || '[Your Name]'}`;
                    rationale = "Used a peer-to-peer approach. Included bio snippet from profile.";
                    confidence = 0.9;
                }

                resolve({
                    data: {
                        subject,
                        body,
                    },
                    rationale: `Using profile context for ${userProfile?.name || 'User'}: ${rationale}`,
                    confidence,
                });
            }, SIMULATED_LATENCY);
        });
    },

    analyzeResume: (jobDescription: string, resumeText: string) => {
        return new Promise((resolve) => {
            const userProfile = StorageService.getUserProfile();

            setTimeout(() => {
                // Simple keyword extraction for MVP
                const commonTechKeywords = [
                    'react', 'typescript', 'node.js', 'python', 'aws', 'kubernetes', 'docker',
                    'agile', 'scrum', 'system design', 'graphql', 'rest api', 'sql', 'nosql'
                ];

                const jdLower = jobDescription.toLowerCase();
                const resumeLower = resumeText.toLowerCase();

                // Find keywords in JD
                const jdKeywords = commonTechKeywords.filter(k => jdLower.includes(k));

                // Check which are missing from Resume
                const missingKeywords = jdKeywords.filter(k => !resumeLower.includes(k));

                const suggestions = [];

                if (missingKeywords.length > 0) {
                    suggestions.push(`Missing Keywords: Your resume is missing: "${missingKeywords.slice(0, 3).join('", "')}" which are in the JD.`);
                } else if (jdKeywords.length > 0) {
                    suggestions.push('Great job! Your resume covers the key technical requirements found in the JD.');
                } else {
                    suggestions.push('Tip: Ensure your resume explicitly mentions the core technologies listed in the job description.');
                }

                // Resume length check
                if (resumeText.length < 200) {
                    suggestions.push('Warning: The resume content seems very short. Did you paste the full text?');
                }

                if (userProfile?.skills) {
                    const profileSkillsInResume = userProfile.skills.filter((s: string) => resumeLower.includes(s.toLowerCase()));
                    if (profileSkillsInResume.length > 0) {
                        suggestions.push(`Profile Match: Verifying you mentioned your key skills: ${profileSkillsInResume.join(', ')}.`);
                    }
                }

                resolve({
                    data: suggestions.length > 0 ? suggestions : ['Resume looks solid! Consider adding more specific metrics.'],
                    rationale: 'Performed keyword gap analysis between JD and Resume content.',
                    confidence: 0.95
                });
            }, SIMULATED_LATENCY);
        });
    }
};
