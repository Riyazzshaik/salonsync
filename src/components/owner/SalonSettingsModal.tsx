import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Store, CheckCircle, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Salon } from '../../types';

interface SalonSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onSave: (updatedData: Partial<Salon>) => Promise<void>;
}

const AMENITIES = ['AC Available', 'Parking', 'WiFi', 'Card Payment', 'UPI Payment', 'Home Service', 'Waiting Area', 'Walk-in Supported'];

export const SalonSettingsModal: React.FC<SalonSettingsModalProps> = ({ isOpen, onClose, salon, onSave }) => {
  const [formData, setFormData] = useState({
    description: salon.description || '',
    address: salon.address || '',
    openingHours: salon.openingHours || '09:00 AM',
    closingHours: salon.closingHours || '09:00 PM',
    features: salon.features || [],
    phone: salon.phone || '',
    whatsapp: salon.whatsapp || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature) 
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Store size={20} className="text-primary" /> Salon Profile & Settings
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
            {/* About Section */}
            <section>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Info size={14} /> About Salon
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Salon Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Timings Section */}
            <section>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Clock size={14} /> Business Hours
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Opening Time</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    value={formData.openingHours}
                    onChange={e => setFormData({...formData, openingHours: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Closing Time</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    value={formData.closingHours}
                    onChange={e => setFormData({...formData, closingHours: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <CheckCircle size={14} /> Amenities & Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(feature => {
                  const isSelected = formData.features.includes(feature);
                  return (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                          : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {feature}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <Button variant="outline" className="flex-1 py-4" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 py-4 shadow-xl shadow-primary/20" onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
