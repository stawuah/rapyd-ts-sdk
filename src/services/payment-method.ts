import { RapydClient } from '../index';
import { PaymentMethodFieldsResponse, PaymentMethodByCountryResponse, PaymentMethod, PaymentMethodsResponse, RequiredField } from '../types/payment-methods';

// Define custom error class for Rapyd API errors
export class RapydApiError extends Error {
    errorCode: string;
    statusCode?: number;

    constructor(message: string, errorCode: string, statusCode?: number) {
        super(message);
        this.name = 'RapydApiError';
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}

// Known error codes and corresponding user-friendly messages
export const PAYMENT_METHOD_ERROR_MESSAGES: Record<string, string> = {
    'ERROR_GET_PAYMENT_METHOD_TYPE': 'The payment method type was not recognized or is not available for this merchant.',
    'ERROR_PAYMENT_METHOD_EXPIRED': 'The payment method has expired. Please use a different payment method or refresh this one.',
    'ERROR_UPDATE_CARD_CVV_NOT_UPDATABLE': 'Card CVV field cannot be updated.',
    'ERROR_UPDATE_PAYMENT_METHOD': 'Failed to update payment method due to missing or incorrect field values.',
    'INVALID_CARD_EXPIRATION_DATE': 'The card expiration date is not valid. Please check the expiration month and year.',
    'INVALID_PAYMENT_METHOD': 'The payment method was not found.',
    'INVALID_PAYMENT_METHOD_TYPE': 'The payment method type was not recognized.',
    'INVALID_REQUIRED_PAYMENT_METHOD_FIELDS': 'Required fields for this payment method are missing.',
    'MISSING_PAYMENT_METHOD_REQUIRED_FIELD': 'A required field for this payment method is missing or invalid.',
    'PAYMENT_METHOD_FIELD_NOT_UPDATABLE': 'The field you are trying to update cannot be modified.',
    'UNKNOWN_PAYMENT_METHOD_FIELD': 'An unknown field was provided for this payment method.'
};

export class PaymentMethodsService extends RapydClient {
    /**
     * Fetches required fields for a payment method type.
     * @param {string} paymentMethodType - The type of payment method.
     * @returns {Promise<PaymentMethodFieldsResponse>} - Required fields response.
     * @throws {RapydApiError} - Specialized error with Rapyd error code
     */
    public async getPaymentMethodRequiredFields(
        paymentMethodType: string
    ): Promise<PaymentMethodFieldsResponse> {
        try {
            const response = await this.client.get(
                `/v1/payment_methods/required_fields/${paymentMethodType}/required_fields`
            );

            if (!response.data?.data?.fields) {
                // Instead of throwing directly, use our error handling method
                this.handleApiError(
                    { message: 'Invalid response format' },
                    'Invalid response format from Rapyd API'
                );
            }

            return response.data;
        } catch (error: any) {
            this.handleApiError(error, 'Error fetching required fields');
        }
    }

    /**
     * Retrieves categorized required and optional fields for a payment method.
     * @param {string} paymentMethodType - The type of payment method.
     * @returns {Promise<{ requiredFields: RequiredField[], optionalFields: RequiredField[], paymentOptions: RequiredField[], expirationLimits?: { min: number, max: number | null } }>}
     * @throws {RapydApiError} - Specialized error with Rapyd error code
     */
    public async getFieldRequirements(
        paymentMethodType: string
    ): Promise<{
        requiredFields: RequiredField[];
        optionalFields: RequiredField[];
        paymentOptions: RequiredField[];
        expirationLimits?: { min: number; max: number | null };
    }> {
        try {
            const response = await this.getPaymentMethodRequiredFields(paymentMethodType);
            const { data } = response;

            let expirationLimits = undefined;

            if (typeof data.minimum_expiration_seconds === 'number') {
                expirationLimits = {
                    min: data.minimum_expiration_seconds,
                    max: typeof data.maximum_expiration_seconds === 'number'
                        ? data.maximum_expiration_seconds
                        : null
                };
            }

            return {
                requiredFields: data.fields.filter(f => f.is_required),
                optionalFields: data.fields.filter(f => !f.is_required),
                paymentOptions: data.payment_options,
                ...(expirationLimits && { expirationLimits })
            };
        } catch (error: any) {
            // If it's already a RapydApiError, just rethrow it
            if (error instanceof RapydApiError) {
                throw error;
            }
            // Otherwise handle as generic error
            this.handleApiError(error, `Error retrieving field requirements for ${paymentMethodType}`);
        }
    }

