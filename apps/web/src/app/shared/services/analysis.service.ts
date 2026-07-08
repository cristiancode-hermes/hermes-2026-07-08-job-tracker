import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AIAnalysis } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  readonly #http = inject(HttpClient);

  analyzeMatch(applicationId: string, resumeText: string): Observable<AIAnalysis> {
    return this.#http.post<AIAnalysis>(`/api/applications/${applicationId}/analyze`, { resumeText });
  }

  getByApplication(applicationId: string): Observable<AIAnalysis[]> {
    return this.#http.get<AIAnalysis[]>(`/api/applications/${applicationId}/analyses`);
  }
}
