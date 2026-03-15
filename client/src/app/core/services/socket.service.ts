import { Injectable, inject, OnDestroy, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface SocketMessage {
  id: string;
  content: string;
  contentHtml: string | null;
  isInternal: boolean;
  authorType: 'agent' | 'customer' | 'system';
  createdAt: string;
  ticketId: string;
  userId: string | null;
  customerId: string | null;
  user: { id: string; firstName: string; lastName: string; avatar: string | null } | null;
  customer: { id: string; name: string; avatar: string | null } | null;
}

export interface TypingEvent {
  userId: string;
  isTyping: boolean;
}

export interface SocketNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private authService = inject(AuthService);
  private socket: Socket | null = null;
  private currentRoom: string | null = null;
  private pendingTicket: number | null = null;

  connected = signal(false);

  // Observable streams for components to subscribe to
  private messageSubject = new Subject<SocketMessage>();
  private typingSubject = new Subject<TypingEvent>();
  private notificationSubject = new Subject<SocketNotification>();

  message$ = this.messageSubject.asObservable();
  typing$ = this.typingSubject.asObservable();
  notification$ = this.notificationSubject.asObservable();

  connect(): void {
    // Don't re-create if socket already exists (connecting or connected)
    if (this.socket) {
      console.log('[SocketService] connect() skipped — socket already exists, connected:', this.socket.connected);
      return;
    }

    const token = this.authService.token();
    if (!token) {
      console.warn('[SocketService] connect() skipped — no auth token');
      return;
    }

    const wsUrl = environment.wsUrl || window.location.origin;
    console.log('[SocketService] Connecting to', wsUrl);
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected! Socket ID:', this.socket?.id);
      this.connected.set(true);
      // Re-join room on connect/reconnect (server-side rooms are lost on reconnect)
      if (this.pendingTicket !== null) {
        this.socket?.emit('ticket:join', this.pendingTicket);
      }
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[SocketService] Connection error:', err.message);
    });

    this.socket.on('message:new', (message: SocketMessage) => {
      this.messageSubject.next(message);
    });

    this.socket.on('ticket:typing', (event: TypingEvent) => {
      this.typingSubject.next(event);
    });

    this.socket.on('notification:new', (notification: SocketNotification) => {
      console.log('[SocketService] notification:new event', notification);
      this.notificationSubject.next(notification);
    });
  }

  disconnect(): void {
    if (this.currentRoom) {
      this.leaveTicket(parseInt(this.currentRoom.replace('ticket:', ''), 10));
    }
    this.socket?.disconnect();
    this.socket = null;
    this.pendingTicket = null;
    this.connected.set(false);
  }

  joinTicket(ticketNumber: number): void {
    const room = `ticket:${ticketNumber}`;
    if (this.currentRoom === room && this.socket?.connected) return;

    // Leave previous room
    if (this.currentRoom && this.currentRoom !== room) {
      this.socket?.emit('ticket:leave', this.currentRoom.replace('ticket:', ''));
    }

    this.currentRoom = room;
    this.pendingTicket = ticketNumber;

    // Emit join immediately if connected; otherwise the connect handler will do it
    if (this.socket?.connected) {
      this.socket.emit('ticket:join', ticketNumber);
    }
  }

  leaveTicket(ticketNumber: number): void {
    this.socket?.emit('ticket:leave', ticketNumber);
    this.currentRoom = null;
    this.pendingTicket = null;
  }

  emitTyping(ticketNumber: number, isTyping: boolean): void {
    this.socket?.emit('ticket:typing', { ticketNumber, isTyping });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
