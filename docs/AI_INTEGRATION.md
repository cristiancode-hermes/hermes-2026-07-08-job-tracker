# AI Integration — Hermes Job Tracker

## AI Ladder Rung: 1–2

This build implements:
- **Rung 1:** Single LLM call for AI match analysis (or local fallback)
- **Rung 2:** Structured cover letter generation with tone/length options

## Strategy Pattern

Both AI features use the Strategy Pattern:

### AI Analysis

```typescript
interface AIStrategy {
  analyze(applicationId: string, resumeText: string, jobDescription: string): Promise<AnalysisResult>;
}

class OpenAIStrategy implements AIStrategy {
  async analyze(applicationId, resumeText, jobDescription) {
    // Calls OpenAI API with structured prompt
    // Returns JSON with matchScore, strengths[], gaps[], suggestions[]
  }
}

class LocalFallbackStrategy implements AIStrategy {
  async analyze(applicationId, resumeText, jobDescription) {
    // Heuristic keyword matching
    // Extracts words from both, finds overlap, computes score
    // Identifies unique skills in job description (gaps)
    // Returns same structure as OpenAI
  }
}
```

### Cover Letter Generation

```typescript
interface CoverLetterStrategy {
  generate(applicationId: string, tone: string, length: string, resumeText: string, jobDescription: string, companyName: string): Promise<string>;
}

class OpenAICoverLetterStrategy implements CoverLetterStrategy {
  // Calls OpenAI with structured prompt including tone/length context
}

class TemplateStrategy implements CoverLetterStrategy {
  // Uses predefined templates with variable substitution
  // 3 tones × 3 lengths = 9 template variations
  // Substitutes {{company}}, {{position}}, {{resume_highlights}}
}
```

## Selection Logic

```typescript
// In AnalysisService constructor / onModuleInit
this.strategy = process.env.OPENAI_API_KEY
  ? new OpenAIStrategy()
  : new LocalFallbackStrategy();
```

## Failure Modes

| Failure | Behavior |
|---------|----------|
| OpenAI API key missing | Local fallback used automatically |
| OpenAI API timeout/error | Local fallback used as fallback |
| Empty resume text | Returns error message: "Please provide resume text" |
| Empty job description | Returns analysis based on resume only |
| Rate limiting | Falls back to local after 3 retries (not implemented yet) |

## Cost Notes

- Local fallback: $0 (heuristic matching)
- OpenAI API: ~$0.01–0.03 per analysis (GPT-4o-mini)
- OpenAI API: ~$0.02–0.05 per cover letter (GPT-4o-mini)

## Future Improvements

- [ ] Rung 3: Embeddings + semantic search via pgvector on Neon
- [ ] Rung 4: Full RAG pipeline (ingest → chunk → embed → retrieve → answer)
- [ ] Rung 5: Tool-using agent for multi-step analysis
- [ ] Prompt caching for repeated analyses
