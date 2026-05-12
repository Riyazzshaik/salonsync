import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Clock, Calendar, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './Button';
import type { Booking } from '../../types';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

import { QRService } from '../../services/qr/qrService';

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const qrValue = QRService.generateQRPayload(booking.bookingId || '', booking.qrToken || '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Top Success Banner */}
          <div className="bg-emerald-500 p-8 text-center text-white relative overflow-hidden">
            {/* Animated Background Pulse */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-white rounded-full scale-150 -translate-y-1/2"
            />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1
                }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <CheckCircle size={44} className="text-emerald-500" />
                </motion.div>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold"
              >
                Booking Confirmed!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="opacity-90 mt-1"
              >
                Your slot is reserved and ready
              </motion.p>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <CheckCircle size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Salon</p>
                    <p className="text-sm font-bold text-gray-900">{booking?.salonName || 'Salon'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Queue Pos</p>
                  <p className="text-lg font-black text-primary">#{booking?.queuePosition || '?'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-muted mb-1">
                    <Calendar size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Date</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{booking?.bookingDate || 'Today'}</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-muted mb-1">
                    <Clock size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Time</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{booking?.bookingTime || 'Scheduled'}</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-emerald-200/30">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CreditCard size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Advance Paid</span>
                  </div>
                  <span className="text-lg font-black text-emerald-600">₹{booking?.advanceAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700/70">Balance at Salon</span>
                  <span className="text-sm font-bold text-gray-900">₹{booking?.remainingAmount}</span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-gray-50 rounded-[2rem] p-8 text-center border border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
                <QRCodeSVG 
                  value={qrValue} 
                  size={140}
                  level="H"
                  includeMargin={false}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Show this at the salon</p>
              <p className="text-[10px] font-mono text-muted bg-white py-1 px-3 rounded-full inline-block border border-gray-100">
                {booking?.qrToken || 'VERIFYING...'}
              </p>
            </div>

            <Button 
              onClick={onClose}
              className="w-full mt-8 py-4 rounded-2xl shadow-lg shadow-primary/20"
            >
              Done
            </Button>
            
            <p className="text-center text-[10px] text-muted mt-4 font-medium uppercase tracking-widest">
              Booking ID: {booking?.bookingId?.slice(0, 8) || '...'}...
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
