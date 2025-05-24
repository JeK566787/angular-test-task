
export interface Instrument {
    id: string;
    symbol: string;
    kind: string;
    description: string;
    tickSize: number;
    currency: string;
    baseCurrency: string;
    profile: {
        name: string;
        gics: any;
    };
}

export interface InstrumentsResponse {
    paging: {
        page: number;
        pages: number;
        items: number;
    };
    data: Instrument[];
}