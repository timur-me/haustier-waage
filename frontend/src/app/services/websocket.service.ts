import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable, Subject, timer, retry, share, takeUntil, filter } from 'rxjs';
import { Animal } from '../models/animal.model';
import { WeightEntry } from '../models/weight.model';

export interface WebSocketMessage {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private destroy$ = new Subject<void>();
  private messageSubject = new Subject<WebSocketMessage>();
  private reconnectTimer: any;
  private heartbeatTimer: any;
  private missedHeartbeats = 0;
  private readonly MAX_MISSED_HEARTBEATS = 3;

  constructor() {}

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const wsUrl = environment.apiUrl.replace('http', 'ws') + `/ws/${token}`;
      this.socket$ = webSocket<WebSocketMessage>({
        url: wsUrl,
        openObserver: {
          next: () => {
            console.log('WebSocket connected');
            this.startHeartbeatMonitoring();
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket disconnected');
            this.handleDisconnection();
          }
        }
      });

      this.socket$.pipe(
        retry({ count: 5, delay: 1000 }),
        takeUntil(this.destroy$),
        share()
      ).subscribe({
        next: (message) => {
          if (message.type === 'HEARTBEAT') {
            this.handleHeartbeat();
          } else {
            this.messageSubject.next(message);
          }
        },
        error: (error) => {
          console.error('WebSocket error:', error);
          this.handleDisconnection();
        },
        complete: () => {
          console.log('WebSocket connection closed');
          this.handleDisconnection();
        }
      });
    }
  }

  private startHeartbeatMonitoring(): void {
    // Reset heartbeat monitoring
    this.missedHeartbeats = 0;
    
    // Clear existing timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    // Check for heartbeats every 35 seconds (server sends every 30)
    this.heartbeatTimer = setInterval(() => {
      this.missedHeartbeats++;
      if (this.missedHeartbeats >= this.MAX_MISSED_HEARTBEATS) {
        console.log('Too many missed heartbeats, reconnecting...');
        this.handleDisconnection();
      }
    }, 35000);
  }

  private handleHeartbeat(): void {
    this.missedHeartbeats = 0;
  }

  private handleDisconnection(): void {
    // Clear heartbeat monitoring
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    // Clear existing reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Close existing connection
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    // Attempt to reconnect after 5 seconds
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, 5000);
  }

  public disconnect(): void {
    this.destroy$.next();
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }

  public getAnimalUpdates(): Observable<Animal> {
    return new Observable(observer => {
      const subscription = this.messageSubject.pipe(
        filter(message => message.type === 'ANIMAL_UPDATED' || message.type === 'ANIMAL_CREATED')
      ).subscribe(message => {
        observer.next(message.data);
      });

      return () => subscription.unsubscribe();
    });
  }

  public getAnimalDeletions(): Observable<string> {
    return new Observable(observer => {
      const subscription = this.messageSubject.pipe(
        filter(message => message.type === 'ANIMAL_DELETED')
      ).subscribe(message => {
        observer.next(message.data.id);
      });

      return () => subscription.unsubscribe();
    });
  }

  public getWeightUpdates(): Observable<WeightEntry> {
    return new Observable(observer => {
      const subscription = this.messageSubject.pipe(
        filter(message => message.type === 'WEIGHT_UPDATED' || message.type === 'WEIGHT_CREATED')
      ).subscribe(message => {
        observer.next(message.data);
      });

      return () => subscription.unsubscribe();
    });
  }

  public getWeightDeletions(): Observable<{id: string, animal_id: string}> {
    return new Observable(observer => {
      const subscription = this.messageSubject.pipe(
        filter(message => message.type === 'WEIGHT_DELETED')
      ).subscribe(message => {
        observer.next(message.data);
      });

      return () => subscription.unsubscribe();
    });
  }
} 