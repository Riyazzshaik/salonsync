import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProfileLayout } from '../components/layout/ProfileLayout';
import { CheckCircle, XCircle, Store, Users, Calendar, Search, ShieldCheck, Loader2 } from 'lucide-react';
import { SalonService } from '../services/salons/salonService';
import { AuthService } from '../services/auth/authService';
import { BookingService } from '../services/bookings/bookingService';
import { handleError } from '../utils/errorHandler';
import type { Salon } from '../types';

const AdminDashboard = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ users: 0, activeSalons: 0, bookings: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [pending, userCount, activeCount, bookingCount] = await Promise.all([
        SalonService.getPendingSalons(),
        AuthService.getUsersCount(),
        SalonService.getSalonsCount(),
        BookingService.getBookingsCount()
      ]);
      setSalons(pending);
      setStats({
        users: userCount,
        activeSalons: activeCount,
        bookings: bookingCount
      });
    } catch (error) {
      handleError("AdminDashboard.fetchData", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (salonId: string) => {
    try {
      await SalonService.approveSalon(salonId);
      setSalons(prev => prev.filter(s => s.salonId !== salonId));
      setStats(prev => ({ ...prev, activeSalons: prev.activeSalons + 1 }));
      alert("Salon Approved!");
    } catch (error) {
      alert("Approval failed");
    }
  };

  const handleReject = (salonId: string) => {
    // In production, this would delete or flag as rejected
    setSalons(prev => prev.filter(s => s.salonId !== salonId));
  };

  const filteredSalons = salons.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProfileLayout title="Admin Overview" role="admin">
      <div className="space-y-6">
        
        {/* System Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Users size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.users}</h3>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Store size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Salons</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeSalons}</h3>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><Calendar size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.bookings}</h3>
            </div>
          </motion.div>
        </div>

        {/* Verification Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" /> Pending Salon Approvals
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search pending..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredSalons.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50/30">
                <ShieldCheck size={48} className="text-gray-300 mb-4" />
                <p className="font-medium text-gray-900">No pending verifications</p>
                <p className="text-sm mt-1">All salon accounts have been reviewed.</p>
              </div>
            ) : (
              filteredSalons.map((salon) => (
                <div key={salon.salonId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {salon.name}
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full uppercase font-bold tracking-wide">Pending</span>
                    </h4>
                    <p className="text-muted text-sm mt-1">{salon.address}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Owner ID: {salon.ownerId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleReject(salon.salonId)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                      <XCircle size={16} /> Reject
                    </button>
                    <button onClick={() => handleApprove(salon.salonId)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors">
                      <CheckCircle size={16} /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </ProfileLayout>
  );
};

export default AdminDashboard;
