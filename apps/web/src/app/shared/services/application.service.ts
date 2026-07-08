import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JobApplication } from '../models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  readonly #http = inject(HttpClient);

  readonly applications = signal<JobApplication[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchApplications(filters?: { status?: string; companyId?: string; search?: string }): void {
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.companyId) params = params.set('companyId', filters.companyId);
    if (filters?.search) params = params.set('search', filters.search);

    this.#http.get<JobApplication[]>('/api/applications', { params }).subscribe({
      next: (data) => {
        this.applications.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getAll(filters?: { status?: string; companyId?: string; search?: string }): Observable<JobApplication[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.companyId) params = params.set('companyId', filters.companyId);
    if (filters?.search) params = params.set('search', filters.search);
    return this.#http.get<JobApplication[]>('/api/applications', { params });
  }

  getById(id: string): Observable<JobApplication> {
    return this.#http.get<JobApplication>(`/api/applications/${id}`);
  }

  create(data: Partial<JobApplication>): Observable<JobApplication> {
    return this.#http.post<JobApplication>('/api/applications', data).pipe(
      tap((app) => this.applications.update((list) => [...list, app]))
    );
  }

  update(id: string, data: Partial<JobApplication>): Observable<JobApplication> {
    return this.#http.patch<JobApplication>(`/api/applications/${id}`, data).pipe(
      tap((updated) =>
        this.applications.update((list) => list.map((a) => (a.id === id ? updated : a)))
      )
    );
  }

  updateStatus(id: string, status: string): Observable<JobApplication> {
    return this.#http.patch<JobApplication>(`/api/applications/${id}/status`, { status }).pipe(
      tap((updated) =>
        this.applications.update((list) => list.map((a) => (a.id === id ? updated : a)))
      )
    );
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`/api/applications/${id}`).pipe(
      tap(() => this.applications.update((list) => list.filter((a) => a.id !== id)))
    );
  }
}
