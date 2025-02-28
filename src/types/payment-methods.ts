export interface FieldValidation {
    type: string;
    regex?: string;
    min_length?: number;
    max_length?: number;
    validations?: string[];
}

export interface RequiredField {
    name: string;
    type: string;
    regex?: string;
    is_required: boolean;
    instructions?: string;
    description?: string;
    validation?: FieldValidation;
    error_messages?: Record<string, string>;
    required_fields?: RequiredField[];  // Added for nested required fields
    is_updatable?: boolean;             // Added to match API response
}

export interface PaymentMethodRequiredField extends RequiredField {
    is_updatable: boolean;
}

export interface PaymentMethodOption {
    name: string;
    type: string;
    regex: string;
    description: string;
    is_required: boolean;
    is_updatable: boolean;
    required_fields?: PaymentMethodRequiredField[];
}

export interface AmountRangePerCurrency {
    currency: string;
    maximum_amount: number | null;
    minimum_amount: number | null;
}

export interface PaymentMethod {
    type: string;
    name: string;
    category: string;
    image: string;
    country: string;
    payment_flow_type: string;
    currencies: string[];
    status: number;
    is_cancelable: boolean;
    payment_options: PaymentMethodOption[];
    is_expirable: boolean;
    is_online: boolean;
    is_refundable: boolean;
    minimum_expiration_seconds: number;
    maximum_expiration_seconds: number;
    virtual_payment_method_type: string | null;
    is_virtual: boolean;
    multiple_overage_allowed: boolean;
    amount_range_per_currency: AmountRangePerCurrency[];
    is_tokenizable: boolean;
    supported_digital_wallet_providers: string[];
    is_restricted: boolean;
    supports_subscription: boolean;
    supports_installments?: boolean;
}

export interface PaymentMethodByCountryResponse {
    country: string;
    payment_methods: PaymentMethod[];
}

export interface PaymentMethodFieldsResponse {
    status: {
        error_code: string;
        status: string;
        message: string;
        response_code?: string;
        operation_id?: string;
    };
    data: {
        type: string;
        fields: RequiredField[];
        payment_method_options: RequiredField[];
        payment_options: RequiredField[];
        minimum_expiration_seconds?: number;
        maximum_expiration_seconds?: number;
    };
}

export interface PaymentMethodsResponse {
    status: {
        error_code: string;
        status: string;
        message: string;
        response_code?: string;
        operation_id?: string;
    };
    data: PaymentMethod[];
}4

export interface PaymentMethodQueryParams {
    country: string;
    currency: string;
    amount?: number;
    category?: string;
    complete?: boolean;
}