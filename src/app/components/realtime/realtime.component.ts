import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/websocket.service';
import { FintachartsService } from '../../services/instuments';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-realtime',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <h2>Live Price Stream</h2>

    <div>
      <select [(ngModel)]="selectedInstrumentId">
        <option value="">Select Instrument</option>
        <option *ngFor="let instrument of instruments" [value]="instrument.id">
          {{ instrument.symbol }}
        </option>
      </select>
      <button (click)="subscribeToInstrument()" [disabled]="!selectedInstrumentId || isSubscribed">
        Подписаться
      </button>
      <button (click)="unsubscribeFromInstrument()" [disabled]="!isSubscribed">
        Отписаться
      </button>
    </div>

    <table *ngIf="selectedData">
      <tr><th>Symbol</th><th>Price</th><th>Time</th></tr>
      <tr>
        <td>{{ selectedSymbol }}</td>
        <td>{{ selectedData.price.toFixed(2) }}</td>
        <td>{{ selectedData.time }}</td>
      </tr>
    </table>
  `
})
export class RealtimeComponent implements OnInit {

  private fintacharts = inject(FintachartsService);
  private ws = inject(WebSocketService);

  instruments: any[] = [];
  selectedInstrumentId: string = '';
  selectedSymbol: string = '';
  selectedData: { price: number; time: string } | null = null;
  isSubscribed = false;

  ngOnInit(): void {
    this.fintacharts.login().subscribe({
      next: (res) => {
        const token = res.access_token;
        this.fintacharts.token.set(token);
        this.ws.connect(token);

        this.fintacharts.getInstruments().subscribe({
          next: (res: any) => {
            this.instruments = res.data || [];
            console.log('Instruments loaded:', this.instruments);
          },
          error: (err) => console.error('Ошибка получения инструментов', err)
        });

        this.ws.getMessages().subscribe((msg) => {
          console.log('WS message:', msg);

          if (msg.type === 'l1-update' && msg.instrumentId === this.selectedInstrumentId) {
            this.selectedData = {
              price: msg.last?.price ?? msg.bid?.price ?? msg.ask?.price ?? 0,
              time: new Date().toLocaleTimeString() // ← текущая дата и время
            };
          }

          if (msg.type === 'session') {
            console.log('Session established:', msg.sessionId);
          }
        });
      },
      error: (err) => console.error('Login failed', err)
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
      kinds: ['ask', 'bid', 'last']
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
      kinds: ['ask', 'bid', 'last']
    });

    this.isSubscribed = false;
    this.selectedData = null;
    this.selectedSymbol = '';
  }
}









// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { WebSocketService } from '../services/websocket.service';
// import { FintachartsService } from '../services/instuments';
// import { HttpClientModule } from '@angular/common/http';

// @Component({
//     selector: 'app-realtime',
//     standalone: true,
//     imports: [CommonModule, HttpClientModule],
//     template: `
//     <h2>Live Price Stream</h2>
//     <pre *ngIf="data">{{ data | json }}</pre>
//   `
// })
// export class RealtimeComponent implements OnInit {
//     private fintacharts = inject(FintachartsService);
//     private ws = inject(WebSocketService);
//     data: any;

//     ngOnInit(): void {
//         this.fintacharts.login().subscribe({
//             next: (res) => {
//                 const token = res.access_token;
//                 this.fintacharts.token.set(token);
//                 this.ws.connect(token);

//                 this.ws.getMessages().subscribe((msg) => {
//                     this.data = msg;

//                     // Дождались сессии — теперь можно подписаться
//                     if (msg.type === 'session') {
//                         const instrumentId = 'ebefe2c7-5ac9-43bb-a8b7-4a97bf2c2576';

//                         this.ws.sendMessage({
//                             type: 'l1-subscription',
//                             id: '1',
//                             instrumentId,
//                             provider: 'simulation',
//                             subscribe: true,
//                             kinds: ['ask', 'bid', 'last']
//                         });
//                     }
//                 });
//             },
//             error: (err) => console.error('Login failed', err)
//         });
//     }

// }




