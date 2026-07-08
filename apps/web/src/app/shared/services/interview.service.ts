import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Interview } from '../models';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  readonly #http = inject(HttpClient);

  readonly interviews = signal<Interview[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchInterviews(upcoming?: boolean, applicationId?: string): void {
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams();
    if (upcoming) params = params.set('upcoming', 'true');
    if (applicationId) params = params.set('applicationId', applicationId);

    this.#http.get<Interview[]>('/api/interviews', { params }).subscribe({
      next: (data) => {
        this.interviews.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getAll(upcoming?: boolean, applicationId?: string): Observable<Interview[]> {
    let params = new HttpParams();
    if (upcoming) params = params.set('upcoming', 'true');
    if (applicationId) params = params.set('applicationId', applicationId);
    return this.#http.get<Interview[]>('/api/interviews', { params });
  }

  getById(id: string): Observable<Interview> {
    return this.#http.get<Interview>(`/api/interviews/${id}`);
  }

  create(data: Partial<Interview>): Observable<Interview> {
    return this.#http.post<Interview>('/api/interviews', data).pipe(
      tap((interview) => this.interviews.update((list) => [...list, interview]))
    );
  }

  update(id: string, data: Partial<Interview>): Observable<Interview> {
    return this.#http.patch<Interview>(`/api/interviews/${id}`, data).pipe(
      tap((updated) =>
        this.interviews.update((list) => list.map((i) => (i.id === id ? updated : i)))
      )
    );
  }

  markComplete(id: string, feedback?: string): Observable<Interview> {
    return this.#http.patch<Interview>(`/api/interviews/${id}/complete`, { feedback }).pipe(
      tap((updated) =>
        this.interviews.update((list) => list.map((i) => (i.id === id ? updated : i)))
      )
    );
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`/api/interviews/${id}`).pipe(
      tap(() => this.interviews.update((list) => list.filter((i) => i.id !== id)))
    );
  }
}
