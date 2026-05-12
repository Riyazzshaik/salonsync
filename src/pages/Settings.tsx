
import { ProfileLayout } from '../components/layout/ProfileLayout';
import { NotificationSettings } from '../components/profile/NotificationSettings';

import { Smartphone, ShieldCheck, CreditCard } from 'lucide-react';

const Settings = () => {
  return (
    <ProfileLayout title="Account Settings" role="customer">
      <div className="space-y-8">
        {/* Notification Section */}
        <section>
          <NotificationSettings />
        </section>

        {/* Security / Verification Status (Visual Only) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Account Status</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Identity Verified</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">Verified</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Smartphone size={20} />
              </div>
              <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Device Security</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Biometric Login</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-black rounded-full uppercase tracking-widest">Disabled</span>
            </div>
          </div>
        </section>

        {/* Placeholder for Payment Methods */}
        <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CreditCard size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Saved Payments</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">Manage your Razorpay tokens and saved cards for faster checkout.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
              Feature coming soon
            </div>
          </div>
        </section>
      </div>
    </ProfileLayout>
  );
};

export default Settings;
