import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel } from '@google/generative-ai';
import type { AIService, JobDetailsExtraction } from '../ai';

interface GeminiModelInfo {
    name: string;
    supportedGenerationMethods?: string[];
}

export class GoogleGeminiProvider implements AIService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: GenerativeModel | null = null;
    private modelName: string = 'gemini-1.5-flash';

    constructor(apiKey?: string, modelName?: string) {
        if (apiKey) {
            this.modelName = modelName || 'gemini-1.5-flash';
            this.initialize(apiKey, this.modelName);
        }
    }

    initialize(apiKey: string, modelName: string = 'gemini-1.5-flash') {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = modelName;
        this.model = this.genAI.getGenerativeModel({ model: modelName });
    }

    async generateText(prompt: string): Promise<string> {
        if (!this.model) {
            throw new Error('Gemini Provider not initialized with API Key');
        }

        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : '';
                const isQuota = msg.includes('429') || msg.toLowerCase().includes('quota');

                if (isQuota && attempt < maxRetries - 1) {
                    console.warn(`Gemini 429 Hit. Retrying (Attempt ${attempt + 1}/${maxRetries})...`);
                    const delay = Math.pow(2, attempt) * 1000 + 500; // 1.5s, 3.5s, 7.5s...
                    await new Promise(resolve => setTimeout(resolve, delay));
                    attempt++;
                    continue;
                }

                console.error('Gemini Generation Error:', error);
                throw error;
            }
        }
        throw new Error("Max retries exceeded");
    }

    /**
     * Tries to find a working model by querying the API for available models.
     */
    async validateKey(key: string): Promise<string | null> {
        try {
            // Direct fetch to list models (bypassing SDK guessing)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const data = await response.json();

            if (!response.ok) {
                console.error('ListModels failed:', data);
                if (data.error) {
                    throw new Error(data.error.message || response.statusText);
                }
                throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
            }


            const models = data.models as GeminiModelInfo[] | undefined;
            if (!models || !Array.isArray(models)) {
                throw new Error('Invalid response format from ListModels');
            }

            // Filter for models that support generateContent
            const supportedModels = models.filter((m: GeminiModelInfo) =>
                m.supportedGenerationMethods &&
                m.supportedGenerationMethods.includes('generateContent')
            );

            // Sort preferences: prefer models with 'pro' or 'flash' in the name
            const preferredModels = supportedModels.sort((a: GeminiModelInfo, b: GeminiModelInfo) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                const scoreA = (nameA.includes('flash') ? 2 : 0) + (nameA.includes('pro') ? 1 : 0) + (nameA.includes('1.5') ? 1 : 0);
                const scoreB = (nameB.includes('flash') ? 2 : 0) + (nameB.includes('pro') ? 1 : 0) + (nameB.includes('1.5') ? 1 : 0);
                return scoreB - scoreA;
            });

            if (preferredModels.length > 0) {
                // The name comes back as "models/gemini-pro", we need to strip "models/" for the SDK usually, 
                // OR the SDK accepts "models/..." too. Let's strip it to be safe as SDK usually expects just the ID.
                const bestModelFullName = preferredModels[0].name;
                const bestModelName = bestModelFullName.replace('models/', '');


                // Verify it actually works
                const tempAI = new GoogleGenerativeAI(key);
                const tempModel = tempAI.getGenerativeModel({ model: bestModelName });
                await tempModel.generateContent('Test');

                return bestModelName;
            }

            throw new Error('No models found that support generateContent.');

        } catch (e: unknown) {
            console.error('Model Discovery Error:', e);
            throw e;
        }
    }
    async extractJobDetails(text: string): Promise<JobDetailsExtraction> {
        if (!this.model) {
            throw new Error('Gemini Provider not initialized with API Key');
        }

        const prompt = `
            Role: Expert Data Extractor.
            Task: Extract job details from the provided text.
            Input Text: "${text.substring(0, 10000)}" 
            
            Output Format: JSON only. No markdown.
            Structure:
            {
                "title": "Job Title",
                "company": "Company Name",
                "location": "Location or Remote",
                "description": "Full job description text (cleaned up)",
                "salary": "Salary range if explicitly mentioned or null"
            }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const textResponse = result.response.text();

            // Clean markdown wrappers if present
            const cleanJson = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();

            return JSON.parse(cleanJson);
        } catch (error) {
            console.error('Job Extraction Error:', error);
            // Fallback: return empty object so manual entry is still possible
            return {};
        }
    }
}
