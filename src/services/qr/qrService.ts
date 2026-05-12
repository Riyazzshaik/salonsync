interface ParsedToken {
  bookingId?: string;
  qrToken: string;
  timestamp?: number;
}

/**
 * QR SERVICE
 * Handles generation and validation of secure QR verification tokens.
 */
export const QRService = {
  /**
   * Generates a unique verification token for a booking.
   * Using a more secure random string approach.
   */
  generateVerificationToken: (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters like 0, O, 1, I
    const randomPart = Array.from({ length: 12 }, () => 
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
    
    const timestamp = Date.now().toString(36).toUpperCase();
    return `SS-${timestamp}-${randomPart}`;
  },

  /**
   * Generates the final payload that goes into the QR code.
   * Format: bookingId|qrToken|timestamp
   */
  generateQRPayload: (bookingId: string, qrToken: string): string => {
    return `${bookingId}|${qrToken}|${Date.now()}`;
  },

  /**
   * Parses a verification token (Reserved for future use if encoded).
   */
  parseToken: (token: string): ParsedToken | null => {
    try {
      if (token.includes('|')) {
        const [bookingId, qrToken, timestamp] = token.split('|');
        return { bookingId, qrToken, timestamp: Number(timestamp) };
      }
      return { qrToken: token };
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
  }
};
