import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserSettings } from '../models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly #http = inject(HttpClient);

  get(): Observable<UserSettings> {
    return this.#http.get<UserSettings>('/api/settings');
  }

  updateResume(resumeText: string): Observable<any> {
    return this.#http.patch('/api/settings/resume', { resumeText });
  }

  updatePreferences(theme: string): Observable<UserSettings> {
    return this.#http.patch<UserSettings>('/api/settings/preferences', { theme });
  }
}
