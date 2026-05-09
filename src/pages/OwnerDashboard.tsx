import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar as CalendarIcon, Store, Loader2, Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProfileLayout } from '../components/layout/ProfileLayout';
import { useAuth } from '../context/AuthContext';
import { SalonService } from '../services/salons/salonService';
import { BookingService } from '../services/bookings/bookingService';
import { handleError } from '../utils/errorHandler';
import type { Booking, Salon } from '../types';

const OwnerDashboard = () => {
  const { userData } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (userData?.uid) {
      fetchDashboardData();
    }
  }, [userData]);

  const fetchDashboardData = async () => {
    if (!userData) return;
    try {
      const salonData = await SalonService.getOwnerSalon(userData.uid);
      if (salonData) {
        setSalon(salonData);
        const bookingsData = await BookingService.getSalonBookings(salonData.salonId);
        setBookings(bookingsData);
      }
    } catch (error) {
      handleError("OwnerDashboard.fetchData", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpenStatus = async () => {
    if (!salon) return;
    setIsUpdating(true);
    try {
      await SalonService.updateSalonStatus(salon.salonId, !salon.openStatus);
      setSalon(prev => prev ? { ...prev, openStatus: !prev.openStatus } : null);
    } catch (error) {
      alert("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateCapacity = async (newCap: number) => {
    if (!salon) return;
    try {
      await SalonService.updateSalonCapacity(salon.salonId, newCap);
      setSalon(prev => prev ? { ...prev, queueCapacity: newCap } : null);
    } catch (error) {
      handleError("OwnerDashboard.updateCapacity", error);
    }
  };

  if (isLoading) {
    return (
      <ProfileLayout title="Loading..." role="owner">
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
      </ProfileLayout>
    );
  }

  if (!salon) {
    return (
      <ProfileLayout title="No Salon Found" role="owner">
        <div className="text-center p-12 bg-white rounded-3xl border border-gray-100">
          <Store size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">You haven't registered a salon yet.</h2>
          <Button onClick={() => window.location.href = '/owner/register'}>Register My Salon</Button>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout title={salon.name} role="owner">
      <div className="space-y-6">
        
        {/* Quick Actions */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Quick Management</span>
          </div>
          <Button 
            variant={salon.openStatus ? 'outline' : 'primary'}
            className={salon.openStatus ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-emerald-600 hover:bg-emerald-700'}
            onClick={toggleOpenStatus}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="animate-spin" size={16} /> : (salon.openStatus ? 'Close Salon' : 'Open Salon')}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><CalendarIcon size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bookings</p>
              <h3 className="text-2xl font-bold text-gray-900">{bookings.length}</h3>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Users size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Live Queue</p>
              <h3 className="text-2xl font-bold text-gray-900">{salon.queueLength} / {salon.queueCapacity || 10}</h3>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-500 mb-2">Queue Capacity</p>
            <div className="flex items-center gap-2">
              <input type="range" min="1" max="50" value={salon.queueCapacity || 10} onChange={(e) => updateCapacity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <span className="text-sm font-bold text-gray-700 w-6">{salon.queueCapacity || 10}</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><Store size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <h3 className={`text-xl font-bold ${salon.openStatus ? 'text-emerald-600' : 'text-red-600'}`}>{salon.openStatus ? 'Open' : 'Closed'}</h3>
            </div>
          </motion.div>
        </div>

        {/* Appointments Table */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Live Appointments</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">No bookings found for your salon.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.bookingId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{booking.service}</h4>
                    <p className="text-muted text-sm flex items-center gap-2 mt-1">
                      <CalendarIcon size={14} /> {booking.slotTime}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </ProfileLayout>
  );
};

export default OwnerDashboard;
