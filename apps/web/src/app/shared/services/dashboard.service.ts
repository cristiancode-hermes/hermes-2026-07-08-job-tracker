import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardKPI, StatusCount, Interview, ActivityItem } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly #http = inject(HttpClient);

  getKpis(): Observable<DashboardKPI> {
    return this.#http.get<DashboardKPI>('/api/dashboard/kpis');
  }

  getStatusDistribution(): Observable<StatusCount[]> {
    return this.#http.get<StatusCount[]>('/api/dashboard/status-distribution');
  }

  getUpcomingInterviews(): Observable<Interview[]> {
    return this.#http.get<Interview[]>('/api/dashboard/upcoming-interviews');
  }

  getRecentActivity(): Observable<ActivityItem[]> {
    return this.#http.get<ActivityItem[]>('/api/dashboard/recent-activity');
  }
}
