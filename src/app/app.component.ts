import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealtimeComponent } from "./components/realtime/realtime.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RealtimeComponent],
  templateUrl: `./app.component.html`,
  styleUrl: `./app.component.scss`,
})
export class AppComponent { }