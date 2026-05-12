import { useEffect, useState } from 'react';
import { CalendarX, Loader2 } from 'lucide-react';
import { ProfileLayout } from '../components/layout/ProfileLayout';
import { BookingCard } from '../components/ui/BookingCard';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookingService } from '../services/bookings/bookingService';
import { handleError } from '../utils/errorHandler';
import type { Booking } from '../types';

const Profile = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData?.uid) {
      fetchBookings();
    }
  }, [userData]);

  const fetchBookings = async () => {
    if (!userData) return;
    try {
      const data = await BookingService.getCustomerBookings(userData.uid);
      setBookings(data as Booking[]);
    } catch (err) {
      handleError("Profile.fetchBookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await BookingService.cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      handleError("Profile.handleCancel", err);
    }
  };

  if (isLoading) {
    return (
      <ProfileLayout title="My Profile" role="customer">
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
      </ProfileLayout>
    );
  }

  const activeBookings = bookings.filter(b => ['pending_payment', 'confirmed', 'checked_in'].includes(b.bookingStatus));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled', 'no_show'].includes(b.bookingStatus));

  return (
    <ProfileLayout title="My Schedule" role="customer">
      <div className="space-y-10">
        
        {/* Active Bookings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Active Appointments</h2>
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
              {activeBookings.length} Active
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeBookings.length > 0 ? (
              activeBookings.map((booking) => (
                <BookingCard 
                  key={booking.bookingId} 
                  booking={booking} 
                  onCancel={handleCancel} 
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-16 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="h-16 w-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-gray-300 mb-6">
                  <CalendarX size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nothing scheduled right now</h3>
                <p className="text-gray-500 max-w-xs mb-8">Ready for a fresh look? Discover the best salons nearby.</p>
                <Button onClick={() => navigate('/dashboard')} className="shadow-2xl shadow-primary/20 px-8 py-4 text-base font-black uppercase tracking-widest rounded-2xl">
                  Explore Salons
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* History Section */}
        {pastBookings.length > 0 && (
          <section className="pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-400 tracking-tighter uppercase">Booking History</h2>
            </div>
            
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div 
                  key={booking.bookingId}
                  className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-50 shadow-sm opacity-70 grayscale-[0.5] hover:grayscale-0 hover:opacity-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                      <CalendarX size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{booking.serviceName}</h4>
                      <p className="text-xs text-gray-400 font-medium">{booking.salonName} • {booking.bookingDate}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    booking.bookingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {booking.bookingStatus.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ProfileLayout>
  );
};

export default Profile;
