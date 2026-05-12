import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, Mail, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export const NotificationSettings = () => {
  const { userData } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [prefs, setPrefs] = useState({
    whatsapp: userData?.notificationPreferences?.whatsapp ?? true,
    email: userData?.notificationPreferences?.email ?? true,
  });

  const handleToggle = (key: 'whatsapp' | 'email') => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    if (!userData?.uid) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        notificationPreferences: prefs
      });
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Bell size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Notification Center</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">How we keep you updated</p>
        </div>
      </div>

      <div className="space-y-4">
        <motion.div 
          whileHover={{ x: 5 }}
          className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-primary/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center text-[#25D366]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">WhatsApp Updates</h4>
              <p className="text-xs text-gray-500">Booking confirmations & QR delivery</p>
            </div>
          </div>
          <button 
            onClick={() => handleToggle('whatsapp')}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.whatsapp ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${prefs.whatsapp ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ x: 5 }}
          className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-primary/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Email Receipts</h4>
              <p className="text-xs text-gray-500">Professional receipts & history</p>
            </div>
          </div>
          <button 
            onClick={() => handleToggle('email')}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.email ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${prefs.email ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </motion.div>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-50">
        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 flex items-start gap-4 mb-8">
          <Shield size={20} className="text-orange-500 mt-1 flex-shrink-0" />
          <p className="text-xs text-orange-700 font-medium leading-relaxed">
            Critical updates like booking cancellations and security alerts will always be sent via email even if notifications are disabled.
          </p>
        </div>
        
        <Button 
          onClick={saveSettings} 
          isLoading={isUpdating}
          className="w-full py-4 text-base font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
