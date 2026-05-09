import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Heart } from 'lucide-react';
import type { Salon } from '../../types';

interface SalonCardProps {
  salon: Salon;
  onClick?: () => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({ salon, onClick }) => {
  const isOpen = salon.openStatus;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
      onClick={onClick}
    >
      {/* Image Header */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden">
        <img 
          src={salon.image} 
          alt={salon.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
          <Heart size={20} className="text-gray-400 hover:text-red-500 transition-colors" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary mb-1">{salon.name}</h3>
          <div className="flex items-center text-muted text-sm">
            <MapPin size={14} className="mr-1" />
            <span>{salon.address}</span>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">
            <Clock size={12} className="mr-1" />
            ~{salon.estimatedWaitTime} min wait
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <Users size={12} className="mr-1" />
            {salon.queueLength} in queue
          </span>
        </div>
      </div>
    </motion.div>
  );
};
