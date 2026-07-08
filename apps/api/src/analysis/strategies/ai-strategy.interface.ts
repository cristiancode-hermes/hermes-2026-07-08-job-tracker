export interface AIAnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

export interface AIStrategy {
  analyze(
    applicationId: string,
    resumeText: string,
    jobDescription: string,
  ): Promise<AIAnalysisResult>;
}
