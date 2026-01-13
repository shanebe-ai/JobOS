import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Basic configuration for PDF.js worker in Vite
// We use the ?url suffix to let Vite serve the worker file from node_modules

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const FileExtractionService = {
    /**
     * Extracts plain text from a File object (PDF or DOCX).
     */
    async extractText(file: File): Promise<string> {
        if (file.type === 'application/pdf') {
            return this.parsePdf(file);
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        ) {
            return this.parseDocx(file);
        } else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            return await file.text();
        }

        throw new Error('Unsupported file type. Please upload a PDF, DOCX, or Text file.');
    },

    /**
     * Parses a PDF file and returns its text content.
     */
    async parsePdf(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `\n--- Page ${i} ---\n${pageText}`;
        }

        return fullText.trim();
    },

    /**
     * Parses a DOCX file using Mammoth and returns raw text.
     */
    async parseDocx(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value.trim();
    }
};