    /**
     * Fetches available payment methods for a specific country.
     * @param {string} countryCode - The 2-letter country code (ISO 3166-1 alpha-2).
     * @returns {Promise<PaymentMethodByCountryResponse>} - Payment methods response.
     */
    public async getPaymentMethodsByCountry(
        countryCode: string
    ): Promise<PaymentMethodByCountryResponse> {
        try {
            const response = await this.client.get<PaymentMethodsResponse>(
                `/v1/payment_methods/countries/${countryCode}`
            );

            if (!response.data?.data || !Array.isArray(response.data.data)) {
                console.error(`[PaymentMethodsService] Invalid response format for country: ${countryCode}`);
                return { country: countryCode, payment_methods: [] }; // Return empty array instead of throwing
            }

            return {
                country: countryCode,
                payment_methods: response.data.data.map((method: PaymentMethod) => ({
                    type: method.type,
                    name: method.name,
                    category: method.category,
                    image: method.image,
                    country: method.country,
                    payment_flow_type: method.payment_flow_type,
                    currencies: method.currencies || [],
                    status: method.status,
                    is_cancelable: method.is_cancelable,
                    payment_options: method.payment_options,
                    is_expirable: method.is_expirable,
                    is_online: method.is_online,
                    is_refundable: method.is_refundable,
                    minimum_expiration_seconds: method.minimum_expiration_seconds,
                    maximum_expiration_seconds: method.maximum_expiration_seconds,
                    virtual_payment_method_type: method.virtual_payment_method_type,
                    is_virtual: method.is_virtual,
                    multiple_overage_allowed: method.multiple_overage_allowed,
                    amount_range_per_currency: method.amount_range_per_currency,
                    is_tokenizable: method.is_tokenizable,
                    supported_digital_wallet_providers: method.supported_digital_wallet_providers || [],
                    is_restricted: method.is_restricted,
                    supports_subscription: method.supports_subscription,
                    supports_installments: method.supports_installments || false,
                })),
            };
        } catch (error: any) {
            // For this method, we're not throwing errors, just returning empty result
            console.error(`[PaymentMethodsService] Error fetching payment methods: ${this.formatError(error)}`);
            return { country: countryCode, payment_methods: [] };
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
            const userMessage = PAYMENT_METHOD_ERROR_MESSAGES[errorCode] || message || 'An error occurred with the payment method';

            console.error(`[PaymentMethodsService] ${errorCode}: ${userMessage}`);
            throw new RapydApiError(userMessage, errorCode, status_code);
        }

        // For network errors or other non-API errors
        console.error(`[PaymentMethodsService] ${fallbackMessage}: ${error.message}`);
        throw new RapydApiError(
            `${fallbackMessage}: ${error.message}`,
            'CLIENT_ERROR'
        );
    }

    /**
     * Formats error messages from Rapyd API or generic request failures.
     * @param {any} error - Error object
     * @returns {string} - Formatted error message
     */
    private formatError(error: any): string {
        if (error instanceof RapydApiError) {
            return `Rapyd API Error: ${error.errorCode} - ${error.message}`;
        }

        return error.response?.data?.status
            ? `Rapyd API Error: ${error.response.data.status.error_code || ''} - ${error.response.data.status.message || 'Unknown error'}`
            : `Unexpected error: ${error.message}`;
    }
}