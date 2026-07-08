import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoverLetter } from '../models';

@Injectable({ providedIn: 'root' })
export class CoverLetterService {
  readonly #http = inject(HttpClient);

  generate(applicationId: string, tone: string, length: string): Observable<{ letter: string; preview: string }> {
    return this.#http.post<{ letter: string; preview: string }>(
      `/api/applications/${applicationId}/cover-letter/generate`,
      { tone, length }
    );
  }

  save(data: { applicationId: string; content: string; tone: string; length: string }): Observable<CoverLetter> {
    return this.#http.post<CoverLetter>(`/api/applications/${data.applicationId}/cover-letter`, data);
  }

  getByApplication(applicationId: string): Observable<CoverLetter[]> {
    return this.#http.get<CoverLetter[]>(`/api/applications/${applicationId}/cover-letters`);
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`/api/cover-letters/${id}`);
  }
}
