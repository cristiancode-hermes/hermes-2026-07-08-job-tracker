import { Injectable, signal, inject, NgZone, OnDestroy } from '@angular/core';
import { SseEvent } from '../models';

@Injectable({ providedIn: 'root' })
export class SseService implements OnDestroy {
  #eventSource: EventSource | null = null;
  readonly #zone = inject(NgZone);

  readonly lastEvent = signal<SseEvent | null>(null);

  connect(url: string = '/api/events'): void {
    this.disconnect();
    this.#zone.runOutsideAngular(() => {
      this.#eventSource = new EventSource(url);
      this.#eventSource.onmessage = (event) => {
        this.#zone.run(() => {
          try {
            const data = JSON.parse(event.data);
            this.lastEvent.set({ type: event.type || 'message', data });
          } catch {
            this.lastEvent.set({ type: event.type || 'message', data: event.data });
          }
        });
      };
      this.#eventSource.onerror = () => {
        this.#zone.run(() => {
          this.lastEvent.set({ type: 'error', data: 'SSE connection error' });
        });
      };
    });
  }

  disconnect(): void {
    this.#eventSource?.close();
    this.#eventSource = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
