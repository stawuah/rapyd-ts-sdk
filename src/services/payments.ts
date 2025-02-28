import { RapydClient } from '../index';
import { CreatePaymentRequest } from '../types/payment';
import { RapydApiError } from './payment-method';

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
            this.handleApiError(error, 'Error creating payment');
        }
    }

    /**
     * Handles API errors from Rapyd, extracting error codes and providing meaningful messages
     * @param {any} error - The error object from the API call
     * @param {string} fallbackMessage - Fallback message if error details can't be extracted
     * @throws {RapydApiError} - Specialized error with Rapyd error code
     */
    private handleApiError(error: any, fallbackMessage: string): never {
        if (error.response?.data?.status) {
            const { error_code, message, response_code, status_code } = error.response.data.status;

            // Use the most specific error code available
            const errorCode = response_code || error_code || 'UNKNOWN_ERROR';

            // Get user-friendly message or use the API provided message
            const userMessage = PAYMENT_ERROR_MESSAGES[errorCode] || message || 'An error occurred with the payment';

            console.error(`[PaymentService] ${errorCode}: ${userMessage}`);
            throw new RapydApiError(userMessage, errorCode, status_code);
        }

        // For network errors or other non-API errors
        console.error(`[PaymentService] ${fallbackMessage}: ${error.message}`);
        throw new RapydApiError(
            `${fallbackMessage}: ${error.message}`,
            'CLIENT_ERROR'
        );
    }
}

// Known payment error codes and corresponding user-friendly messages
export const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
    'ERROR_PAYMENT_AMOUNT_TOO_SMALL': 'The payment amount is too small to process.',
    'ERROR_PAYMENT_EXPIRED': 'The payment has expired. Please create a new payment.',
    'ERROR_PAYMENT_METHOD_REJECTED': 'The payment method was rejected. Please try a different payment method.',
    'INVALID_PAYMENT_AMOUNT': 'The payment amount is invalid.',
    'INVALID_PAYMENT_CURRENCY': 'The currency is not supported for this payment method.',
    'INVALID_PAYMENT_METHOD': 'The payment method is invalid or not found.',
    'PAYMENT_ALREADY_CAPTURED': 'This payment has already been captured.',
    'PAYMENT_ALREADY_REFUNDED': 'This payment has already been refunded.',
    'PAYMENT_CAPTURE_ERROR': 'There was an error capturing this payment.',
    'PAYMENT_METHOD_NOT_TOKENIZABLE': 'This payment method cannot be saved for future use.',
    'PAYMENT_WALLET_ERROR': 'There was an error processing the wallet for this payment.',
    'PAYMENT_3DS_FAILED': 'The 3D Secure authentication failed. Please try a different payment method.',
    'PAYMENT_DECLINED': 'The payment was declined by the payment processor.'
};