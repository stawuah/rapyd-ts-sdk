import { RapydClient } from '../index';
import { 
    CreatePaymentRequest,
    UpdatePaymentRequest, 
    Address, 
    CapturePaymentOptions, 
    CompletePaymentRequest, 
    RapydLocalTransferPaymentResponse, 
    RapydEWalletPaymentResponse, 
    RapydCashPaymentResponse, 
    ListPaymentsRequest,
    ListPaymentsResponse,
    ListPaymentGroupsRequest,
    ListPaymentGroupsResponse,
    ListWalletPaymentsRequest,
    ListWalletPaymentsResponse} 
    from '../types/payment';
import { 
    RapydPaymentResponse, 
    RapydCapturePaymentResponse 
} from '../types/payment';
import { 
    RapydApiError, 
    handleApiError 
} from '../utils/rapyd-error';

// Payment service for handling payments
export class PaymentService extends RapydClient {
    /**
     * Creates a payment to collect money into a Rapyd Wallet
     * @param {CreatePaymentRequest} paymentRequest - Payment request data
     * @returns {Promise<RapydPaymentResponse>} - Payment response data
     * @throws {RapydApiError} - If there's an error creating the payment
     */
    public async createPayment(paymentRequest: CreatePaymentRequest): Promise<RapydPaymentResponse> {
        try {
            const response = await this.client.post<RapydPaymentResponse>('/v1/payments', paymentRequest);
            return response.data;
        } catch (error: any) {
            handleApiError(error, 'Error creating payment');
        }
    }

    /**
     * Updates an existing payment with new data
     * @param paymentId The ID of the payment to update
     * @param data Data to update on the payment
     * @returns Promise with payment response
     * @throws {RapydApiError} - If there's an error updating the payment
     */
    public async updatePayment(paymentId: string, data: UpdatePaymentRequest): Promise<RapydPaymentResponse> {
        try {
            const response = await this.client.post<RapydPaymentResponse>(`/v1/payments/${paymentId}`, data);
            return response.data;
        } catch (error: any) {
            handleApiError(error, `Error updating payment ${paymentId}`);
        }
    }

    /**
     * Cancels escrow for a payment
     * @param paymentId The ID of the payment to cancel escrow for
     * @returns Promise with payment response
     * @throws {RapydApiError} - If there's an error canceling the escrow
     */
    public async cancelEscrow(paymentId: string): Promise<RapydPaymentResponse> {
        try {
            const data: UpdatePaymentRequest = { escrow: false };
            return await this.updatePayment(paymentId, data);
        } catch (error: any) {
            handleApiError(error, `Error canceling escrow for payment ${paymentId}`);
        }
    }

    /**
     * Updates payment address information
     * @param paymentId The ID of the payment to update
     * @param address The updated address information
     * @returns Promise with payment response
     * @throws {RapydApiError} - If there's an error updating the address
     */
    public async updatePaymentAddress(paymentId: string, address: Address): Promise<RapydPaymentResponse> {
        try {
            const data: UpdatePaymentRequest = { address };
            return await this.updatePayment(paymentId, data);
        } catch (error: any) {
            handleApiError(error, `Error updating address for payment ${paymentId}`);
        }
    }

    /**
     * Updates payment metadata
     * @param paymentId The ID of the payment to update
     * @param metadata The updated metadata
     * @returns Promise with payment response
     * @throws {RapydApiError} - If there's an error updating the metadata
     */
    public async updatePaymentMetadata(paymentId: string, metadata: Record<string, any>): Promise<RapydPaymentResponse> {
        try {
            const data: UpdatePaymentRequest = { metadata };
            return await this.updatePayment(paymentId, data);
        } catch (error: any) {
            handleApiError(error, `Error updating metadata for payment ${paymentId}`);
        }
    }

    /**
   * Captures the full amount of an authorized payment
   * @param paymentId The ID of the payment to capture
   * @returns Promise with payment response
   * @throws {RapydApiError} - If there's an error capturing the payment
   */
    public async captureFullPayment(paymentId: string): Promise<RapydCapturePaymentResponse> {
        try {
        const response = await this.client.post<RapydCapturePaymentResponse>(`/v1/payments/${paymentId}/capture`);
        return response.data;
        } catch (error: any) {
        handleApiError(error, `Error capturing full payment ${paymentId}`);
        }
    }

    /**
   * Captures a partial amount of an authorized payment
   * @param paymentId The ID of the payment to capture
   * @param optionalFields Capture options including amount, receipt_email, and statement_descriptor
   * @returns Promise with payment response
   * @throws {RapydApiError} - If there's an error capturing the partial payment
   */
    public async capturePartialPayment(paymentId: string, optionalFields: CapturePaymentOptions): Promise<RapydCapturePaymentResponse> {
        try {
        const response = await this.client.post<RapydCapturePaymentResponse>(`/v1/payments/${paymentId}/capture`, optionalFields);
        return response.data;
        } catch (error: any) {
        handleApiError(error, `Error capturing payment ${paymentId}`);
        }
    }

    /**
     * Completes a payment (generic method for all payment types)
     * @param paymentToken Payment token to complete
     * @param additionalParams Optional additional parameters required for specific payment methods
     * @returns Promise with payment response
     * @throws {RapydApiError} - If there's an error completing the payment
     */
    public async completePayment(
        paymentToken: string, 
        additionalParams?: { param1?: string; param2?: string }
    ): Promise<RapydPaymentResponse> {
        try {
            const payload: CompletePaymentRequest = {
                token: paymentToken,
                ...additionalParams
            };
            
            const response = await this.client.post<RapydPaymentResponse>('/v1/payments/completePayment', payload);
            return response.data;
        } catch (error: any) {
            handleApiError(error, `Error completing payment ${paymentToken}`);
        }
    }

