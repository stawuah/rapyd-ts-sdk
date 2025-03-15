import crypto from 'crypto';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { PaymentMethodsService, PaymentService } from './services';
import {
    Address, CreatePaymentRequest, UpdatePaymentRequest, RapydPaymentResponse, 
    RapydCapturePaymentResponse, CapturePaymentOptions, RapydLocalTransferPaymentResponse, RapydEWalletPaymentResponse,
    RapydCashPaymentResponse, ListPaymentsRequest, ListPaymentsResponse, ListPaymentGroupsRequest, ListPaymentGroupsResponse, 
    ListWalletPaymentsRequest, ListWalletPaymentsResponse
} from './types/payment';
import { HmacKeyManager, getActiveHmacKey } from './utils/hmac-key-manager';

export class RapydClient {
    protected accessKey: string;
    protected secretKey: string;
    protected baseURL?: string;
    protected client: AxiosInstance;
    protected keyManager: HmacKeyManager;


    private payments: PaymentMethodsService;
    private payment: PaymentService;
    private initialized: boolean = false;

    constructor(accessKey: string, secretKey: string, baseURL = 'https://api.rapyd.net') {
        this.accessKey = accessKey;
        this.secretKey = secretKey; // Initialize with provided secret key
        this.baseURL = baseURL;
        this.keyManager = HmacKeyManager.getInstance();

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        this.client.interceptors.request.use(async (config) => {
            // Ensure we have initialized the key manager
            if (!this.initialized) {
                await this.initializeKeyManager();
            }
            return this.signRequest(config);
        });


        // Initialize services with temporary keys
        // They will be updated after key manager initialization
        this.payments = new PaymentMethodsService(accessKey, secretKey, baseURL);
        this.payment = new PaymentService(accessKey, secretKey, baseURL);
        
        // Initialize key manager asynchronously
        this.initializeKeyManager();
    }

    private async initializeKeyManager(): Promise<void> {
        try {
            // Get the active key for this client instance
            const hmacKey = await getActiveHmacKey(this.accessKey);
            this.secretKey = hmacKey;
            
            // Update service instances with the managed key
            this.payments = new PaymentMethodsService(this.accessKey, this.secretKey, this.baseURL);
            this.payment = new PaymentService(this.accessKey, this.secretKey, this.baseURL);
            
            // Check if key rotation is due
            await this.keyManager.checkAndRotateIfDue(this.accessKey, 90);
            
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize HMAC key manager:', error);
            // Continue with the provided secret key as fallback implementation this
        }
    }

    protected generateSalt(length: number = 8): string {
        return crypto.randomBytes(length).toString('hex').slice(0, length);
    }

    protected signRequest(config: InternalAxiosRequestConfig) {

        const salt = this.generateSalt();
        const timestamp = Math.floor(Date.now() / 1000);
        const httpMethod = config.method?.toUpperCase() || 'GET';
        const requestPath = new URL(config.url!, this.baseURL).pathname;
        const body = config.data ? JSON.stringify(config.data) : '';

        const toSign = `${httpMethod}${requestPath}${salt}${timestamp}${this.accessKey}${this.secretKey}${body}`;
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