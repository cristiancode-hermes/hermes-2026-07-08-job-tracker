import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface SSEEvent {
  type: string;
  data: any;
}

@Injectable()
export class EventsService {
  private eventSubject = new Subject<SSEEvent>();

  get events$() {
    return this.eventSubject.asObservable();
  }

  emit(type: string, data: any) {
    this.eventSubject.next({ type, data });
  }
}
