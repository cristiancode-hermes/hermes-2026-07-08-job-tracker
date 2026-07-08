import { Injectable } from '@nestjs/common';
import { CoverLetterStrategy, CoverLetterResult } from './cover-letter-strategy.interface';

@Injectable()
export class TemplateStrategy implements CoverLetterStrategy {
  async generate(
    _applicationId: string,
    tone: string,
    length: string,
    resumeText: string,
    jobDescription: string,
    companyName: string,
  ): Promise<CoverLetterResult> {
    const name = this.extractName(resumeText) || 'Applicant';
    const keySkills = this.extractKeywords(resumeText).slice(0, 3);
    const jobRole = this.extractJobRole(jobDescription) || 'the position';

    const templates = {
      formal: {
        short: `Dear Hiring Manager,\n\nI am writing to express my strong interest in ${jobRole} at ${companyName}. With expertise in ${keySkills.join(', ')}, I am confident in my ability to contribute to your team. My background aligns well with the requirements outlined in the job description.\n\nI look forward to discussing how my experience can benefit ${companyName}.\n\nSincerely,\n${name}`,
        medium: `Dear Hiring Manager,\n\nI am writing to express my strong interest in ${jobRole} at ${companyName}. With a proven track record in ${keySkills.join(', ')} and a passion for delivering results, I am confident that my skills and experience make me an ideal candidate for this role.\n\nThroughout my career, I have developed expertise that directly aligns with the requirements of this position. My background has prepared me to hit the ground running and make an immediate impact.\n\nI would welcome the opportunity to discuss how my experience and skills can benefit ${companyName}. Thank you for your consideration.\n\nSincerely,\n${name}`,
        long: `Dear Hiring Manager,\n\nI am writing to express my strong interest in ${jobRole} at ${companyName}. With extensive experience in ${keySkills.join(', ')} and a demonstrated history of success, I am confident that my qualifications make me an excellent candidate for this position.\n\nThroughout my career, I have consistently delivered results by leveraging my expertise in ${keySkills.join(', ')}. My background has equipped me with the skills necessary to excel in this role and contribute to the continued success of ${companyName}.\n\nI am particularly drawn to this opportunity because it aligns with my professional goals and values. The chance to work with a team of talented professionals at a company known for innovation is truly exciting.\n\nI would welcome the opportunity to discuss how my experience and skills can contribute to the success of ${companyName}. Thank you for your time and consideration.\n\nSincerely,\n${name}`,
      },
      enthusiastic: {
        short: `Dear Hiring Team,\n\nI am absolutely thrilled to apply for ${jobRole} at ${companyName}! Your innovative work and company culture have always inspired me, and I believe my skills in ${keySkills.join(', ')} make me a perfect fit for your team.\n\nI would love the chance to bring my energy and expertise to ${companyName}. Thank you for considering my application!\n\nBest regards,\n${name}`,
        medium: `Dear Hiring Team,\n\nI am absolutely thrilled to apply for ${jobRole} at ${companyName}! When I saw this opportunity, I knew immediately that this is exactly where I want to be. Your company's mission and the work you're doing are truly inspiring.\n\nWith my background in ${keySkills.join(', ')}, I am eager to bring my passion and expertise to your team. I thrive in dynamic environments and am excited about the prospect of contributing to your continued success.\n\nI would love the opportunity to discuss how I can contribute to the amazing work happening at ${companyName}. Thank you for your consideration!\n\nBest regards,\n${name}`,
        long: `Dear Hiring Team,\n\nI am absolutely thrilled to apply for ${jobRole} at ${companyName}! From the moment I discovered this opportunity, I knew that ${companyName} is where I want to be. Your company's innovative approach and commitment to excellence resonate deeply with my professional philosophy.\n\nMy journey has been driven by a passion for ${keySkills.join(', ')}, and I am excited about the prospect of bringing my expertise to your team. I have followed ${companyName}'s work with great admiration, and the chance to contribute to your mission would be a dream come true.\n\nI am eager to bring my enthusiasm, skills, and dedication to ${companyName}. I would love the chance to discuss how I can make an impact on your team.\n\nThank you for this exciting opportunity!\n\nBest regards,\n${name}`,
      },
      professional: {
        short: `Dear Hiring Manager,\n\nI am writing to apply for ${jobRole} at ${companyName}. My background in ${keySkills.join(', ')} and my commitment to delivering high-quality work make me a strong candidate for this role.\n\nI look forward to the possibility of contributing to ${companyName}'s success.\n\nBest regards,\n${name}`,
        medium: `Dear Hiring Manager,\n\nI am writing to apply for ${jobRole} at ${companyName}. With solid experience in ${keySkills.join(', ')} and a commitment to excellence, I believe my skills and experience align well with what you are looking for.\n\nThroughout my professional journey, I have developed strong capabilities that directly relate to this role. I am confident that I can bring value to your team and contribute to the goals of ${companyName}.\n\nI would appreciate the opportunity to discuss how my background and skills can benefit your organization. Thank you for your consideration.\n\nBest regards,\n${name}`,
        long: `Dear Hiring Manager,\n\nI am writing to apply for ${jobRole} at ${companyName}. My background in ${keySkills.join(', ')}, combined with my dedication to delivering results, positions me well to contribute to your team.\n\nI have built my career around developing expertise in areas that directly align with this role. My experience has prepared me to take on challenges and deliver meaningful contributions from day one.\n\nI am excited about the opportunity to work with ${companyName} and contribute to your continued success. I would welcome a conversation about how my skills and experience can add value to your organization.\n\nThank you for your time and consideration.\n\nBest regards,\n${name}`,
      },
    };

    const toneKey = tone as keyof typeof templates;
    const lengthKey = length as keyof typeof templates.formal;

    const template =
      templates[toneKey]?.[lengthKey] ||
      templates.professional.medium;

    const content = template;
    const preview = content.substring(0, 150);

    return { content, preview };
  }

  private extractName(resumeText: string): string | null {
    if (!resumeText) return null;
    const lines = resumeText.split('\n').filter((l) => l.trim());
    return lines[0]?.trim() || null;
  }

  private extractKeywords(text: string): string[] {
    if (!text) return [];
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are',
      'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'shall', 'can', 'need', 'dare', 'ought', 'used', 'about',
    ]);
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !commonWords.has(w));
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((e) => e[0]);
  }

  private extractJobRole(description: string): string | null {
    if (!description) return null;
    const lines = description.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('position') || lower.includes('role') || lower.includes('title')) {
        return line.replace(/^(position|role|title):?\s*/i, '').trim() || null;
      }
    }
    const match = description.match(
      /(software engineer|developer|designer|manager|analyst|consultant|director|lead|architect|engineer)/i,
    );
    return match ? match[1] : null;
  }
}
