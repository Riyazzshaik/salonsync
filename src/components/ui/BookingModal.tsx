import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Scissors, CreditCard, ArrowRight, CheckCircle2, QrCode, Smartphone, Info, Upload } from 'lucide-react';
import { Button } from './Button';
import { handleError } from '../../utils/errorHandler';
import { PaymentService } from '../../services/payments/paymentService';
import type { Salon, SalonServiceItem } from '../../types';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onConfirmBooking: (serviceId: string, slotTime: string, method: 'razorpay' | 'upi_manual', upiData?: { transactionId: string, screenshotUrl?: string }) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, salon, onConfirmBooking }) => {
  const [selectedService, setSelectedService] = useState<SalonServiceItem | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'selection' | 'summary' | 'payment_method' | 'upi_details'>('selection');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi_manual'>('upi_manual');
  
  // UPI Data
  const [upiTransactionId, setUpiTransactionId] = useState('');

  const availableSlots = [
    '10:00 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'
  ];

  const advanceFee = selectedService ? PaymentService.calculateAdvanceFee(selectedService.price) : 0;
  const remainingBalance = selectedService ? selectedService.price - advanceFee : 0;

  const handleNext = () => {
    if (step === 'selection' && selectedService && selectedTime) setStep('summary');
    else if (step === 'summary') setStep('payment_method');
    else if (step === 'payment_method') {
      if (paymentMethod === 'razorpay') {
        handleFinalConfirm();
      } else {
        setStep('upi_details');
      }
    }
  };

  const handleBack = () => {
    if (step === 'summary') setStep('selection');
    else if (step === 'payment_method') setStep('summary');
    else if (step === 'upi_details') setStep('payment_method');
  };

  const handleFinalConfirm = async () => {
    if (!selectedService || !selectedTime) return;
    
    if (paymentMethod === 'upi_manual' && !upiTransactionId) {
      toast.error('Please enter the UPI Transaction ID');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmBooking(
        selectedService.id, 
        selectedTime, 
        paymentMethod,
        paymentMethod === 'upi_manual' ? { transactionId: upiTransactionId } : undefined
      );
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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <div className="flex items-center gap-2">
                {step !== 'selection' && (
                  <button onClick={handleBack} className="text-muted hover:text-primary transition-colors p-1">
                    <ArrowRight size={18} className="rotate-180" />
                  </button>
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {step === 'selection' ? 'Book Appointment' : 
                   step === 'summary' ? 'Booking Summary' : 
                   step === 'payment_method' ? 'Payment Method' : 'UPI Payment'}
                </h3>
              </div>
              <p className="text-sm text-gray-500">{salon.name}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {step === 'selection' && (
              <div className="space-y-8">
                {/* Service Selection */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center mb-4">
                    <Scissors size={16} className="mr-2 text-primary" /> Select Service
                  </h4>
                  <div className="space-y-3">
                    {salon.services?.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                            isSelected ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}
                        >
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400'}`}>
                            <Scissors size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate">{service.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-muted flex items-center gap-1"><Clock size={12} /> {service.duration} mins</span>
                              <span className="text-sm text-emerald-600 font-bold">₹{service.price}</span>
                            </div>
                          </div>
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-200'}`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center mb-4">
                    <Clock size={16} className="mr-2 text-primary" /> Available Today
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
                          selectedTime === time ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'summary' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{selectedService?.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted mt-1">
                        <Clock size={14} /> {selectedService?.duration} mins
                        <span>•</span>
                        <CheckCircle2 size={14} className="text-emerald-500" /> {selectedTime}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Service Price</span>
                      <span className="font-semibold text-gray-900">₹{selectedService?.price}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-primary font-bold">Advance Payment Required</span>
                      <span className="font-bold text-primary">₹{advanceFee}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-dashed border-gray-200">
                      <span className="text-sm font-bold text-gray-700">Remaining at Salon</span>
                      <span className="text-lg font-black text-emerald-600">₹{remainingBalance}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    The advance payment secures your slot and is adjusted against your final bill.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'payment_method' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h4 className="text-base font-bold text-gray-900 mb-2">Select Payment Mode</h4>
                
                <button
                  onClick={() => setPaymentMethod('upi_manual')}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                    paymentMethod === 'upi_manual' ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === 'upi_manual' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Scan & Pay (UPI)</div>
                    <p className="text-xs text-muted">GPay, PhonePe, Paytm (Instant Verification)</p>
                  </div>
                  {paymentMethod === 'upi_manual' && <CheckCircle2 size={20} className="text-primary" />}
                </button>

                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                    paymentMethod === 'razorpay' ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === 'razorpay' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <CreditCard size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Card / NetBanking</div>
                    <p className="text-xs text-muted">Razorpay Secure Checkout</p>
                  </div>
                  {paymentMethod === 'razorpay' && <CheckCircle2 size={20} className="text-primary" />}
                </button>
              </motion.div>
            )}

            {step === 'upi_details' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-gray-900 text-white p-6 rounded-[2rem] text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Scan QR to Pay ₹{advanceFee}</p>
                  <div className="bg-white p-4 rounded-3xl inline-block mb-4 shadow-xl">
                    <img src={PaymentService.UPI_CONFIG.qrImage} alt="UPI QR" className="w-40 h-40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black tracking-tight">{PaymentService.UPI_CONFIG.upiId}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{PaymentService.UPI_CONFIG.payeeName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Transaction ID / Reference No.</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Smartphone size={16} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="12-digit number from your app"
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={upiTransactionId}
                        onChange={(e) => setUpiTransactionId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3">
                    <Upload size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-orange-800">Payment Verification</p>
                      <p className="text-[10px] text-orange-700 mt-0.5">Please ensure the Transaction ID is correct. Our team will verify it within 15-30 minutes.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-white border-t border-gray-100">
            <Button 
              className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 rounded-2xl"
              disabled={
                step === 'selection' ? (!selectedService || !selectedTime) :
                step === 'upi_details' ? (!upiTransactionId) : 
                isSubmitting
              }
              isLoading={isSubmitting}
              onClick={step === 'upi_details' || (step === 'payment_method' && paymentMethod === 'razorpay') ? handleFinalConfirm : handleNext}
            >
              {step === 'selection' ? 'Next: Summary' : 
               step === 'summary' ? 'Choose Payment' : 
               step === 'payment_method' ? (paymentMethod === 'razorpay' ? `Pay ₹${advanceFee} now` : 'Proceed to UPI') :
               'Submit Payment Proof'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
