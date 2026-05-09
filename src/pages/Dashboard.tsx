import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SalonCard } from '../components/ui/SalonCard';
import { Skeleton } from '../components/ui/Skeleton';
import { SalonService } from '../services/salons/salonService';
import { handleError } from '../utils/errorHandler';
import type { Salon } from '../types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const activeSalons = await SalonService.getActiveSalons();
        setSalons(activeSalons);
      } catch (error) {
        handleError("Dashboard.fetchSalons", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalons();
  }, []);

  // Filter salons based on search
  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-muted font-medium mb-1">Hello, {userData?.name || 'Guest'} 👋</p>
          <h1 className="text-3xl font-bold text-primary">Find a salon nearby</h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="w-full bg-white border-0 shadow-sm rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="Search salons or services"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Salons List */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            // Loading Skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <Skeleton className="w-full h-48 rounded-2xl mb-4" />
                <Skeleton className="w-1/2 h-6 mb-2" />
                <Skeleton className="w-1/3 h-4" />
              </div>
            ))
          ) : (
            filteredSalons.map((salon, index) => (
              <motion.div 
                key={salon.salonId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <SalonCard 
                  salon={salon} 
                  onClick={() => navigate(`/salon/${salon.salonId}`)} 
                />
              </motion.div>
            ))
          )}
          
          {!isLoading && filteredSalons.length === 0 && (
            <div className="text-center py-12 text-muted">
              No salons found matching your search.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
