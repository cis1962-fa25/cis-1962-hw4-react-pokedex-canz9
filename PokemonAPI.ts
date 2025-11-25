import type { BoxEntry, InsertBoxEntry, Pokemon, UpdateBoxEntry } from '../types/types';

const BASE_URL = `https://hw4.cis1962.esinx.net/api/`; 

export class PokemonAPI {
    private token: string | null;

    constructor(token: string | null) {
        this.token = token;
    }

    setToken(token: string | null) {
        this.token = token;
    }

    private buildHeaders(auth: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (auth) {
            if (!this.token) {
                throw new Error('Missing authentication token');
            }
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    private async handleResponse<T>(res: Response): Promise<T> {
        if (!res.ok) {
            let message = `Request failed with status ${res.status}`;
            try {
                const data = await res.json();
                if (data && data.message) {
                    message = data.message;
                }
            } catch {
                // ignore JSON parse errors
            }
            throw new Error(message);
        }
        if (res.status === 204) {
            // no content
            // @ts-expect-error we know T is void
            return undefined;
        }
        return (await res.json()) as T;
    }

    // -------- Pokemon endpoints (no auth) --------

    async getPokemonList(limit: number, offset: number): Promise<Pokemon[]> {
        const url = `${BASE_URL}/pokemon/?limit=${limit}&offset=${offset}`;
        const res = await fetch(url);
        return this.handleResponse<Pokemon[]>(res);
    }

    async getPokemonByName(name: string): Promise<Pokemon> {
        const url = `${BASE_URL}/pokemon/${encodeURIComponent(name)}`;
        const res = await fetch(url);
        return this.handleResponse<Pokemon>(res);
    }

    // -------- Box endpoints (auth required) --------

    async getBoxIds(): Promise<string[]> {
        const res = await fetch(`${BASE_URL}/box/`, {
            headers: this.buildHeaders(true),
        });
        return this.handleResponse<string[]>(res);
    }

    async getBoxEntry(id: string): Promise<BoxEntry> {
        const res = await fetch(`${BASE_URL}/box/${id}`, {
            headers: this.buildHeaders(true),
        });
        return this.handleResponse<BoxEntry>(res);
    }

    async createBoxEntry(entry: InsertBoxEntry): Promise<BoxEntry> {
        const res = await fetch(`${BASE_URL}/box/`, {
            method: 'POST',
            headers: this.buildHeaders(true),
            body: JSON.stringify(entry),
        });
        return this.handleResponse<BoxEntry>(res);
    }

    async updateBoxEntry(id: string, entry: UpdateBoxEntry): Promise<BoxEntry> {
        const res = await fetch(`${BASE_URL}/box/${id}`, {
            method: 'PUT',
            headers: this.buildHeaders(true),
            body: JSON.stringify(entry),
        });
        return this.handleResponse<BoxEntry>(res);
    }

    async deleteBoxEntry(id: string): Promise<void> {
        const res = await fetch(`${BASE_URL}/box/${id}`, {
            method: 'DELETE',
            headers: this.buildHeaders(true),
        });
        await this.handleResponse<void>(res);
    }
}