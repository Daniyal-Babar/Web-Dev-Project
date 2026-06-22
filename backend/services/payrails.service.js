/**
 * PayRails Easypaisa Integration Service
 * 
 * Documentation: https://docs.payrails.com/docs/easypaisa
 * 
 * This service handles:
 * - Creating workflow executions for payments
 * - Authorizing payments with Easypaisa
 * - Verifying payment status
 * - Processing refunds
 * 
 * Flow:
 * 1. Borrower initiates payment
 * 2. PayRails creates workflow execution
 * 3. Payment authorized with Easypaisa method
 * 4. User redirected to Easypaisa payment page
 * 5. Payment completed and webhook notification received
 * 6. Money held in platform's PayRails merchant account
 * 7. On booking completion, owner's wallet credited
 * 8. Owner can withdraw to their Easypaisa account
 */

const axios = require('axios');

class PayRailsService {
  constructor() {
    this.apiKey = process.env.PAYRAILS_API_KEY;
    this.apiUrl = process.env.PAYRAILS_API_URL || 'https://api.payrails.com';
    
    // Create axios instance with authentication
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Log API calls in development
    if (process.env.NODE_ENV === 'development') {
      this.axiosInstance.interceptors.request.use(request => {
        console.log('PayRails API Request:', request.method.toUpperCase(), request.url);
        return request;
      });

      this.axiosInstance.interceptors.response.use(response => {
        console.log('PayRails API Response:', response.status);
        return response;
      }, error => {
        console.error('PayRails API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      });
    }
  }

  /**
   * STEP 1: Create workflow execution
   * 
   * Initialize a payment session with PayRails
   * This creates a unique execution ID for the payment flow
   * 
   * @param {Object} bookingData - Booking and customer information
   * @returns {Object} Execution details including execution ID
   */
  async createWorkflowExecution(bookingData) {
    const { bookingId, amount, currency = 'PKR', holderInfo } = bookingData;

    try {
      const payload = {
        holder: {
          reference: holderInfo.userId,
          name: holderInfo.name,
          email: holderInfo.email,
          phone: holderInfo.phone
        },
        orderReference: bookingId,
        amount: {
          value: amount.toString(),
          currency: currency
        },
        returnInfo: {
          success: process.env.PAYRAILS_SUCCESS_URL || `${process.env.FRONTEND_URL}/payment-success`,
          error: process.env.PAYRAILS_ERROR_URL || `${process.env.FRONTEND_URL}/payment-failed`
        }
      };

      const response = await this.axiosInstance.post(
        '/merchant/workflows/payment-acceptance/executions',
        payload
      );

      return {
        success: true,
        executionId: response.data.executionId,
        links: response.data.links
      };
    } catch (error) {
      console.error('Failed to create workflow execution:', error.response?.data || error.message);
      throw new Error(`Failed to create workflow execution: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * STEP 2: Authorize payment with Easypaisa
   * 
   * Authorizes a payment using Easypaisa as the payment method
   * Returns a redirect URL where customer completes the payment
   * 
   * @param {Object} executionData - Execution and payment details
   * @returns {Object} Payment authorization with redirect URL
   */
  async authorizePayment(executionData) {
    const { executionId, amount, currency = 'PKR', orderLines } = executionData;

    try {
      const payload = {
        executionId: executionId,
        amount: {
          value: amount.toString(),
          currency: currency
        },
        paymentComposition: [{
          integrationType: 'api',
          paymentMethodCode: 'easypaisa',
          amount: {
            value: amount.toString(),
            currency: currency
          }
        }],
        meta: {
          order: {
            lines: orderLines
          }
        },
        returnInfo: {
          success: process.env.PAYRAILS_SUCCESS_URL || `${process.env.FRONTEND_URL}/payment-success`,
          error: process.env.PAYRAILS_ERROR_URL || `${process.env.FRONTEND_URL}/payment-failed`
        }
      };

      const response = await this.axiosInstance.post(
        `/merchant/workflows/payment-acceptance/executions/${executionId}/authorize`,
        payload
      );

      return {
        success: true,
        paymentId: response.data.paymentId,
        status: response.data.status,
        redirectUrl: response.data.redirectUrl, // Customer redirected here for payment
        data: response.data
      };
    } catch (error) {
      console.error('Payment authorization failed:', error.response?.data || error.message);
      throw new Error(`Payment authorization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * STEP 3: Get payment status
   * 
   * Check the current status of a payment
   * Used to verify payment completion
   * 
   * @param {String} paymentId - PayRails payment ID
   * @returns {Object} Payment status details
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.axiosInstance.get(`/merchant/payments/${paymentId}`);
      
      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        paymentMethod: response.data.paymentMethod,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to get payment status:', error.response?.data || error.message);
      throw new Error(`Failed to get payment status: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * STEP 4: Process refund
   * 
   * Refund a completed payment back to customer's Easypaisa account
   * Used when booking is cancelled
   * 
   * @param {Object} refundData - Refund details
   * @returns {Object} Refund status
   */
  async refundPayment(refundData) {
    const { paymentId, amount, currency = 'PKR', reason } = refundData;

    try {
      const payload = {
        amount: {
          value: amount.toString(),
          currency: currency
        },
        reason: reason || 'Booking cancelled'
      };

      const response = await this.axiosInstance.post(
        `/merchant/payments/${paymentId}/refund`,
        payload
      );

      return {
        success: true,
        refundId: response.data.refundId,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('Refund failed:', error.response?.data || error.message);
      throw new Error(`Refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * STEP 5: Lookup available payment options
   * 
   * Optional: Check which payment methods are available
   * Useful for showing payment options to users
   * 
   * @param {String} executionId - Execution ID
   * @returns {Object} Available payment options
   */
  async lookupPaymentOptions(executionId) {
    try {
      const response = await this.axiosInstance.post(
        `/merchant/workflows/payment-acceptance/executions/${executionId}/lookup`,
        {}
      );

      const easypaisaAvailable = response.data.data.paymentCompositionOptions.some(
        option => option.paymentMethodCode === 'easypaisa'
      );

      return {
        success: true,
        easypaisaAvailable: easypaisaAvailable,
        allOptions: response.data.data.paymentCompositionOptions
      };
    } catch (error) {
      console.error('Lookup failed:', error.response?.data || error.message);
      throw new Error(`Lookup failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify webhook signature (if provided by PayRails)
   * 
   * @param {Object} payload - Webhook payload
   * @param {String} signature - Webhook signature header
   * @returns {Boolean} Is signature valid
   */
  verifyWebhookSignature(payload, signature) {
    // TODO: Implement signature verification if PayRails provides webhook signatures
    // For now, return true (rely on HTTPS and server-side validation)
    return true;
  }

  /**
   * Format amount for PayRails API
   * PayRails expects amount as string
   * 
   * @param {Number} amount - Amount in PKR
   * @returns {String} Formatted amount
   */
  formatAmount(amount) {
    return Math.round(amount).toString();
  }

  /**
   * Check if PayRails is configured
   * 
   * @returns {Boolean} Is service configured
   */
  isConfigured() {
    return !!(this.apiKey && this.apiUrl);
  }
}

// Export singleton instance
module.exports = new PayRailsService();
