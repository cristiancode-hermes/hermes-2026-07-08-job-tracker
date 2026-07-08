export interface CoverLetterResult {
  content: string;
  preview: string;
}

export interface CoverLetterStrategy {
  generate(
    applicationId: string,
    tone: string,
    length: string,
    resumeText: string,
    jobDescription: string,
    companyName: string,
  ): Promise<CoverLetterResult>;
}
