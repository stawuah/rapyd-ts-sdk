import crypto from 'crypto';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { PaymentMethodsService, PaymentService } from './services';
import {Address, CreatePaymentRequest, UpdatePaymentRequest, RapydPaymentResponse as RapydPaymentResponse , RapydCapturePaymentResponse, CapturePaymentOptions, RapydLocalTransferPaymentResponse, RapydEWalletPaymentResponse, RapydCashPaymentResponse, ListPaymentsRequest, ListPaymentsResponse, ListPaymentGroupsRequest, ListPaymentGroupsResponse, ListWalletPaymentsRequest, ListWalletPaymentsResponse} from './types/payment';


export class RapydClient {
    protected accessKey: string;
    protected secretKey: string;
    protected baseURL: string;
    protected client: AxiosInstance;

    private payments: PaymentMethodsService;
    private payment: PaymentService;

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

        this.client.interceptors.request.use(this.signRequest.bind(this));

        // Initialize services
        this.payments = new PaymentMethodsService(accessKey, secretKey, baseURL);
        this.payment = new PaymentService(accessKey, secretKey, baseURL);
    }

    protected generateSalt(length: number = 8): string {
        return crypto.randomBytes(length).toString('hex').slice(0, length);
    }

    protected signRequest(config: InternalAxiosRequestConfig) {
        const salt = this.generateSalt();
        const timestamp = Math.floor(Date.now() / 1000);
        const httpMethod = config.method?.toUpperCase() || 'GET';
        const urlPath = new URL(config.url!, this.baseURL).pathname;
        const body = config.data ? JSON.stringify(config.data) : '';

        const toSign = `${httpMethod}${urlPath}${salt}${timestamp}${this.accessKey}${body}`;
        const signature = crypto.createHmac('sha256', this.secretKey).update(toSign).digest('hex');

        config.headers['access_key'] = this.accessKey;
        config.headers['salt'] = salt;
        config.headers['timestamp'] = timestamp;
        config.headers['signature'] = signature;

        return config;
    }

    // Getter methods for services
    // Payment Methods
    public getFieldRequirements(paymentMethodType: string) {
        return this.payments.getFieldRequirements(paymentMethodType);
    }

    public getPaymentMethodsByCountry(countryCode: string) {
        return this.payments.getPaymentMethodsByCountry(countryCode);
    }
    
    // Payments 
    public createPayment(data: CreatePaymentRequest) {
        return this.payment.createPayment(data);
    }

    public updatePayment(paymentId: string, data: UpdatePaymentRequest): Promise<RapydPaymentResponse> {
        return this.payment.updatePayment(paymentId, data );
    }

    public cancelEscrow(paymentId: string): Promise<RapydPaymentResponse> {
        return this.payment.cancelEscrow(paymentId);
    }

    public updatePaymentAddress(paymentId: string, address : Address): Promise<RapydPaymentResponse> {
        return this.payment.updatePaymentAddress(paymentId, address);
    }

    public updatePaymentMetadata(paymentId: string, metadata :  Record<string, any>): Promise<RapydPaymentResponse> {
        return this.payment.updatePaymentMetadata(paymentId, metadata);
    }

    public captureFullPayment(paymentId: string): Promise<RapydCapturePaymentResponse> {
        return this.payment.captureFullPayment(paymentId);
    }

    public capturePartialPayment(paymentId: string, optionalFields: CapturePaymentOptions): Promise<RapydCapturePaymentResponse> {
        return this.payment.capturePartialPayment(paymentId, optionalFields);
    }

    public completePayment(paymentId: string, additionalParams?: { param1?: string; param2?: string }): Promise<RapydPaymentResponse> {
        return this.payment.completePayment(paymentId , additionalParams);
    }

    public async completeBankTransferPayment(paymentToken: string, bankTransferId : string, amount : string): Promise<RapydLocalTransferPaymentResponse> {
        return this.payment.completeBankTransferPayment(paymentToken, bankTransferId, amount);
    }

    public async completeEWalletPayment(paymentToken: string): Promise<RapydEWalletPaymentResponse> {
        return this.payment.completeEWalletPayment(paymentToken);
    }
    

    public async completeCashPayment(paymentToken: string): Promise<RapydCashPaymentResponse> {
        return this.payment.completeCashPayment(paymentToken);
    }

    public async listPayments(options: ListPaymentsRequest): Promise<ListPaymentsResponse> {
        return this.payment.listPayments(options);
    }

    public async listPaymentGroups(options: ListPaymentGroupsRequest): Promise<ListPaymentGroupsResponse> {
        return this.payment.listPaymentGroups(options);
    }

    public async listWalletPaymentsById(options: ListWalletPaymentsRequest): Promise<ListWalletPaymentsResponse> {
        return this.payment.listWalletPaymentsById(options);
    }
}




// public createPayment = this.payments.createPayment.bind(this.payments);
    // public createWallet = this.wallets.createWallet.bind(this.wallets);
    // public getWalletBalance = this.wallets.getWalletBalance.bind(this.wallets);
    // public createPayout = this.payouts.createPayout.bind(this.payouts);
    // public createVirtualAccount = this.virtualAccounts.createVirtualAccount.bind(this.virtualAccounts);
    // Payment Methods
    // public async listPaymentMethods(country: string, currency: string) {
    //     return this.client.get(`/v1/payment_methods/country?country=${country}&currency=${currency}`);
    // }

    // public async createPayment(data: PaymentRequest) {
    //     return this.client.post('/v1/payments', data);
    // }

    // // Wallets
    // public async createWallet(data: WalletRequest) {
    //     return this.client.post('/v1/user/wallets', data);
    // }

    // public async getWalletBalance(walletId: string) {
    //     return this.client.get(`/v1/user/wallets/${walletId}`);
    // }

    // // Payouts
    // public async createPayout(data: PayoutRequest) {
    //     return this.client.post('/v1/payouts', data);
    // }

    // // Virtual Accounts
    // public async createVirtualAccount(data: VirtualAccountRequest) {
    //     return this.client.post('/v1/virtual_accounts', data);
    // }