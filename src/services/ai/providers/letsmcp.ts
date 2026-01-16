/**
 * LetsMCP Provider for JobOS
 * Connects to the LetsMCP server for AI features
 */

import type { AIService, JobDetailsExtraction } from '../ai';

// Default to localhost:3002, can be overridden via settings
// Default to relative path (uses Vite proxy), can be overridden via settings
const DEFAULT_MCP_URL = '';

export interface LetsMCPConfig {
    baseUrl?: string;
    provider?: 'groq' | 'claude' | 'gemini';
}

export class LetsMCPProvider implements AIService {
    private baseUrl: string;
    private preferredProvider?: string;

    constructor(config?: LetsMCPConfig) {
        this.baseUrl = config?.baseUrl || DEFAULT_MCP_URL;
        this.preferredProvider = config?.provider;
    }

    /**
     * Check if the MCP server is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/status`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000), // 3 second timeout
            });
            if (!response.ok) return false;
            const data = await response.json();
            return data.status === 'ok';
        } catch {
            return false;
        }
    }

    /**
     * Check if AI providers are configured on the MCP server
     */
    async hasAIProvider(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/status`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000),
            });
            if (!response.ok) return false;
            const data = await response.json();
            return data.hasAI === true;
        } catch {
            return false;
        }
    }

    /**
     * Validate API key - for LetsMCP we just check server availability
     */
    async validateKey(_apiKey: string): Promise<string | null> {
        const available = await this.isAvailable();
        if (available) {
            return 'letsmcp'; // Return a provider name to indicate success
        }
        throw new Error('LetsMCP server is not available');
    }

    /**
     * Generate text using the MCP server's AI
     */
    async generateText(prompt: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                provider: this.preferredProvider,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || 'LetsMCP generation failed');
        }

        const data = await response.json();
        return data.text;
    }

    /**
     * Extract job details - tries LinkedIn scraper first if URL detected
     */
    async extractJobDetails(text: string): Promise<JobDetailsExtraction> {
        // Check if text looks like a LinkedIn URL (supports multiple formats)
        // - /jobs/view/123456789
        // - /jobs/collections/recommended/?currentJobId=123456789
        // - /jobs/search/?currentJobId=123456789
        const linkedInMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/jobs\/[^\s]+/i);

        // Use the extract-job endpoint which handles LinkedIn URLs internally
        // It will use the scraper for LinkedIn URLs and AI for text
        const response = await fetch(`${this.baseUrl}/api/extract-job`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: linkedInMatch ? undefined : text,
                url: linkedInMatch?.[0],
                provider: this.preferredProvider,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || 'LetsMCP job extraction failed');
        }

        const data = await response.json();
        return data.data || {};
    }

    /**
     * Analyze resume against job description
     */
    async analyzeResume(jobDescription: string, resumeText: string): Promise<{
        matchScore: number;
        strengths: string[];
        gaps: string[];
        recommendations: string[];
    }> {
        const response = await fetch(`${this.baseUrl}/api/analyze-resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobDescription,
                resumeText,
                provider: this.preferredProvider,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || 'LetsMCP resume analysis failed');
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Draft an outreach email
     */
    async draftEmail(context: {
        recipientName: string;
        recipientRole: string;
        companyName: string;
        jobTitle: string;
        tone: string;
        intent: string;
        jobDescription?: string;
    }): Promise<{ subject: string; body: string }> {
        const response = await fetch(`${this.baseUrl}/api/draft-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...context,
                provider: this.preferredProvider,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || 'LetsMCP email drafting failed');
        }

        const data = await response.json();
        return data.data;
    }
}