    /**
     * Completes a bank transfer payment
     * @param paymentToken Payment token to complete
     * @param bankTransferId The bank transfer method ID
     * @param amount The amount to transfer
     * @returns Promise with local transfer payment response
     * @throws {RapydApiError} - If there's an error completing the bank transfer
     */
    public async completeBankTransferPayment(
        paymentToken: string,
        bankTransferId: string,
        amount: string
    ): Promise<RapydLocalTransferPaymentResponse> {
        try {
            const payload: CompletePaymentRequest = {
                token: paymentToken,
                param1: bankTransferId,
                param2: amount
            };
            
            const response = await this.client.post<RapydLocalTransferPaymentResponse>(
                '/v1/payments/completePayment', 
                payload
            );
            return response.data;
        } catch (error: any) {
            handleApiError(error, `Error completing bank transfer payment ${paymentToken}`);
        }
    }

    /**
     * Completes an e-wallet payment
     * @param paymentToken Payment token to complete
     * @returns Promise with e-wallet payment response
     * @throws {RapydApiError} - If there's an error completing the e-wallet payment
     */
    public async completeEWalletPayment(
        paymentToken: string
    ): Promise<RapydEWalletPaymentResponse> {
        try {
            const payload: CompletePaymentRequest = {
                token: paymentToken
            };
            
            const response = await this.client.post<RapydEWalletPaymentResponse>(
                '/v1/payments/completePayment', 
                payload
            );
            return response.data;
        } catch (error: any) {
            handleApiError(error, `Error completing e-wallet payment ${paymentToken}`);
        }
    }


    /**
     * Completes a cash payment
     * @param paymentToken Payment token to complete
     * @returns Promise with cash payment response
     * @throws {RapydApiError} - If there's an error completing the cash payment
     */
    public async completeCashPayment(
        paymentToken: string
    ): Promise<RapydCashPaymentResponse> {
        try {
            const payload: CompletePaymentRequest = {
                token: paymentToken
            };
            
            const response = await this.client.post<RapydCashPaymentResponse>(
                '/v1/payments/completePayment', 
                payload
            );
            return response.data;
        } catch (error: any) {
            handleApiError(error, `Error completing cash payment ${paymentToken}`);
        }
    }


    /**
     * Get payment code (textual or visual) for any payment method
     * @param paymentId The ID of the payment
     * @returns Promise with payment code information
     */
    public async getPaymentCodes(paymentId: string): Promise<{ textual: Record<string, string | undefined>, visual: Record<string, string | undefined> }> {
        try {
            const response = await this.client.get<RapydPaymentResponse>(`/v1/payments/${paymentId}`);
            
            return {
                textual: response.data.data.textual_codes || {},
                visual: response.data.data.visual_codes || {}
            };
        } catch (error: any) {
            handleApiError(error, `Error getting payment codes for ${paymentId}`);
            return { textual: {}, visual: {} };
        }
    }

    /**
     * Lists payments with optional filters
     * @param options Optional parameters for filtering payments
     * @returns Promise with list of payments
     * @throws {RapydApiError} - If there's an error listing payments
     */
    public async listPayments(
        options: ListPaymentsRequest = {}
    ): Promise<ListPaymentsResponse> {
        try {
            const queryParams = new URLSearchParams();
            
            if (options.limit) queryParams.append('limit', options.limit.toString());
            if (options.offset) queryParams.append('offset', options.offset.toString());
            if (options.group) queryParams.append('group', 'true');
            if (options.ewallet) queryParams.append('ewallet', options.ewallet);
            
            const url = `/v1/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await this.client.get<ListPaymentsResponse>(url);
            return response.data;
        } catch (error: any) {
            handleApiError(error, 'Error listing payments');
        }
    }


    /**
     * Lists payment groups
     * @param options Optional parameters for filtering payment groups
     * @returns Promise with list of payment groups
     * @throws {RapydApiError} - If there's an error listing payment groups
     */
    public async listPaymentGroups(
        options: ListPaymentGroupsRequest
    ): Promise<ListPaymentGroupsResponse> {
        try {
            const queryParams = new URLSearchParams();
            
            queryParams.append('group', 'true');
            if (options.limit) queryParams.append('limit', options.limit.toString());
            if (options.offset) queryParams.append('offset', options.offset.toString());
            
            const url = `/v1/payments?${queryParams.toString()}`;
            
            const response = await this.client.get<ListPaymentGroupsResponse>(url);
            return response.data;
        } catch (error: any) {
            handleApiError(error, 'Error listing payment groups');
        }
    }

    /**
     * Lists payments for a specific e-wallet
     * @param options Parameters including the required wallet ID
     * @returns Promise with list of wallet payments
     * @throws {RapydApiError} - If there's an error listing wallet payments
     */
    public async listWalletPaymentsById(
        options: ListWalletPaymentsRequest
    ): Promise<ListWalletPaymentsResponse> {
        try {
            const queryParams = new URLSearchParams();
            
            queryParams.append('ewallet', options.ewallet);
            if (options.limit) queryParams.append('limit', options.limit.toString());
            if (options.offset) queryParams.append('offset', options.offset.toString());
            
            const url = `/v1/payments?${queryParams.toString()}`;
            
            const response = await this.client.get<ListWalletPaymentsResponse>(url);
            return response.data;
        } catch (error: any) {
            handleApiError(error, `Error listing payments for wallet ${options.ewallet}`);
        }
    }
}