import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Scissors, Menu, X } from 'lucide-react';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

import { getRedirectPath } from '../../utils/navigation';
import { SalonService } from '../../services/salons/salonService';
import { useState, useEffect } from 'react';
import type { Salon } from '../../types';

export const Navbar = () => {
  const { currentUser, userData } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (userData?.role === 'owner') {
      SalonService.getOwnerSalon(userData.uid).then(setSalon);
    }
  }, [userData]);

  const handleLogout = () => {
    signOut(auth);
    setIsMenuOpen(false);
  };

  const dashboardLink = userData ? getRedirectPath(userData, salon) : '/dashboard';

  return (
    <nav className="glass sticky top-0 z-[100] px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-2 text-primary font-bold text-xl z-[110]"
        >
          <div className="bg-primary text-white p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Scissors size={20} />
          </div>
          <span className="tracking-tight">SalonSync</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className="text-muted hover:text-primary font-bold text-sm uppercase tracking-widest transition-all">Find Salons</Link>
          {currentUser ? (
            <div className="flex items-center gap-6">
              <Link to={dashboardLink} className="text-muted hover:text-primary font-bold text-sm uppercase tracking-widest transition-all">Dashboard</Link>
              <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                  <User size={14} className="text-primary" />
                  <span className="text-xs font-black text-primary uppercase">{userData?.name?.split(' ')[0] || 'Profile'}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-muted hover:text-primary font-bold text-sm uppercase tracking-widest transition-all">Log In</Link>
              <Link to="/signup" className="bg-primary text-white py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden z-[110] p-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-100"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-screen w-[80%] max-w-sm bg-white shadow-2xl z-[105] md:hidden p-8 flex flex-col"
              >
                <div className="mt-16 space-y-8 flex-1">
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-2xl font-black text-gray-900 hover:text-primary transition-colors"
                  >
                    Find Salons
                  </Link>
                  {currentUser ? (
                    <>
                      <Link 
                        to={dashboardLink} 
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-2xl font-black text-gray-900 hover:text-primary transition-colors"
                      >
                        Dashboard
                      </Link>
                      <div className="pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <User size={24} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                            <p className="text-xl font-black text-gray-900">{userData?.name || 'User'}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-2xl font-black text-gray-900 hover:text-primary transition-colors"
                      >
                        Log In
                      </Link>
                      <Link 
                        to="/signup" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center bg-primary text-white py-4 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>

                {currentUser && (
                  <button 
                    onClick={handleLogout}
                    className="mt-auto w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};