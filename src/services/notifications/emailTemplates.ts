import type { Booking } from '../../types';

export const EmailTemplates = {
  getBookingConfirmation: (booking: Booking & { salonPhone?: string }) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
      <div style="background: #111827; padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: -1px;">Booking Confirmed</h1>
        <p style="opacity: 0.7; margin-top: 10px;">Get ready for your fresh look at ${booking.salonName}</p>
      </div>
      <div style="padding: 40px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; font-weight: bold;">Service</p>
            <p style="margin: 5px 0 0; font-weight: bold; font-size: 18px;">${booking.serviceName}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; font-weight: bold;">Time</p>
            <p style="margin: 5px 0 0; font-weight: bold; font-size: 18px;">${booking.bookingTime}</p>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin-bottom: 30px;">
          <p style="margin: 0; font-size: 14px; color: #666;">Date: <strong>${booking.bookingDate}</strong></p>
          <p style="margin: 5px 0 0; font-size: 14px; color: #666;">Queue Position: <strong>#${booking.queuePosition}</strong></p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Your digital check-in pass</p>
          <div style="background: white; border: 2px solid #111827; padding: 20px; display: inline-block; border-radius: 15px;">
            <p style="margin: 0; font-family: monospace; font-size: 12px; color: #999;">Scan at salon</p>
            <p style="margin: 5px 0 0; font-weight: bold; color: #111827;">${booking.qrToken}</p>
          </div>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">
          Need to reschedule? Call the salon directly at ${booking.salonPhone || 'the provided number'}.
        </p>
      </div>
    </div>
  `,

  getPaymentReceipt: (booking: Booking) => `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 24px; padding: 40px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="background: #10b981; color: white; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 24px;">✓</div>
        <h2 style="margin: 0; font-size: 20px;">Payment Successful</h2>
        <p style="color: #666; margin-top: 5px;">Receipt #${booking.razorpayPaymentId?.slice(-6).toUpperCase()}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Service Amount</span>
          <span style="font-weight: bold;">₹${booking.servicePrice}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981;">
          <span>Advance Paid</span>
          <span style="font-weight: bold;">-₹${booking.advanceAmount}</span>
        </div>
        <hr style="border: 0; border-top: 1px dashed #eee; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
          <span>Balance Due</span>
          <span>₹${booking.remainingAmount}</span>
        </div>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 16px; font-size: 12px; color: #666;">
        <p style="margin: 0;"><strong>Salon:</strong> ${booking.salonName}</p>
        <p style="margin: 5px 0 0;"><strong>Transaction ID:</strong> ${booking.razorpayPaymentId}</p>
        <p style="margin: 5px 0 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
        Thank you for choosing SalonSync.
      </p>
    </div>
  `
};
