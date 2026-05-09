import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, Clock, MapPin, Users, Star, Map as MapIcon, CalendarX, CheckCircle, MessageCircle, Phone, Share2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { BookingModal } from '../components/ui/BookingModal';
import { MapRouteComponent } from '../components/ui/MapRouteComponent';
import { Skeleton } from '../components/ui/Skeleton';
import { SalonService } from '../services/salons/salonService';
import { BookingService } from '../services/bookings/bookingService';
import { handleError } from '../utils/errorHandler';
import type { Salon } from '../types';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Premium Marker Icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SalonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isJoiningQueue, setIsJoiningQueue] = useState(false);
  
  // Routing State
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    const fetchSalon = async () => {
      if (!id) return;
      try {
        const fetchedSalon = await SalonService.getSalonById(id);
        setSalon(fetchedSalon);
      } catch (err) {
        handleError("SalonDetails.fetch", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalon();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-20 px-4 gap-4 max-w-3xl mx-auto">
        <Skeleton className="w-full h-64 rounded-3xl" />
        <Skeleton className="w-2/3 h-8 mt-4" />
        <Skeleton className="w-1/2 h-4" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl text-center max-w-md shadow-sm border border-gray-100 flex flex-col items-center">
          <CalendarX size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Salon Not Found</h2>
          <p className="text-gray-500 mb-6">The salon you are looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleJoinQueue = async () => {
    if (!salon || !userData || isJoiningQueue) return;
    setIsJoiningQueue(true);
    try {
      await SalonService.joinQueue(salon.salonId);
      setSalon(prev => prev ? { ...prev, queueLength: prev.queueLength + 1 } : null);
      alert('Successfully joined the queue!');
    } catch (error) {
      alert('Failed to join queue.');
    } finally {
      setIsJoiningQueue(false);
    }
  };

  const handleConfirmBooking = async (serviceId: string, slotTime: string) => {
    if (!salon || !userData) return;
    
    try {
      const service = salon.services?.find(s => s.id === serviceId) || { name: serviceId };
      await BookingService.createBooking({
        customerId: userData.uid,
        salonId: salon.salonId,
        service: service.name,
        slotTime: slotTime,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert(`Successfully booked at ${slotTime}!`);
    } catch (error) {
      alert('Failed to book slot.');
    }
  };

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96 w-full bg-gray-200">
        {salon.image && (
          <img 
            src={salon.image} 
            alt={salon.name} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 sm:left-8 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-sm hover:scale-105 transition-transform z-20"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>

        <div className="absolute top-6 right-4 sm:right-8 flex gap-2 z-20">
          <button className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-sm hover:scale-105 transition-transform">
            <Share2 size={20} className="text-gray-800" />
          </button>
          <button className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-sm hover:scale-105 transition-transform group">
            <Heart size={20} className="text-gray-800 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        {/* Header Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-primary">{salon.name}</h1>
              <p className="text-sm text-primary/60 mt-1">{salon.category || 'Premium Salon'}</p>
            </div>
            <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
              <Star size={16} className="text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">{salon.rating || 'New'}</span>
              <span className="text-xs text-muted ml-1">(30)</span>
            </div>
          </div>
          
          <div className="flex items-center text-muted mb-4">
            <MapPin size={16} className="mr-1.5 flex-shrink-0" />
            <span className="text-sm">{salon.address}</span>
          </div>

          {salon.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {salon.description}
            </p>
          )}

          <div className="flex gap-2 mb-6">
            {salon.phone && (
              <a href={`tel:${salon.phone.replace(/\s+/g, '')}`} className="flex-1">
                <Button variant="outline" className="w-full text-sm py-2" aria-label="Call Salon">
                  <Phone size={16} className="mr-2" /> Call
                </Button>
              </a>
            )}
            {salon.whatsapp && (
              <a 
                href={`https://wa.me/${salon.whatsapp}?text=${encodeURIComponent("Hello, I found your salon on SalonSync and would like to know more about your services.")}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full text-sm py-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-md shadow-[#25D366]/20" aria-label="WhatsApp Salon">
                  <MessageCircle size={16} className="mr-2" /> WhatsApp
                </Button>
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Clock size={24} className="text-orange-500 mb-2" />
              <span className="text-sm text-orange-600 font-medium">Wait Time</span>
              <span className="text-2xl font-bold text-orange-700">~{salon.estimatedWaitTime || 0}m</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Users size={24} className="text-gray-500 mb-2" />
              <span className="text-sm text-gray-600 font-medium">In Queue</span>
              <span className="text-2xl font-bold text-gray-800">{salon.queueLength || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Features / Amenities */}
        {salon.features && salon.features.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-8"
          >
            <h2 className="text-xl font-bold text-primary mb-4">Amenities & Features</h2>
            <div className="flex flex-wrap gap-2">
              {salon.features.map((feature, idx) => (
                <div key={idx} className="flex items-center bg-accent/5 text-accent border border-accent/10 px-3 py-1.5 rounded-full text-sm font-medium">
                  <CheckCircle size={14} className="mr-1.5" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gallery */}
        {salon.galleryImages && salon.galleryImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 overflow-hidden"
          >
            <h2 className="text-xl font-bold text-primary mb-4">Gallery</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {salon.galleryImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`${salon.name} gallery ${idx + 1}`} 
                  loading="lazy"
                  className="h-48 w-64 object-cover rounded-2xl flex-shrink-0 snap-center shadow-sm border border-gray-100"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-xl font-bold text-primary">Location & Directions</h2>
              {routeInfo && (
                <p className="text-sm font-medium text-emerald-600 mt-1">
                  {routeInfo.distance.toFixed(1)} km away • ~{Math.ceil(routeInfo.duration)} min drive
                </p>
              )}
              {locationError && (
                <p className="text-sm font-medium text-orange-600 mt-1 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                  {locationError}
                </p>
              )}
            </div>
            <Button onClick={openGoogleMaps} variant="outline" className="text-sm py-2 px-4 whitespace-nowrap">
              <MapIcon size={16} className="mr-2" /> Open in Maps
            </Button>
          </div>
          
          <div className="h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative bg-gray-50">
            {isMapLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
                <Skeleton className="w-full h-full" />
              </div>
            )}
            
            {/* Only render map if valid coords exist */}
            {!isNaN(salon.latitude) && !isNaN(salon.longitude) && (
              <MapContainer 
                center={[salon.latitude, salon.longitude]} 
                zoom={14} 
                scrollWheelZoom={false}
                className="h-full w-full z-0"
                whenReady={() => setIsMapLoading(false)}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <MapRouteComponent 
                  destination={{ lat: salon.latitude, lng: salon.longitude }}
                  customIcon={customIcon}
                  onRouteCalculated={(dist, dur) => setRouteInfo({ distance: dist, duration: dur })}
                  onLocationError={(err) => setLocationError(err)}
                />
              </MapContainer>
            )}
          </div>
        </motion.div>

        {/* Services Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 mb-8"
        >
          <h2 className="text-xl font-bold text-primary mb-4">Services</h2>
          {salon.services?.length > 0 ? (
            <div className="space-y-3">
              {salon.services.map((service, idx) => (
                <div key={service.id || idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-accent transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-muted">{service.duration} mins</p>
                  </div>
                  <div className="font-bold text-primary">
                    ${service.price}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-white p-4 rounded-xl border border-gray-100">No services listed yet.</p>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 mb-8"
        >
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-primary">Reviews</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Star size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm font-medium">No reviews yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to share your experience after your visit!</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex gap-3 z-40">
        <Button 
          variant="outline" 
          className="flex-1 rounded-2xl py-4 font-bold text-base bg-white"
          onClick={handleJoinQueue}
          isLoading={isJoiningQueue}
        >
          Join Queue
        </Button>
        <Button 
          className="flex-1 rounded-2xl py-4 font-bold text-base bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20"
          onClick={() => setIsBookingModalOpen(true)}
        >
          Book Slot
        </Button>
      </div>

      {/* Modals */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        salon={salon}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
};

export default SalonDetails;
