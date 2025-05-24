import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FintachartsService {
    private http = inject(HttpClient);

    private readonly URI = 'https://platform.fintacharts.com';
    private readonly USERNAME = 'r_test@fintatech.com';
    private readonly PASSWORD = 'kisfiz-vUnvy9-sopnyv';

    token = signal<string | null>(null);

    login() {
        const body = new HttpParams()
            .set('grant_type', 'password')
            .set('client_id', 'app-cli')
            .set('username', this.USERNAME)
            .set('password', this.PASSWORD);

        return this.http.post<{ access_token: string }>(
            `${this.URI}/identity/realms/fintatech/protocol/openid-connect/token`,
            body.toString(),
            {
                headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
            }
        );
    }

    getInstruments() {
        const token = this.token();
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
