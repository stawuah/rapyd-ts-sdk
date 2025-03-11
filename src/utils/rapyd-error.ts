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

/**
 * Handles API errors from Rapyd, extracting error codes and providing meaningful messages.
 * @param {any} error - The error object from the API call.
 * @param {string} fallbackMessage - A fallback message if error details cannot be extracted.
 * @throws {RapydApiError} - Throws a specialized error with a Rapyd error code.
 */
export function handleApiError(error: any, fallbackMessage: string): never {
    if (error.response?.data?.status) {
        const { error_code, message, response_code, status_code } = error.response.data.status;

        const errorCode = response_code || error_code || 'UNKNOWN_ERROR';
        const userMessage = PAYMENT_ERROR_MESSAGES[errorCode] 
                         || PAYMENT_METHOD_ERROR_MESSAGES[errorCode] 
                         || message 
                         || 'An unexpected payment error occurred.';

        console.error(`[RapydApi] ${errorCode}: ${userMessage}`);
        throw new RapydApiError(userMessage, errorCode, status_code);
    }

    console.error(`[RapydApi] ${fallbackMessage}: ${error.message}`);
    throw new RapydApiError(`${fallbackMessage}: ${error.message}`, 'CLIENT_ERROR');
}

/**
 * Formats error messages from Rapyd API or generic request failures.
 * @param {any} error - The error object.
 * @returns {string} - A formatted error message.
 */
export function formatError(error: any): string {
    if (error instanceof RapydApiError) {
        return `Rapyd API Error: ${error.errorCode} - ${error.message}`;
    }

    return error.response?.data?.status
        ? `Rapyd API Error: ${error.response.data.status.error_code || ''} - ${error.response.data.status.message || 'Unknown error'}`
        : `Unexpected error: ${error.message}`;
}
