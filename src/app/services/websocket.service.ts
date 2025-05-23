import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket$?: WebSocketSubject<any>;
    private messages$ = new Subject<any>();

    connect(token: string): void {
        const url = `wss://platform.fintacharts.com/api/streaming/ws/v1/realtime?token=${token}`;

        this.socket$ = webSocket({
            url,
            deserializer: msg => JSON.parse(msg.data),
            openObserver: { next: () => console.log('[WebSocket] Connected') },
            closeObserver: { next: () => console.log('[WebSocket] Disconnected') },
        });

        this.socket$.subscribe({
            next: (msg) => this.messages$.next(msg),
            error: (err) => console.error('[WebSocket] Error:', err),
            complete: () => console.log('[WebSocket] Completed'),
        });
    }

    sendMessage(message: any): void {
        this.socket$?.next(message);
    }

    getMessages(): Observable<any> {
        return this.messages$.asObservable();
    }

    disconnect(): void {
        this.socket$?.complete();
        this.socket$ = undefined;
    }
}
