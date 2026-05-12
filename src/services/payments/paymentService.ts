
declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

export type PaymentResult = {
  success: boolean;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  error?: string;
};

export const PaymentService = {
  /**
   * UPI Configuration for manual verification.
   */
  UPI_CONFIG: {
    upiId: 'salon.sync@okicici', // Replace with your actual UPI ID
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=salon.sync@okicici%26pn=SalonSync%26cu=INR', // Dynamic QR placeholder
    payeeName: 'SalonSync'
  },

  /**
   * Calculates the mandatory advance fee.
   * Rule: ₹30 or 10% of service price, whichever is higher.
   */
  calculateAdvanceFee: (servicePrice: number): number => {
    return Math.max(30, Math.ceil(servicePrice * 0.1));
  },

  /**
   * Placeholder for backend signature verification.
   * In a real production app, this check MUST happen on a secure server.
   */
  verifyPaymentSignature: async (paymentId: string, orderId: string, signature: string): Promise<boolean> => {
    console.warn("SECURITY: Signature verification is currently in placeholder mode. Implement backend check for production.");
    return !!(paymentId && orderId && signature);
  },

  /**
   * Opens Razorpay Checkout for advance payment.
   */
  processAdvancePayment: async (params: {
    customerName: string;
    customerEmail: string;
    serviceName: string;
    amount: number;
    salonName: string;
  }): Promise<PaymentResult> => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    return new Promise((resolve) => {
      try {
        if (!razorpayKey || !razorpayKey.startsWith('rzp_test_')) {
          return resolve({
            success: false,
            error: 'Invalid Razorpay Key configuration. Please ensure VITE_RAZORPAY_KEY_ID starts with rzp_test_ in your .env file.'
          });
        }

        if (typeof window.Razorpay === 'undefined') {
          return resolve({
            success: false,
            error: 'Razorpay SDK not found. Please check your internet connection or script loading.'
          });
        }

        const options = {
          key: razorpayKey,
          amount: Math.round(params.amount * 100),
          currency: 'INR',
          name: 'SalonSync',
          description: `Advance for ${params.serviceName} at ${params.salonName}`,
          image: 'https://cdn-icons-png.flaticon.com/512/1057/1057364.png',
          handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
            resolve({
              success: true,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
          },
          prefill: {
            name: params.customerName,
            email: params.customerEmail,
          },
          theme: {
            color: '#111827',
          },
          modal: {
            ondismiss: function () {
              resolve({ success: false, error: 'Payment cancelled by user' });
            },
            escape: true,
            backdropclose: false
          },
          retry: { enabled: false },
          notes: {
            service: params.serviceName,
            salon: params.salonName,
            platform: 'SalonSync_v1'
          }
        };

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response: { error: { description: string } }) {
          resolve({ 
            success: false, 
            error: response.error.description || 'Payment failed.' 
          });
        });

        rzp.open();
      } catch (error) {
        const err = error as Error;
        resolve({ 
          success: false, 
          error: err.message || 'Initialization error' 
        });
      }
    });
  }
};
