import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => Promise<void>;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render(async (decodedText) => {
        setIsProcessing(true);
        try {
          await onScanSuccess(decodedText);
          scanner.clear();
          onClose();
        } catch (err: any) {
          setError(err.message || "Invalid QR Code");
          setTimeout(() => setError(null), 3000);
        } finally {
          setIsProcessing(false);
        }
      }, () => {
        // Silent scan errors are normal
      });

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Camera size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Scan Customer QR</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="p-8">
            <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 aspect-square mb-6 border-4 border-gray-100">
              <div id="reader" className="w-full h-full" />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="font-bold">Verifying Ticket...</p>
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-6 left-6 right-6 bg-red-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-xl z-20"
                >
                  <AlertCircle size={20} />
                  <p className="text-sm font-bold">{error}</p>
                </motion.div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
                <ShieldCheck size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Point your camera at the customer's QR code. The system will automatically verify their token and mark them as checked-in.
                </p>
              </div>
              
              <Button 
                variant="outline"
                onClick={onClose}
                className="w-full py-4 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 font-bold"
              >
                Cancel Scan
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
