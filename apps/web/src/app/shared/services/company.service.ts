import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Company } from '../models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  readonly #http = inject(HttpClient);

  readonly companies = signal<Company[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchCompanies(search?: string, sort?: string): void {
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (sort) params = params.set('sort', sort);

    this.#http.get<Company[]>('/api/companies', { params }).subscribe({
      next: (data) => {
        this.companies.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getAll(search?: string, sort?: string): Observable<Company[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (sort) params = params.set('sort', sort);
    return this.#http.get<Company[]>('/api/companies', { params });
  }

  getById(id: string): Observable<Company> {
    return this.#http.get<Company>(`/api/companies/${id}`);
  }

  create(data: Partial<Company>): Observable<Company> {
    return this.#http.post<Company>('/api/companies', data).pipe(
      tap((company) => this.companies.update((list) => [...list, company]))
    );
  }

  update(id: string, data: Partial<Company>): Observable<Company> {
    return this.#http.patch<Company>(`/api/companies/${id}`, data).pipe(
      tap((updated) =>
        this.companies.update((list) => list.map((c) => (c.id === id ? updated : c)))
      )
    );
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`/api/companies/${id}`).pipe(
      tap(() => this.companies.update((list) => list.filter((c) => c.id !== id)))
    );
  }
}
