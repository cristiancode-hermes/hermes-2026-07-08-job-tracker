import { Injectable } from '@nestjs/common';
import { AIStrategy, AIAnalysisResult } from './ai-strategy.interface';

@Injectable()
export class LocalFallbackStrategy implements AIStrategy {
  async analyze(
    _applicationId: string,
    resumeText: string,
    jobDescription: string,
  ): Promise<AIAnalysisResult> {
    const resumeWords = this.extractWords(resumeText);
    const jobWords = this.extractWords(jobDescription);

    const resumeSet = new Set(resumeWords);
    const jobSet = new Set(jobWords);

    // Find matching keywords
    const matched: string[] = [];
    const missing: string[] = [];

    for (const word of jobSet) {
      if (resumeSet.has(word)) {
        matched.push(word);
      } else {
        missing.push(word);
      }
    }

    const total = jobSet.size || 1;
    const matchScore = Math.round((matched.length / total) * 100);

    // Generate strengths from matched keywords
    const strengths = matched.slice(0, 5).map(
      (w) => `Experience with "${w}"`,
    ) || ['General qualifications match'];

    // Generate gaps from missing keywords
    const gaps = missing.slice(0, 5).map(
      (w) => `Missing "${w}" experience`,
    ) || ['Review job requirements for specific gaps'];

    // Generate suggestions
    const suggestions = [
      'Tailor your resume to highlight relevant experience',
      'Add specific metrics and achievements',
      ...missing.slice(0, 3).map((w) => `Consider adding "${w}" skills`),
    ];

    return { matchScore, strengths, gaps, suggestions };
  }

  private extractWords(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }
}
