import { Component, inject, computed, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { InstrumentsService } from '../../services/instruments.service';
import { WebSocketService } from '../../services/websocket.service';
import { Instrument, InstrumentsResponse } from '../../model/instruments.model';

@Component({
  selector: 'app-realtime',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './realtime.component.html',
  styleUrl: './realtime.component.scss',
})
export class RealtimeComponent {
  private auth = inject(AuthService);
  private instrumentsService = inject(InstrumentsService);
  private ws = inject(WebSocketService);

  instruments = signal<Instrument[]>([]);
  selectedData = signal<{ price: number; time: string } | null>(null);
  selectedSymbol = signal<string>('');
  isSubscribed = signal<boolean>(false);

  form = new FormGroup({
    instrumentId: new FormControl<string>(''),
  });

  selectedInstrumentId = computed(() => this.form.get('instrumentId')?.value || '');

  constructor() {
    this.auth.login().subscribe({
      next: (res) => {
        const token = res.access_token;
        this.auth.setToken(token);
        this.ws.connect(token);

        this.loadInstruments();
        this.listenToWebSocket();
      },
      error: (err) => console.error('Login failed', err),
    });
  }

  private loadInstruments(): void {
    this.instrumentsService.getInstruments().subscribe({
      next: (res: InstrumentsResponse) => {
        this.instruments.set(res.data || []);
        console.log('Instruments loaded:', res.data);
      },
      error: (err) => console.error('Ошибка получения инструментов', err),
    });
  }

  private listenToWebSocket(): void {
    this.ws.getMessages().subscribe((msg) => {
      console.log('WS message:', msg);

      if (msg.type === 'l1-update' && msg.instrumentId === this.selectedInstrumentId()) {
        this.selectedData.set({
          price: msg.last?.price ?? msg.bid?.price ?? msg.ask?.price ?? 0,
          time: new Date().toLocaleTimeString(),
        });
      }

      if (msg.type === 'session') {
        console.log('Session established:', msg.sessionId);
      }
    });
  }

  subscribeToInstrument(): void {
    const instrument = this.instruments().find((i: Instrument) => i.id === this.selectedInstrumentId());
    if (!instrument) return;

    this.selectedSymbol.set(instrument.symbol);

    this.ws.sendMessage({
      type: 'l1-subscription',
      id: instrument.id,
      instrumentId: instrument.id,
      provider: instrument.provider || 'oanda',
      subscribe: true,
      kinds: ['ask', 'bid', 'last'],
    });

    this.isSubscribed.set(true);
  }

  unsubscribeFromInstrument(): void {
    const id = this.selectedInstrumentId();
    if (!this.isSubscribed() || !id) return;

    this.ws.sendMessage({
      type: 'l1-subscription',
      id,
      instrumentId: id,
      provider: 'oanda',
      subscribe: false,
      kinds: ['ask', 'bid', 'last'],
    });

    this.isSubscribed.set(false);
    this.selectedData.set(null);
    this.selectedSymbol.set('');
  }
}