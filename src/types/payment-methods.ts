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
}

export interface PaymentMethodFieldsResponse {
    status: {
        error_code: string;
        status: string;
        message: string;
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

export interface PaymentMethodQueryParams {
    country: string;
    currency: string;
    amount?: number;
    category?: string;
    complete?: boolean;
}