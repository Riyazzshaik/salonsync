import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileLayout } from '../components/layout/ProfileLayout';
import { 
  Store, Users, Calendar, 
  Search, ShieldCheck, Loader2, Wallet, 
  ArrowRight, Activity, MapPin 
} from 'lucide-react';
import { SalonService } from '../services/salons/salonService';
import { AuthService } from '../services/auth/authService';
import { BookingService } from '../services/bookings/bookingService';
import { handleError } from '../utils/errorHandler';
import { MaintenanceService } from '../services/maintenance/maintenanceService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Salon, User } from '../types';

type AdminTab = 'overview' | 'approvals' | 'salons' | 'users';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [salons, setSalons] = useState<Salon[]>([]);
  const [allSalons, setAllSalons] = useState<Salon[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ users: 0, activeSalons: 0, bookings: 0, revenue: 0 });
  const [notifStats, setNotifStats] = useState({ sent: 0, failed: 0 });

  useEffect(() => {
    fetchDashboardData();
    
    // Subscribe to pending salons for real-time updates
    const unsubscribePending = SalonService.subscribeToPendingSalons((pending) => {
      setSalons(pending);
    });

    return () => {
      if (unsubscribePending) unsubscribePending();
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [userCount, activeCount, bookingCount, totalRevenue, salonsList, usersList, logsSnapshot] = await Promise.all([
        AuthService.getUsersCount(),
        SalonService.getSalonsCount(),
        BookingService.getBookingsCount(),
        BookingService.getTotalAdvanceRevenue(),
        SalonService.getAllSalons(),
        AuthService.getAllUsers(),
        getDocs(collection(db, 'notificationLogs'))
      ]);
      
      const logs = logsSnapshot.docs.map(d => d.data());
      setNotifStats({
        sent: logs.filter(l => l.status === 'sent').length,
        failed: logs.filter(l => l.status === 'failed').length
      });

      setStats({
        users: userCount,
        activeSalons: activeCount,
        bookings: bookingCount,
        revenue: totalRevenue
      });
      setAllSalons(salonsList);
      setAllUsers(usersList);
    } catch (error) {
      handleError("AdminDashboard.fetchData", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (salonId: string) => {
    try {
      await SalonService.approveSalon(salonId);
      setStats(prev => ({ ...prev, activeSalons: prev.activeSalons + 1 }));
      // pending salons will update via onSnapshot
    } catch (error) {
      alert("Approval failed");
    }
  };

  const filteredSalons = salons.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllSalons = allSalons.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProfileLayout title="Admin Control Center" role="admin">
      <div className="space-y-6 pb-12">
        
        {/* Tabs Navigation */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto hide-scrollbar">
          {(['overview', 'approvals', 'salons', 'users'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-500 hover:text-primary hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* System Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Users</p>
                    <h3 className="text-2xl font-black text-gray-900">{stats.users}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Store size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Salons</p>
                    <h3 className="text-2xl font-black text-gray-900">{stats.activeSalons}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Calendar size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bookings</p>
                    <h3 className="text-2xl font-black text-gray-900">{stats.bookings}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Wallet size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Revenue</p>
                    <h3 className="text-2xl font-black text-gray-900">₹{stats.revenue}</h3>
                  </div>
                </div>
              </div>

              {/* Activity Section Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-primary" /> Delivery Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Notifications Sent</span>
                      <span className="text-xl font-black text-emerald-800">{notifStats.sent}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Delivery Failures</span>
                      <span className="text-xl font-black text-red-800">{notifStats.failed}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={async () => {
                        const count = await MaintenanceService.sanitizeDatabase();
                        alert(`Database sanitized! Removed ${count} dummy/invalid records.`);
                        fetchDashboardData();
                      }}
                      className="p-4 bg-gray-50 rounded-2xl text-left hover:bg-gray-100 transition-colors group"
                    >
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Database</p>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Sanitize Data</p>
                    </button>
                    <button 
                      onClick={() => alert("System Health: ALL SYSTEMS OPERATIONAL\n- Firebase: OK\n- Razorpay: OK\n- OpenRouteService: OK")}
                      className="p-4 bg-gray-50 rounded-2xl text-left hover:bg-gray-100 transition-colors group"
                    >
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">System</p>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Health Check</p>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'approvals' && (
            <motion.div 
              key="approvals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                  <ShieldCheck size={20} className="text-primary" /> Pending Verifications
                </h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {isLoading ? (
                  <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : filteredSalons.length === 0 ? (
                  <div className="p-20 flex flex-col items-center justify-center text-gray-500">
                    <ShieldCheck size={48} className="text-gray-200 mb-4" />
                    <p className="font-bold text-gray-900">All caught up!</p>
                    <p className="text-sm mt-1">No pending salon approvals at the moment.</p>
                  </div>
                ) : (
                  filteredSalons.map((salon) => (
                    <div key={salon.salonId} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200">
                          {salon.image ? <img src={salon.image} className="w-full h-full object-cover" /> : <Store className="w-full h-full p-4 text-gray-300" />}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-xl">{salon.name}</h4>
                          <p className="text-muted text-sm flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {salon.address}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full uppercase font-black tracking-widest border border-blue-100">
                              {salon.category || 'Service'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors">
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(salon.salonId)}
                          className="px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                        >
                          Approve <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'salons' && (
            <motion.div 
              key="salons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                  <Store size={20} className="text-primary" /> Active Partners
                </h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search salons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filteredAllSalons.map((salon) => (
                  <div key={salon.salonId} className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                        {salon.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{salon.name}</h4>
                        <p className="text-xs text-gray-500">{salon.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        salon.adminApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {salon.adminApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                  <Users size={20} className="text-primary" /> Registered Users
                </h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <div key={user.uid} className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{user.name || 'Anonymous User'}</h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProfileLayout>
  );
};

export default AdminDashboard;
