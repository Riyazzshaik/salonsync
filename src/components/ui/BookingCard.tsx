import React, { useState } from 'react';
import { CalendarIcon, Clock, QrCode, MapPin, ReceiptText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking } from '../../types';

interface BookingCardProps {
  booking: Booking;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  isOwnerView?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, isOwnerView }) => {
  const [showQR, setShowQR] = useState(false);

  const statusSteps = ['confirmed', 'checked_in', 'completed'];
  const currentStepIndex = statusSteps.indexOf(booking.bookingStatus);
  const isFinalStatus = ['completed', 'cancelled', 'no_show'].includes(booking.bookingStatus);

  return (
    <div className={`group relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all mb-4 ${
      isFinalStatus ? 'opacity-75' : ''
    }`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              booking.bookingStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-500' : 
              booking.bookingStatus === 'checked_in' ? 'bg-blue-50 text-blue-500' :
              'bg-gray-50 text-gray-400'
            }`}>
              <ReceiptText size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg leading-tight">{booking.serviceName}</h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" /> {booking.salonName}
                </span>
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-gray-400" /> {booking.bookingDate}
                </span>
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" /> {booking.bookingTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isOwnerView && !isFinalStatus && (booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'checked_in') && (
              <button 
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 rounded-2xl transition-all"
              >
                <QrCode size={18} /> View QR
              </button>
            )}
            
            {!isOwnerView && booking.bookingStatus === 'pending_payment' && (
              <div className="flex flex-col items-end gap-1">
                <span className="px-4 py-2 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100 flex items-center gap-1.5 animate-pulse">
                  <Clock size={12} /> Pending Verification
                </span>
                <p className="text-[10px] text-gray-400 font-medium">QR will generate after approval</p>
              </div>
            )}

            {!isOwnerView && booking.bookingStatus === 'cancelled' && booking.rejectionReason && (
              <div className="max-w-[200px] text-right">
                <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase mb-1 inline-block">Rejected</span>
                <p className="text-[10px] text-red-400 leading-tight italic">{booking.rejectionReason}</p>
              </div>
            )}

            {!isOwnerView && (booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'pending_payment') && onCancel && (
              <button 
                onClick={() => onCancel(booking.bookingId)}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Status Tracker */}
        {!isFinalStatus && (
          <div className="py-4 border-t border-b border-gray-50">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
              {statusSteps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`h-4 w-4 rounded-full border-2 transition-all ${
                      isCurrent ? 'bg-primary border-primary scale-125 ring-4 ring-primary/20' :
                      isActive ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                    }`} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${
                      isActive ? 'text-gray-900' : 'text-gray-300'
                    }`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Paid Online</p>
            <p className="text-lg font-black text-emerald-600">₹{booking.advanceAmount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Remaining Due</p>
            <p className="text-lg font-black text-gray-900">₹{booking.remainingAmount}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-sm w-full overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-primary p-6 text-center text-white relative">
                <h3 className="text-xl font-bold">Check-in QR</h3>
                <p className="text-xs opacity-80 mt-1">Scan at the salon counter</p>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary">
                  <QrCode size={24} />
                </div>
              </div>
              
              <div className="p-8 pt-10 text-center">
                <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 inline-block mb-6">
                  <QRCodeSVG value={`${booking.bookingId}|${booking.qrToken}`} size={180} />
                </div>
                
                <div className="space-y-1 mb-8">
                  <p className="text-sm font-bold text-gray-900">{booking.serviceName}</p>
                  <p className="text-xs text-muted">Token: <span className="font-mono text-primary font-bold">{booking.qrToken}</span></p>
                </div>
                
                <button 
                  onClick={() => setShowQR(false)}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
