import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { User, LogOut, Heart, Calendar, Store, Settings, PieChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { handleError } from '../../utils/errorHandler';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface ProfileLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'customer' | 'owner' | 'admin';
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, title, role }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      handleError("ProfileLayout.logout", error);
    }
  };

  const getSidebarLinks = () => {
    if (role === 'owner') {
      return [
        { to: '/owner/dashboard', icon: <Store size={20} />, label: 'Dashboard' },
        { to: '/owner/bookings', icon: <Calendar size={20} />, label: 'Bookings' },
        { to: '/owner/services', icon: <Settings size={20} />, label: 'Services' },
      ];
    }
    if (role === 'admin') {
      return [
        { to: '/admin', icon: <PieChart size={20} />, label: 'Overview' },
        { to: '/admin/salons', icon: <Store size={20} />, label: 'Salons' },
      ];
    }
    return [
      { to: '/profile', icon: <User size={20} />, label: 'Profile' },
      { to: '/bookings', icon: <Calendar size={20} />, label: 'Bookings' },
      { to: '/favorites', icon: <Heart size={20} />, label: 'Favorites' },
    ];
  };

  const links = getSidebarLinks();

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
              {userData?.profileImage ? (
                <img src={userData.profileImage} alt={userData.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={32} />
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{userData?.name || 'User'}</h2>
            <span className="mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {userData?.role || role}
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col p-2 gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/5 text-primary' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-2 border-t border-gray-50 mt-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-primary tracking-tight">{title}</h1>
          </motion.div>
          {children}
        </div>

      </div>
    </div>
  );
};
