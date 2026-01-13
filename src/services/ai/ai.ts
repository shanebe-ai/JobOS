export interface JobDetailsExtraction {
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    salary?: string;
}

export interface AIService {
    generateText(prompt: string): Promise<string>;
    validateKey(apiKey: string): Promise<string | null>;
    extractJobDetails(text: string): Promise<JobDetailsExtraction>;
    // Future expansion:
    // analyzeResume(resume: string, jobDescription: string): Promise<AnalysisResult>;
    // extractJobDetails(url: string, content: string): Promise<JobDetails>;
}
