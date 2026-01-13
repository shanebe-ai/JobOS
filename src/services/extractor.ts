import type { Job } from '../domain/job';

export const ExtractorService = {
    async extractJobDetails(url: string): Promise<Partial<Job>> {
        // basic cleanup
        const cleanUrl = url.trim();

        // DEMO MODE: Specific URL triggers "Magic Fill"
        // This simulates what a backend/extension would do
        // DEMO MODE: Specific URL triggers "Magic Fill"
        // This simulates what a backend/extension would do
        if (cleanUrl === 'demo-job' || cleanUrl === 'example.com/perfect-job') {
            console.log('⚡ Demo Mode Triggered');

            // Artificial delay to feel like "work" is happening
            await new Promise(resolve => setTimeout(resolve, 800));

            return {
                title: 'Senior Frontend Engineer',
                company: 'TechCorp AI',
                location: 'San Francisco, CA',
                isRemote: true,
                source: 'LinkedIn',
                originalLink: cleanUrl,
                description: `About the Job
We are looking for a Senior Frontend Engineer to join our core product team.

Responsibilities:
- Build modern web applications with React and TypeScript
- Collaborate with design and product teams
- Optimize performance and user experience

Requirements:
- 5+ years of experience with modern JS/TS
- Strong UI/UX sense
- Experience with AI/LLM integration is a plus`,
                level: 'Senior',
                salaryRange: '$160k - $210k'
            };
        }

        let domain = '';
        try {
            domain = new URL(cleanUrl).hostname;
        } catch (e) {
            // invalid URL, just return empty
            return {};
        }

        const result: Partial<Job> = {
            originalLink: cleanUrl,
            source: 'Unknown'
        };

        // Source Detection
        if (domain.includes('linkedin.com')) result.source = 'LinkedIn';
        else if (domain.includes('indeed.com')) result.source = 'Indeed';
        else if (domain.includes('glassdoor.com')) result.source = 'Glassdoor';
        else if (domain.includes('greenhouse.io')) result.source = 'Greenhouse';
        else if (domain.includes('lever.co')) result.source = 'Lever';
        else if (domain.includes('workday.com')) result.source = 'Workday';

        // Basic Heuristics for real URLs (since we have CORS limits)
        // We can't fetch the HTML, but we can guess some things from URL structure if we wanted.
        // For now, just setting the source is a good "helper".

        return result;
    }
};
