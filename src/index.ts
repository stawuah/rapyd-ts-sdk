// src/index.ts
import crypto from 'crypto';
import axios, { AxiosInstance } from "axios";


export class RapydClient {
    private accessKey: string;
    private secretKey: string;
    private baseURL: string;
    private client: AxiosInstance;

    constructor(accessKey: string, secretKey: string, baseURL = 'https://api.rapyd.net') {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.baseURL = baseURL;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Add request interceptor for signing requests
        this.client.interceptors.request.use(this.signRequest.bind(this));
    }

    private generateSalt(length: number = 8): string {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }

    private signRequest(config: any) {
        const salt = this.generateSalt();
        const timestamp = Math.floor(Date.now() / 1000);
        const httpMethod = config.method?.toUpperCase() || 'GET';
        const path = config.url?.replace(this.baseURL, '') || '';
        const body = config.data ? JSON.stringify(config.data) : '';

        const toSign = httpMethod + path + salt + timestamp + this.accessKey + this.secretKey + body;
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(toSign)
            .digest('hex');

        config.headers['access_key'] = this.accessKey;
        config.headers['salt'] = salt;
        config.headers['timestamp'] = timestamp;
        config.headers['signature'] = signature;

        return config;
    }

    // Payment Methods
    public async listPaymentMethods(country: string, currency: string) {
        return this.client.get(`/v1/payment_methods/country?country=${country}&currency=${currency}`);
    }

    public async createPayment(data: PaymentRequest) {
        return this.client.post('/v1/payments', data);
    }

    // Wallets
    public async createWallet(data: WalletRequest) {
        return this.client.post('/v1/user/wallets', data);
    }

    public async getWalletBalance(walletId: string) {
        return this.client.get(`/v1/user/wallets/${walletId}`);
    }

    // Payouts
    public async createPayout(data: PayoutRequest) {
        return this.client.post('/v1/payouts', data);
    }

    // Virtual Accounts
    public async createVirtualAccount(data: VirtualAccountRequest) {
        return this.client.post('/v1/virtual_accounts', data);
    }
}

// Types
export interface PaymentRequest {
    amount: number;
    currency: string;
    payment_method: string;
    // Add other payment fields
}

export interface WalletRequest {
    first_name: string;
    last_name: string;
    email: string;
    ewallet_reference_id: string;
    // Add other wallet fields
}

export interface PayoutRequest {
    beneficiary: string;
    payout_method_type: string;
    amount: number;
    currency: string;
    // Add other payout fields
}

export interface VirtualAccountRequest {
    country: string;
    currency: string;
    description: string;
    // Add other virtual account fields
}