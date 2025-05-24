// src/app/services/auth.service.ts

import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
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
                headers: new HttpHeaders({
                    'Content-Type': 'application/x-www-form-urlencoded',
                }),
            }
        );
    }

    setToken(value: string) {
        this.token.set(value);
    }

    getToken(): string | null {
        return this.token();
    }
}
