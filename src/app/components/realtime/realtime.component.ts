import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { InstrumentsService } from '../../services/instruments.service';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-realtime',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: `./realtime.component.html`,
  styleUrl: './realtime.component.scss',
})
export class RealtimeComponent implements OnInit {
  private auth = inject(AuthService);
  private instrumentsService = inject(InstrumentsService);
  private ws = inject(WebSocketService);

  instruments: any[] = [];
  selectedInstrumentId: string = '';
  selectedSymbol: string = '';
  selectedData: { price: number; time: string } | null = null;
  isSubscribed = false;

  ngOnInit(): void {
    this.auth.login().subscribe({
      next: (res) => {
        const token = res.access_token;
        this.auth.setToken(token);
        this.ws.connect(token);

        this.instrumentsService.getInstruments().subscribe({
          next: (res: any) => {
            this.instruments = res.data || [];
            console.log('Instruments loaded:', this.instruments);
          },
          error: (err) => console.error('Ошибка получения инструментов', err),
        });

        this.ws.getMessages().subscribe((msg) => {
          console.log('WS message:', msg);

          if (msg.type === 'l1-update' && msg.instrumentId === this.selectedInstrumentId) {
            this.selectedData = {
              price: msg.last?.price ?? msg.bid?.price ?? msg.ask?.price ?? 0,
              time: new Date().toLocaleTimeString(),
            };
          }

          if (msg.type === 'session') {
            console.log('Session established:', msg.sessionId);
          }
        });
      },
      error: (err) => console.error('Login failed', err),
    });
  }

  subscribeToInstrument() {
    const instrument = this.instruments.find(i => i.id === this.selectedInstrumentId);
    if (!instrument) return;

    this.selectedSymbol = instrument.symbol;

    this.ws.sendMessage({
      type: 'l1-subscription',
      id: instrument.id,
      instrumentId: instrument.id,
      provider: instrument.provider || 'oanda',
      subscribe: true,
      kinds: ['ask', 'bid', 'last'],
    });

    this.isSubscribed = true;
  }

  unsubscribeFromInstrument() {
    if (!this.isSubscribed || !this.selectedInstrumentId) return;

    this.ws.sendMessage({
      type: 'l1-subscription',
      id: this.selectedInstrumentId,
      instrumentId: this.selectedInstrumentId,
      provider: 'oanda',
      subscribe: false,
      kinds: ['ask', 'bid', 'last'],
    });

    this.isSubscribed = false;
    this.selectedData = null;
    this.selectedSymbol = '';
  }
}
