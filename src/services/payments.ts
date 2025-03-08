import { RapydClient } from '../index';
import {CreatePaymentRequest, UpdatePaymentRequest, Address} from '../types/payment';
import { RapydApiError, handleApiError  } from '../utils/rapyd-error';

// Payment service for handling payments
export class PaymentService extends RapydClient {
    /**
     * Creates a payment to collect money into a Rapyd Wallet
     * @param {CreatePaymentRequest} paymentRequest - Payment request data
     * @returns {Promise<PaymentResponse>} - Payment response data
     * @throws {RapydApiError} - If there's an error creating the payment
     */
    public async createPayment(paymentRequest: CreatePaymentRequest): Promise<PaymentResponse> {
        try {
            const response = await this.client.post<PaymentResponse>('/v1/payments',paymentRequest);

            return response.data;
        } catch (error: any) {
            handleApiError(error, 'Error creating payment');
        }
    }


    /**
     * Updates an existing payment
     * @param paymentId The ID of the payment to update
     * @param data The payment data to update
     * @returns Promise with payment response
     */
    public async updatePayment(paymentId: string, data: UpdatePaymentRequest): Promise<PaymentResponse> {
        try {
            // based on api specifications they are using post method to update payment and it applies to all upadate payment cases or api call
            const response = await this.client.post(`/v1/payments/${paymentId}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to update payment ${paymentId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Cancels escrow for a payment
     * @param paymentId The ID of the payment to cancel escrow for
     * @returns Promise with payment response
     */
    public async cancelEscrow(paymentId: string): Promise<PaymentResponse> {
        try {
            const data: UpdatePaymentRequest = {
                escrow: false
            };
            const response = await this.client.post(`/v1/payments/${paymentId}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to cancel escrow for payment ${paymentId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Updates payment address information
     * @param paymentId The ID of the payment to update
     * @param address The updated address information
     * @returns Promise with payment response
     */
    public async updatePaymentAddress(paymentId: string, address: Address): Promise<PaymentResponse> {
        try {
            const data: UpdatePaymentRequest = {
                address: address
            };
            const response = await this.client.post(`/v1/payments/${paymentId}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to update address for payment ${paymentId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Updates payment metadata
     * @param paymentId The ID of the payment to update
     * @param metadata The updated metadata
     * @returns Promise with payment response
     */
    public async updatePaymentMetadata(paymentId: string, metadata: Record<string, any>): Promise<PaymentResponse> {
        try {
            const data: UpdatePaymentRequest = {
                metadata: metadata

            }
            const response = await this.client.post(`/v1/payments/${paymentId}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to update metadata for payment ${paymentId}:`, error.response?.data || error.message);
            throw error;
        }

    }
}

