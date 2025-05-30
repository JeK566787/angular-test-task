import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Instrument, InstrumentsResponse } from '../model/instruments.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class InstrumentsService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);

    private readonly URI = 'https://platform.fintacharts.com';

    getInstruments(): Observable<InstrumentsResponse> {
        const token = this.auth.getToken();
        if (!token) throw new Error('Not authenticated');

        return this.http.get<InstrumentsResponse>(
            `${this.URI}/api/instruments/v1/instruments?provider=oanda&kind=forex`,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${token}`,
                }),
            }
        ).pipe(
            catchError(error => {
                console.error('Error fetching instruments', error);
                throw new Error('Failed to load instruments');
            })
        );
    }
}