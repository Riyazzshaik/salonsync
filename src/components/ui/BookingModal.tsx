import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { Button } from './Button';
import { handleError } from '../../utils/errorHandler';
import type { Salon } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onConfirmBooking: (serviceId: string, slotTime: string) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, salon, onConfirmBooking }) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate some dummy available slots for today
  const availableSlots = [
    '10:00 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'
  ];

  const handleConfirm = async () => {
    if (!selectedService || !selectedTime) return;
    setIsSubmitting(true);
    try {
      await onConfirmBooking(selectedService, selectedTime);
      onClose();
    } catch (error) {
      handleError("BookingModal.confirm", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-500">{salon.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Service Selection */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Scissors size={16} className="mr-2 text-primary" />
                Select Service
              </h4>
              <div className="space-y-2">
                {salon.services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      selectedService === service.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-left">
                      <div className={`font-semibold ${selectedService === service.id ? 'text-primary' : 'text-gray-900'}`}>
                        {service.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{service.duration} mins</div>
                    </div>
                    <div className={`font-bold ${selectedService === service.id ? 'text-primary' : 'text-gray-700'}`}>
                      ${service.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Clock size={16} className="mr-2 text-primary" />
                Available Today
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                      selectedTime === time 
                        ? 'bg-primary border-primary text-white shadow-md' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 bg-white border-t border-gray-100">
            <Button 
              className="w-full py-4 text-base font-bold shadow-xl shadow-primary/20"
              disabled={!selectedService || !selectedTime || isSubmitting}
              isLoading={isSubmitting}
              onClick={handleConfirm}
            >
              Confirm Booking
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Quick scissors icon for this file so we don't have to prop drill
const Scissors = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
    <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
    <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
  </svg>
);
