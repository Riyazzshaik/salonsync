import React from 'react';
import { CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import type { Booking } from '../../types';

interface BookingCardProps {
  booking: Booking;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  isOwnerView?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onAccept, onReject, onCancel, isOwnerView }) => {
  return (
    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors bg-white rounded-2xl border border-gray-100 shadow-sm mb-3">
      <div>
        <h4 className="font-bold text-gray-900 text-lg">{booking.service}</h4>
        <p className="text-muted text-sm flex items-center gap-2 mt-1">
          <CalendarIcon size={14} /> {booking.slotTime}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {booking.status === 'pending' && isOwnerView ? (
          <>
            <button onClick={() => onReject?.(booking.bookingId)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              <XCircle size={16} /> Decline
            </button>
            <button onClick={() => onAccept?.(booking.bookingId)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors">
              <CheckCircle size={16} /> Accept
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
              {booking.status}
            </span>
            {booking.status === 'pending' && !isOwnerView && onCancel && (
              <button 
                onClick={() => onCancel(booking.bookingId)}
                className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
