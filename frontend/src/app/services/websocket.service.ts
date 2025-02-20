import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import {
  Observable,
  Subject,
  timer,
  retryWhen,
  delay,
  takeUntil,
  filter,
  map,
} from 'rxjs';
import { Animal } from '../models/animal.model';
import { WeightEntry } from '../models/weight.model';

export type WebSocketMessageType =
  | 'WEIGHT_CREATED'
  | 'WEIGHT_UPDATED'
  | 'WEIGHT_DELETED'
  | 'ANIMAL_CREATED'
  | 'ANIMAL_UPDATED'
  | 'ANIMAL_DELETED'
  | 'HEARTBEAT';

interface WebSocketMessageData {
  id?: string;
  animal_id?: string;
  weight?: number;
  date?: string;
  animal?: Animal;
  created_at?: string;
  updated_at?: string;
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: WebSocketMessageData;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocketSubject<WebSocketMessage> | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private heartbeatInterval = 30000; // 30 seconds
  private destroy$ = new Subject<void>();

  constructor() {}

  public connect() {
    if (!this.socket || this.socket.closed) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available for WebSocket connection');
        return;
      }

      this.socket = webSocket<WebSocketMessage>({
        url: `${environment.wsUrl}/${token}`,
        openObserver: {
          next: () => {
            console.log('WebSocket connected');
            this.startHeartbeat();
          },
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket disconnected');
            this.socket = null;
          },
        },
      });

      this.socket
        .pipe(
          retryWhen((errors) => errors.pipe(delay(1000))),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (message) => this.messageSubject.next(message),
          error: (error) => console.error('WebSocket error:', error),
        });
    }
  }

  private startHeartbeat() {
    timer(0, this.heartbeatInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.socket && !this.socket.closed) {
          this.socket.next({ type: 'HEARTBEAT', data: {} });
        }
      });
  }

  public disconnect() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.socket) {
      this.socket.complete();
      this.socket = null;
    }
  }

  public getAnimalUpdates(): Observable<Animal> {
    return this.messageSubject.pipe(
      filter(
        (msg) => msg.type === 'ANIMAL_CREATED' || msg.type === 'ANIMAL_UPDATED'
      ),
      map((msg) => msg.data.animal as Animal)
    );
  }

  public getAnimalDeletions(): Observable<string> {
    return this.messageSubject.pipe(
      filter((msg) => msg.type === 'ANIMAL_DELETED'),
      map((msg) => msg.data.id as string)
    );
  }

  public getWeightUpdates(): Observable<WeightEntry> {
    return this.messageSubject.pipe(
      filter(
        (msg) => msg.type === 'WEIGHT_CREATED' || msg.type === 'WEIGHT_UPDATED'
      ),
      map((msg) => ({
        id: msg.data.id!,
        animal_id: msg.data.animal_id!,
        weight: msg.data.weight!,
        date: msg.data.date!,
        created_at: msg.data.created_at!,
        updated_at: msg.data.updated_at!,
      }))
    );
  }

  public getWeightDeletions(): Observable<{ id: string; animal_id: string }> {
    return this.messageSubject.pipe(
      filter((msg) => msg.type === 'WEIGHT_DELETED'),
      map((msg) => ({
        id: msg.data.id!,
        animal_id: msg.data.animal_id!,
      }))
    );
  }
}
