import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarX } from 'lucide-react';
import { ProfileLayout } from '../components/layout/ProfileLayout';
import { BookingCard } from '../components/ui/BookingCard';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../types';

const Profile = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]); // Simulate empty initially

  const handleCancel = (bookingId: string) => {
    // In production, update Firestore doc status to 'cancelled'
    setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  return (
    <ProfileLayout title="My Profile" role="customer">
      <div className="space-y-8">
        {/* Bookings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard key={booking.bookingId} booking={booking} onCancel={handleCancel} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <CalendarX size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Upcoming Bookings</h3>
              <p className="text-gray-500 max-w-sm mb-6">You haven't scheduled any salon appointments yet. Browse nearby salons to get started.</p>
              <Button onClick={() => navigate('/dashboard')} className="shadow-lg shadow-primary/20">
                Find a Salon
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
