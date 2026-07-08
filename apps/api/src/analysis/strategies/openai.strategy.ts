import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIStrategy, AIAnalysisResult } from './ai-strategy.interface';

@Injectable()
export class OpenAIStrategy implements AIStrategy {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
  }

  async analyze(
    _applicationId: string,
    resumeText: string,
    jobDescription: string,
  ): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a job application analyst. Analyze the match between a resume and job description. Return JSON with matchScore (0-100), strengths (string[]), gaps (string[]), suggestions (string[]).',
            },
            {
              role: 'user',
              content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        matchScore: result.matchScore ?? 50,
        strengths: result.strengths ?? [],
        gaps: result.gaps ?? [],
        suggestions: result.suggestions ?? [],
      };
    } catch {
      throw new Error('OpenAI analysis failed');
    }
  }
}
