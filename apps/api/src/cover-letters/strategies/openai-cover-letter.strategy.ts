import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoverLetterStrategy, CoverLetterResult } from './cover-letter-strategy.interface';

@Injectable()
export class OpenAICoverLetterStrategy implements CoverLetterStrategy {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
  }

  async generate(
    _applicationId: string,
    tone: string,
    length: string,
    resumeText: string,
    jobDescription: string,
    companyName: string,
  ): Promise<CoverLetterResult> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const lengthGuide = {
      short: '1-2 paragraphs, about 150 words',
      medium: '3-4 paragraphs, about 300 words',
      long: '5-6 paragraphs, about 500 words',
    };

    const toneGuide = {
      formal: 'Professional and traditional business language',
      enthusiastic: 'Energetic and passionate tone',
      professional: 'Balanced professional tone with warmth',
    };

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
                'You are a professional cover letter writer. Write a compelling cover letter based on the job description and resume provided. Return JSON with content (full letter) and preview (first 150 chars).',
            },
            {
              role: 'user',
              content: `Company: ${companyName}\nTone: ${tone} (${toneGuide[tone] || toneGuide.professional})\nLength: ${length} (${lengthGuide[length] || lengthGuide.medium})\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        content: result.content || 'Could not generate cover letter.',
        preview: result.preview || (result.content || '').substring(0, 150),
      };
    } catch {
      throw new Error('OpenAI cover letter generation failed');
    }
  }
}
