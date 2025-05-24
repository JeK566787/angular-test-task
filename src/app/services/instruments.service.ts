// src/app/services/instruments.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class InstrumentsService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);

    private readonly URI = 'https://platform.fintacharts.com';

    getInstruments() {
        const token = this.auth.getToken();
        if (!token) throw new Error('Not authenticated');

        return this.http.get<any>(
            `${this.URI}/api/instruments/v1/instruments?provider=oanda&kind=forex`,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${token}`,
                }),
            }
        );
    }
}
