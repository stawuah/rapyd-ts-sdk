import { RapydClient } from '../index';
import { PaymentMethodFieldsResponse, RequiredField } from '../types/payment-methods';

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
}
