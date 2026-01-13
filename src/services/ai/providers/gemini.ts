import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIService } from '../ai';

export class GoogleGeminiProvider implements AIService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
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
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini Generation Error:', error);
            throw error;
        }
    }

    /**
     * Tries to find a working model by querying the API for available models.
     */
    async validateKey(key: string): Promise<string | null> {
        try {
            console.log('Fetching available models from API...');
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

            console.log('Available models:', data.models);

            if (!data.models || !Array.isArray(data.models)) {
                throw new Error('Invalid response format from ListModels');
            }

            // Filter for models that support generateContent
            const supportedModels = data.models.filter((m: any) =>
                m.supportedGenerationMethods &&
                m.supportedGenerationMethods.includes('generateContent')
            );

            // Sort preferences: prefer models with 'pro' or 'flash' in the name
            const preferredModels = supportedModels.sort((a: any, b: any) => {
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

                console.log(`Auto-selected best model: ${bestModelName}`);

                // Verify it actually works
                const tempAI = new GoogleGenerativeAI(key);
                const tempModel = tempAI.getGenerativeModel({ model: bestModelName });
                await tempModel.generateContent('Test');

                return bestModelName;
            }

            throw new Error('No models found that support generateContent.');

        } catch (e: any) {
            console.error('Model Discovery Error:', e);
            throw e;
        }
    }
    async extractJobDetails(text: string): Promise<any> {
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
