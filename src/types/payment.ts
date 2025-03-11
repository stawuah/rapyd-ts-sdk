// Common response structure for Rapyd API
export interface RapydResponse<T> {
    status: {
        error_code: string;
        status: string;
        message: string;
        response_code: string;
        operation_id: string;
    };
    data: T;
}

// Payment Method Data
export interface PaymentMethodData {
    id: string;
    type: string;
    category: string;
    metadata: Record<string, any>;
    image: string;
    webhook_url: string;
    supporting_documentation: string;
    next_action: string;
}



// Wallet in payment
export interface PaymentWallet {
    ewallet_id: string;
    amount: number;
    percent: number;
    refunded_amount: number;
}

// Visual codes in payment response
export interface VisualCodes {
    [key: string]: string;
}

// Textual codes in payment response
export interface TextualCodes {
    code?: string;
    [key: string]: string | undefined;
}

// Instruction step
export interface InstructionStep {
    [key: string]: string;
}

// Instruction
export interface Instruction {
    name: string;
    steps: InstructionStep[];
}

// Dispute information
export interface Dispute {
    id: string;
    status: string;
    amount: number;
    currency_code: string;
    reason: string;
    created_at: number;
    resolved_at?: number;
    [key: string]: any;
}

// Refund information
export interface Refund {
    id: string;
    amount: number;
    currency_code: string;
    status: string;
    created_at: number;
    [key: string]: any;
}

// Outcome information
export interface Outcome {
    type: string;
    network_status: string;
    reason: string;
    risk_level: string;
    risk_score: number;
    [key: string]: any;
}

// Order information
export interface Order {
    id: string;
    amount: number;
    currency_code: string;
    status: string;
    created_at: number;
    [key: string]: any;
}

// Payment Response Data
export interface PaymentData {
    id: string;
    amount: number;
    original_amount: number;
    is_partial: boolean;
    currency_code: string;
    country_code: string;
    status: string;
    description: string;
    merchant_reference_id: string;
    customer_token: string;
    payment_method: string;
    payment_method_data: PaymentMethodData;
    auth_code: string | null;
    expiration: number;
    captured: boolean;
    refunded: boolean;
    refunded_amount: number;
    receipt_email: string;
    redirect_url: string;
    complete_payment_url: string;
    error_payment_url: string;
    receipt_number: string;
    flow_type: string;
    address: Address | null;
    statement_descriptor: string;
    transaction_id: string;
    created_at: number;
    metadata: Record<string, any>;
    failure_code: string;
    failure_message: string;
    paid: boolean;
    paid_at: number;
    dispute: Dispute | null;
    refunds: Refund[] | null;
    order: Order | null;
    outcome: Outcome | null;
    visual_codes: VisualCodes;
    textual_codes: TextualCodes;
    instructions: Instruction[];
    ewallet_id: string;
    ewallets: PaymentWallet[];
    payment_method_options: Record<string, any>;
    payment_method_type: string;
    payment_method_type_category: string;
    fx_rate: number;
    merchant_requested_currency: string | null;
    merchant_requested_amount: number | null;
    fixed_side: string;
    payment_fees: Record<string, any> | null;
    invoice: string;
    escrow: any | null;
    group_payment: string;
    cancel_reason: string | null;
    initiation_type: string;
    mid: string;
    next_action: string;
    error_code: string;
    remitter_information: Record<string, any>;
    merchant_advice_code: string | null;
    merchant_advice_message: string | null;
}


// Create Payment Request Parameters
export interface CreatePaymentRequest {
    amount: number;
    currency: string;
    description?: string;
    customer?: string | Record<string, any>;
    payment_method?: string;
    payment_method_options?: Record<string, any>;
    payment_method_data?: Record<string, any>;
    capture?: boolean;
    statement_descriptor?: string;
    ewallet?: string;
    ewallets?: {
        ewallet: string;
        percentage?: number;
        amount?: number;
    }[];
    metadata?: Record<string, any>;
    address?: Address;
    receipt_email?: string;
    complete_payment_url?: string;
    error_payment_url?: string;
    fixed_side?: 'buy' | 'sell';
    requested_currency?: string;
    save_payment_method?: boolean;
    payment_fees?: Record<string, any>;
    escrow?: boolean;
    escrow_release_days?: number;
    expiration?: number;
    merchant_reference_id?: string;
    group_payment?: string;
    initiation_type?: 'customer_present' | 'installment' | 'moto' | 'recurring' | 'unscheduled';
    client_details?: Record<string, any>;
}

export interface UpdatePaymentRequest {
    receipt_email?: string;
    description?: string;
    address?: Address;
    escrow?: boolean;
    metadata?: Record<string, any>;
}

export interface Address {
    name?: string;
    line_1?: string;
    line_2?: string;
    line_3?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    phone_number?: string;
    metadata?: Record<string, any>;
    canton?: string;
    district?: string;

    // @ts-ignore
    [key: string]: any; // For additional fields
}
// Interface for capturing full or partial payment
export interface CapturePaymentOptions {
    amount?: number;
    receipt_email?: string;
    statement_descriptor?: string;
}

