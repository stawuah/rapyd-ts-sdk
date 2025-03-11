import { RapydClient } from '../index';
import { PaymentMethodFieldsResponse, PaymentMethodByCountryResponse, PaymentMethod, PaymentMethodsResponse, RequiredField } from '../types/payment-methods';
import { RapydApiError, handleApiError, formatError } from '../utils/rapyd-error'; // Import error handling module

export class PaymentMethodsService extends RapydClient {

     /**
     * Fetches the required fields for a specific payment method type.
     * Validates the response structure to ensure data integrity.
     */
    public async getPaymentMethodRequiredFields(paymentMethodType: string): Promise<PaymentMethodFieldsResponse> {
        try {
            const response = await this.client.get(`/v1/payment_methods/required_fields/${paymentMethodType}/required_fields`);

            if (!response.data?.data?.fields) {
                handleApiError({ message: 'Invalid response format' }, 'Invalid response format from Rapyd API');
            }

            return response.data;
        } catch (error: any) {
            handleApiError(error, 'Error fetching required fields');
        }
    }


     /**
     * Retrieves and categorizes field requirements for a given payment method.
     * Separates required and optional fields, extracts payment options, and checks for expiration limits.
     */
    public async getFieldRequirements(paymentMethodType: string): Promise<{
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
            if (error instanceof RapydApiError) {
                throw error;
            }
            handleApiError(error, `Error retrieving field requirements for ${paymentMethodType}`);
        }
    }
    /**
     * Fetches available payment methods for a given country.
     * Validates response structure and maps data into a structured format.
     */
    public async getPaymentMethodsByCountry(countryCode: string): Promise<PaymentMethodByCountryResponse> {
        try {
            const response = await this.client.get<PaymentMethodsResponse>(`/v1/payment_methods/countries/${countryCode}`);

            if (!response.data?.data || !Array.isArray(response.data.data)) {
                console.error(`[PaymentMethodsService] Invalid response format for country: ${countryCode}`);
                return { country: countryCode, payment_methods: [] };
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
            console.error(`[PaymentMethodsService] Error fetching payment methods: ${formatError(error)}`);
            return { country: countryCode, payment_methods: [] };
        }
    }
}
