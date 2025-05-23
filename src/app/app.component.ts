import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealtimeComponent } from "./components/realtime/realtime.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RealtimeComponent],
  template: `
    <div class="container">
      <!-- <h1>Fintacharts Market Price Viewer</h1>
      <realtime-price></realtime-price>
      <historical-chart></historical-chart> -->

      <app-realtime></app-realtime>
      <!-- <app-instruments></app-instruments> -->
      
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: Arial; }
  `]
})
export class AppComponent { }