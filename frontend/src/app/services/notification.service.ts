import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  constructor() {}

  show(notification: Notification) {
    this.notificationSubject.next(notification);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hide();
    }, 5000);
  }

  hide() {
    this.notificationSubject.next(null);
  }

  showSuccess(message: string) {
    this.show({ type: 'success', message });
  }

  showError(message: string) {
    this.show({ type: 'error', message });
  }

  showInfo(message: string) {
    this.show({ type: 'info', message });
  }
}
