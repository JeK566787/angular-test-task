import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FintachartsService } from '../services/instuments';
import { HttpClientModule } from '@angular/common/http';
import { Instrument } from '../model/instrument.model'; // импортируем тип

@Component({
    selector: 'app-instruments',
    standalone: true,
    imports: [CommonModule, HttpClientModule],
    template: `
        <h2>Instruments</h2>

        <div *ngIf="loading()">Loading...</div>
        <div *ngIf="error()">{{ error() }}</div>

        <ul *ngIf="instruments().length">
            <li *ngFor="let item of instruments()">
                {{ item.symbol }} ({{ item.kind }} {{ item.id }})
            </li>
        </ul>
    `,
})
export class InstrumentsComponent implements OnInit {
    private api = inject(FintachartsService);

    instruments = signal<Instrument[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);

    ngOnInit() {
        this.api.login().subscribe({
            next: (res) => {
                this.api.token.set(res.access_token);

                this.api.getInstruments().subscribe({
                    next: (response) => {
                        this.instruments.set(response.data);
                        this.loading.set(false);
                    },
                    error: () => {
                        this.error.set('Ошибка загрузки инструментов');
                        this.loading.set(false);
                    },
                });
            },
            error: () => {
                this.error.set('Ошибка авторизации');
                this.loading.set(false);
            },
        });
    }
}