// Cash payment specific types
export interface CashPaymentMethodData extends PaymentMethodData {
    name: string; 
    type: string;
    category: "cash";
}

export interface CashPaymentData extends PaymentData {
    payment_method_data: CashPaymentMethodData;
    payment_method_type_category: "cash";
    textual_codes: {
      code: string; // Cash payments typically have a code for identification
    };
}
// E-Wallet payment specific types
export interface EWalletPaymentMethodData extends PaymentMethodData {
    type: string; // Will have format like "ru_qiwimobile_ewallet"
    category: "ewallet";
}

export interface EWalletPaymentData extends PaymentData {
    payment_method_data: EWalletPaymentMethodData;
    payment_method_type_category: "ewallet";
    textual_codes: {
      code?: string; // Some e-wallet payments have identification codes
    };
}

// Local Transfer payment specific types
export interface LocalTransferPaymentMethodData extends PaymentMethodData {
    type: string; // Will have format like "mx_spei_bank"
    category: "bank_transfer";
}

export interface LocalTransferPaymentData extends PaymentData {
    payment_method_data: LocalTransferPaymentMethodData;
    payment_method_type_category: "bank_transfer";
    visual_codes: {
      payCode?: string; // Bank transfers may have a payment code
    };
}


// Payment Method Data
export interface CompletePaymentRequest {
    token: string;
    param1?: string;
    param2?: string;
}

export interface CardPaymentMethodData extends PaymentMethodData {
    name: string;
    last4: string;
    acs_check: string;
    cvv_check: string;
    bin_details: {
        brand: string | null;
        bin_number: string;
    };
    expiration_year: string;
    expiration_month: string;
    fingerprint_token: string;
}
export interface ListPaymentsRequest {
    limit?: number;
    offset?: number;
    group?: boolean;
    ewallet?: string;
    // Additional filters can be added (future)
}

export interface ListPaymentGroupsRequest {
    limit?: number;
    offset?: number;
    group: boolean; // Required to be true
    // Additional filters can be added
}

export interface ListWalletPaymentsRequest {
    ewallet: string; // Required
    limit?: number;
    offset?: number;
    // Additional filters can be added
}

export interface ListPayment {
    id: string;
    amount: number;
    original_amount: number;
    is_partial: boolean;
    currency_code: string;
    country_code: string;
    status: string;
    description: string;
    merchant_reference_id: string;
    customer_token: string;
    payment_method: string;
    payment_method_data: CardPaymentMethodData;
    expiration: number;
    captured: boolean;
    refunded: boolean;
    refunded_amount: number;
    receipt_email: string;
    redirect_url: string;
    complete_payment_url: string;
    error_payment_url: string;
    receipt_number: string;
    flow_type: string;
    address: Address | null;
    statement_descriptor: string;
    transaction_id: string;
    created_at: number;
    metadata: Record<string, any>;
    failure_code: string;
    failure_message: string;
    paid: boolean;
    paid_at: number;
    dispute: Dispute | null;
    refunds: Refund[] | null;
    order: Order | null;
    outcome: Outcome | null;
    visual_codes: VisualCodes;
    textual_codes: TextualCodes;
    instructions: Instruction[] | [];
    ewallet_id: string;
    ewallets: PaymentWallet[];
    payment_method_options: Record<string, any>;
    payment_method_type: string;
    payment_method_type_category: string;
    fx_rate: number;
    merchant_requested_currency: string | null;
    merchant_requested_amount: number | null;
    fixed_side: string;
    payment_fees: Record<string, any> | null;
    invoice: string;
    escrow: any | null;
    group_payment: string;
    cancel_reason: string | null;
    initiation_type: string;
    mid: string;
    next_action: string;
    merchant_advice_code: string | null;
    merchant_advice_message: string | null;
}
// Reusing PaymentData for CapturePaymentResponse since they have the same structure
export type CapturePaymentResponse = PaymentData;
// Rapyd API response structure for payment capture
export type RapydCapturePaymentResponse = RapydResponse<CapturePaymentResponse>;
// Rapyd API response structure for payment update, metadata update, and payment creation
export type RapydPaymentResponse = RapydResponse<PaymentData>;
// Rapyd API response structure for cash payment
export type RapydCashPaymentResponse = RapydResponse<CashPaymentData>;
// Rapyd API response structure for e-wallet payment
export type RapydEWalletPaymentResponse = RapydResponse<EWalletPaymentData>;
// Rapyd API response structure for local transfer payment
export type RapydLocalTransferPaymentResponse = RapydResponse<LocalTransferPaymentData>;
// Rapyd API response structure for listing payments
export type ListPaymentsResponse = RapydResponse<ListPayment[]>;
// Rapyd API response structure for listing payment groups
export type ListPaymentGroupsResponse = RapydResponse<ListPayment[]>;
// Rapyd API response structure for listing wallet payments
export type ListWalletPaymentsResponse = RapydResponse<ListPayment[]>;
