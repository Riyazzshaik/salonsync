import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Store, Loader2, Settings, ShieldCheck, TrendingUp, Wallet, Plus, Trash2, Edit3, Scissors, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProfileLayout } from '../components/layout/ProfileLayout';
import { QRScanner } from '../components/owner/QRScanner';
import { SalonSettingsModal } from '../components/owner/SalonSettingsModal';
import { useAuth } from '../context/AuthContext';
import { SalonService } from '../services/salons/salonService';
import { BookingService } from '../services/bookings/bookingService';
import { handleError } from '../utils/errorHandler';
import type { Booking, Salon } from '../types';

import { NoShowService } from '../services/bookings/noShowService';

const OwnerDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'verification'>('schedule');

  useEffect(() => {
    let unsubscribeBookings: () => void;

    const initDashboard = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        const salonData = await SalonService.getOwnerSalon(currentUser.uid);
        if (salonData) {
          setSalon(salonData);
          
          // Subscribe to real-time bookings
          unsubscribeBookings = BookingService.subscribeToSalonBookings(
            salonData.salonId, 
            async (updatedBookings) => {
              setBookings(updatedBookings);
              setIsLoading(false);
              
              // Clean up expired bookings
              await NoShowService.processNoShows(updatedBookings, salonData);
            }
          );
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        handleError("OwnerDashboard.init", error);
        setIsLoading(false);
      }
    };

    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Dashboard loading timed out. Force-stopping spinner.");
        setIsLoading(false);
      }
    }, 5000);

    initDashboard();

    return () => {
      clearTimeout(loadingTimeout);
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, [userData]);

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

  const handleAddOrUpdateService = async () => {
    if (!salon || !newService.name || !newService.price || !newService.duration) return;
    
    const serviceData = {
      id: editingService?.id || `s${Date.now()}`,
      name: newService.name,
      price: Number(newService.price),
      duration: Number(newService.duration)
    };

    let updatedServices;
    if (editingService) {
      updatedServices = salon.services.map(s => s.id === editingService.id ? serviceData : s);
    } else {
      updatedServices = [...(salon.services || []), serviceData];
    }

    setIsUpdating(true);
    try {
      await SalonService.updateSalonServices(salon.salonId, updatedServices);
      setSalon(prev => prev ? { ...prev, services: updatedServices } : null);
      setShowServiceModal(false);
      setEditingService(null);
      setNewService({ name: '', price: '', duration: '' });
    } catch (error) {
      handleError("OwnerDashboard.saveService", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSalonDetails = async (details: Partial<Salon>) => {
    if (!salon) return;
    setIsUpdating(true);
    try {
      await SalonService.updateSalonDetails(salon.salonId, details);
      setSalon(prev => prev ? { ...prev, ...details } : null);
    } catch (error) {
      handleError("OwnerDashboard.updateDetails", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!salon || !confirm('Are you sure you want to delete this service?')) return;
    
    const updatedServices = salon.services.filter(s => s.id !== serviceId);
    setIsUpdating(true);
    try {
      await SalonService.updateSalonServices(salon.salonId, updatedServices);
      setSalon(prev => prev ? { ...prev, services: updatedServices } : null);
    } catch (error) {
      handleError("OwnerDashboard.deleteService", error);
    } finally {
      setIsUpdating(false);
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
          <Button onClick={() => window.location.href = '/owner/register-salon'}>Register My Salon</Button>
        </div>
      </ProfileLayout>
    );
  }

  const totalAdvance = bookings.filter(b => b.bookingStatus !== 'cancelled').reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
  const totalRevenue = bookings.filter(b => b.bookingStatus === 'completed').reduce((sum, b) => sum + (b.servicePrice || 0), 0);
  const noShowRevenue = bookings.filter(b => b.bookingStatus === 'no_show').reduce((sum, b) => sum + (b.advanceAmount || 0), 0);

  const handleUpdateStatus = async (bookingId: string, status: Booking['bookingStatus']) => {
    try {
      await BookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      handleError("OwnerDashboard.updateStatus", error);
    }
  };

  const handleApprovePayment = async (bookingId: string) => {
    if (!currentUser) return;
    try {
      await BookingService.verifyUPIPayment(bookingId, currentUser.uid);
    } catch (error) {
      handleError("OwnerDashboard.approvePayment", error);
    }
  };

  const handleRejectPayment = async (bookingId: string) => {
    try {
      if (confirm("Are you sure you want to reject this payment? The booking will be cancelled.")) {
        await BookingService.rejectUPIPayment(bookingId);
      }
    } catch (error) {
      handleError("OwnerDashboard.rejectPayment", error);
    }
  };

  const confirmedBookings = bookings.filter(b => ['confirmed', 'checked_in', 'completed'].includes(b.bookingStatus));
  const pendingVerifications = bookings.filter(b => b.paymentStatus === 'pending_verification');

  return (
    <ProfileLayout title={salon.name} role="owner">
      <div className="space-y-6">
        
        {/* Revenue Protection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-2xl shadow-gray-900/20"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary-light mb-4">
                <Wallet size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Advance Pool</span>
              </div>
              <h3 className="text-3xl font-black mb-1">₹{totalAdvance}</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Secured Funds</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] p-6 border border-emerald-100 relative overflow-hidden group shadow-xl shadow-emerald-900/5"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-600 mb-4">
                <TrendingUp size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Total Realized</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">₹{totalRevenue}</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Completed Service Value</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] p-6 border border-orange-100 relative overflow-hidden group shadow-xl shadow-orange-900/5"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-orange-600 mb-4">
                <TrendingUp size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">No-Show Recovery</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">₹{noShowRevenue}</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Retained Advances</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[2rem] p-6 border border-blue-100 relative overflow-hidden group shadow-xl shadow-blue-900/5"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Users size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Active Queue</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{salon.queueLength}</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Waiting Now</p>
            </div>
          </motion.div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Quick Management</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 md:flex-none"
              onClick={() => setShowScanner(!showScanner)}
            >
              {showScanner ? 'Close Scanner' : 'Scan QR'}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 md:flex-none"
              onClick={() => setShowSettingsModal(true)}
            >
              Salon Settings
            </Button>
            <Button 
              variant={salon.openStatus ? 'outline' : 'primary'}
              className={`flex-1 md:flex-none ${salon.openStatus ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              onClick={toggleOpenStatus}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="animate-spin" size={16} /> : (salon.openStatus ? 'Close Salon' : 'Open Salon')}
            </Button>
          </div>
        </div>

        {/* QR Scanner Modal */}
        <QRScanner 
          isOpen={showScanner} 
          onClose={() => setShowScanner(false)} 
          onScanSuccess={async (decodedText) => {
            try {
              const verifiedBooking = await BookingService.verifyBookingQR(decodedText);
              alert(`Success: ${verifiedBooking.serviceName} verified for ${verifiedBooking.bookingTime}! Customer checked in.`);
              setShowScanner(false);
            } catch (err: any) {
              throw new Error(err.message || "Invalid QR Code");
            }
          }} 
        />

        {/* Tabs for Schedule vs Verification */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
            }`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              activeTab === 'verification' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
            }`}
          >
            Payment Verification
            {pendingVerifications.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {pendingVerifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Verification Queue View */}
        <AnimatePresence mode="wait">
          {activeTab === 'verification' ? (
            <motion.div 
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-orange-50/30 flex items-center gap-2">
                <ShieldCheck size={20} className="text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Pending UPI Verifications</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingVerifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic">No payments pending verification.</div>
                ) : (
                  pendingVerifications.map((booking) => (
                    <div key={booking.bookingId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black rounded-full uppercase tracking-widest">Action Required</span>
                          <span className="text-xs text-gray-400"># {booking.bookingId.slice(-6)}</span>
                        </div>
                        <h4 className="font-black text-gray-900 text-lg">{booking.serviceName}</h4>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Transaction ID</p>
                            <p className="text-sm font-bold text-primary tracking-tight">{booking.upiTransactionId || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Amount to Verify</p>
                            <p className="text-sm font-black text-gray-900">₹{booking.advanceAmount}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleRejectPayment(booking.bookingId)}
                          className="px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApprovePayment(booking.bookingId)}
                          className="px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                        >
                          Approve Payment <CheckCircle2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            /* Schedule Table View */
            <motion.div 
              key="schedule"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Confirmed Appointments</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {confirmedBookings.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic">No confirmed bookings for today.</div>
                ) : (
                  confirmedBookings.map((booking) => (
                    <div key={booking.bookingId} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/30 transition-colors">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          booking.bookingStatus === 'checked_in' ? 'bg-blue-100 text-blue-600' : 
                          booking.bookingStatus === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Users size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-gray-900 truncate">{booking.serviceName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              ['success', 'verified', 'paid'].includes(booking.paymentStatus) ? 'bg-emerald-100 text-emerald-700' : 
                              ['pending_verification'].includes(booking.paymentStatus) ? 'bg-orange-100 text-orange-700' : 
                              ['failed', 'cancelled'].includes(booking.paymentStatus) ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {booking.paymentStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3">
                            <p className="text-xs text-muted flex items-center gap-1 font-bold">
                              <Clock size={12} /> {booking.bookingTime}
                            </p>
                            <span className="text-[10px] text-gray-300 hidden sm:block">•</span>
                            <p className="text-xs font-bold text-primary">Advance: ₹{booking.advanceAmount}</p>
                            <p className="text-xs font-bold text-emerald-600">Balance: ₹{booking.remainingAmount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-col items-end mr-2">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            booking.bookingStatus === 'confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                            booking.bookingStatus === 'checked_in' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                            booking.bookingStatus === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {booking.bookingStatus.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.bookingStatus === 'confirmed' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.bookingId, 'no_show')}
                              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                            >
                              No Show
                            </button>
                          )}
                          {booking.bookingStatus === 'checked_in' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.bookingId, 'completed')}
                              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manage Services */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Manage Services</h2>
            <Button 
              size="sm" 
              className="rounded-xl flex items-center gap-2"
              onClick={() => {
                setEditingService(null);
                setNewService({ name: '', price: '', duration: '' });
                setShowServiceModal(true);
              }}
            >
              <Plus size={16} /> Add Service
            </Button>
          </div>
          <div className="divide-y divide-gray-100">
            {!salon.services || salon.services.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic">No services listed yet. Add your first service to start receiving bookings.</div>
            ) : (
              salon.services.map((service) => (
                <div key={service.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      <Scissors size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{service.name}</h4>
                      <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                        <Clock size={12} /> {service.duration} mins • <span className="font-bold text-primary">₹{service.price}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingService(service);
                        setNewService({ name: service.name, price: service.price.toString(), duration: service.duration.toString() });
                        setShowServiceModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowServiceModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-xl font-bold mb-6">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Haircut & Styling"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="299"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                    <input 
                      type="number" 
                      placeholder="30"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary"
                      value={newService.duration}
                      onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1 py-3" onClick={() => setShowServiceModal(false)}>Cancel</Button>
                <Button className="flex-1 py-3" onClick={handleAddOrUpdateService} isLoading={isUpdating}>Save Service</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SalonSettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        salon={salon}
        onSave={handleUpdateSalonDetails}
      />
    </ProfileLayout>
  );
};

export default OwnerDashboard;
