import { RapydClient } from '../index';
import { PaymentMethodFieldsResponse, PaymentMethodByCountryResponse, PaymentMethod, PaymentMethodsResponse,RequiredField } from '../types/payment-methods';

export class PaymentMethodsService extends RapydClient {
    /**
     * Fetches required fields for a payment method type.
     * @param {string} paymentMethodType - The type of payment method.
     * @returns {Promise<PaymentMethodFieldsResponse>} - Required fields response.
     */
    public async getPaymentMethodRequiredFields(
        paymentMethodType: string
    ): Promise<PaymentMethodFieldsResponse> {
        try {
            const response = await this.client.get(
                `/v1/payment_methods/required_fields/${paymentMethodType}/required_fields`
            );

            if (!response.data?.data?.fields) {
                throw new Error('Invalid response format from Rapyd API');
            }

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData = error.response.data;
                throw new Error(
                    `Rapyd API Error: ${errorData.status?.error_code} - ${errorData.status?.message}`
                );
            }
            throw new Error(`Error fetching required fields: ${error.message}`);
        }
    }

    /**
     * Retrieves categorized required and optional fields for a payment method.
     * @param {string} paymentMethodType - The type of payment method.
     * @returns {Promise<{ requiredFields: RequiredField[], optionalFields: RequiredField[], paymentOptions: RequiredField[], expirationLimits?: { min: number, max: number | null } }>}
     */
    public async getFieldRequirements(
        paymentMethodType: string
    ): Promise<{
        requiredFields: RequiredField[];
        optionalFields: RequiredField[];
        paymentOptions: RequiredField[];
        expirationLimits?: { min: number; max: number | null };
    }> {
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
            console.error(`[PaymentMethodsService] Error fetching payment methods: ${this.formatError(error)}`);
            return { country: countryCode, payment_methods: [] }; // Return empty array to handle gracefully
        }
    }


















    /**
     * Formats error messages from Rapyd API or generic request failures.
     * @param {any} error - Error object
     * @returns {string} - Formatted error message
     */
    private formatError(error: any): string {
        return error.response
            ? `Rapyd API Error: ${error.response.data.status?.error_code} - ${error.response.data.status?.message}`
            : `Unexpected error: ${error.message}`;
    }
}