import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, Loader2, ArrowRight, ArrowLeft, Phone, Image as ImageIcon, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { SalonService } from '../services/salons/salonService';
import { handleError } from '../utils/errorHandler';

type RegistrationStep = 'basic' | 'contact' | 'business' | 'media';

const AMENITIES = ['AC Available', 'Parking', 'WiFi', 'Card Payment', 'UPI Payment', 'Home Service', 'Waiting Area', 'Walk-in Supported'];
const CATEGORIES = ['Hair Salon', 'Beauty Parlour', 'Nail Studio', 'Spa & Massage', 'Unisex Salon'];

export default function SalonRegistration() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    // Basic
    name: '',
    description: '',
    category: 'Hair Salon',
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    
    // Contact
    phone: '',
    whatsapp: '',
    instagram: '',
    website: '',
    
    // Business
    openingHours: '09:00 AM',
    closingHours: '09:00 PM',
    queueCapacity: '10',
    features: [] as string[],
    
    // Media
    logoImage: '',
    bannerImage: '',
    gallery1: '',
    gallery2: ''
  });

  const handleNext = (next: RegistrationStep) => {
    setErrorMsg('');
    // Simple Validation before moving next
    if (currentStep === 'basic') {
      if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
        setErrorMsg('Please fill all required basic fields.');
        return;
      }
      if (isNaN(Number(formData.latitude)) || isNaN(Number(formData.longitude))) {
        setErrorMsg('Latitude and Longitude must be valid numbers.');
        return;
      }
    }
    if (currentStep === 'contact') {
      if (!formData.phone) {
        setErrorMsg('Phone number is required.');
        return;
      }
      // Simple regex for Indian phone numbers as placeholder constraint
      const phoneRegex = /^\+?[0-9\s]{10,14}$/;
      if (!phoneRegex.test(formData.phone) || (formData.whatsapp && !phoneRegex.test(formData.whatsapp))) {
        setErrorMsg('Please enter a valid phone number format.');
        return;
      }
    }
    
    setCurrentStep(next);
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature) 
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    
    setIsSubmitting(true);
    try {
      const galleryImages = [formData.gallery1, formData.gallery2].filter(img => img.trim() !== '');
      
      const salonPayload = {
        ownerId: userData.uid,
        adminApproved: false,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        website: formData.website,
        features: formData.features,
        openingHours: formData.openingHours,
        closingHours: formData.closingHours,
        queueCapacity: Number(formData.queueCapacity),
        logoImage: formData.logoImage || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=150',
        bannerImage: formData.bannerImage || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1000',
        galleryImages: galleryImages,
        
        // Default init values
        queueLength: 0,
        averageServiceTime: 20,
        estimatedWaitTime: 0,
        rating: 5.0,
        openStatus: false,
        services: [], // Empty initially, added in dashboard later
        images: [], // Deprecated
        image: formData.bannerImage || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1000',
        createdAt: new Date().toISOString()
      };

      await SalonService.registerSalon(salonPayload);
      
      alert("Registration submitted! Pending Admin Approval.");
      navigate('/owner/dashboard');
    } catch (error) {
      handleError("SalonRegistration.submit", error);
      alert("Failed to submit registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-12 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Salon</h1>
          <p className="text-gray-500">Join the marketplace and manage your business.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {['basic', 'contact', 'business', 'media'].map((step, idx) => (
            <div key={step} className={`h-2 flex-1 rounded-full ${
              ['basic', 'contact', 'business', 'media'].indexOf(currentStep) >= idx ? 'bg-primary' : 'bg-gray-100'
            }`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            
            {currentStep === 'basic' && (
              <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-4 flex items-center"><Store className="mr-2 text-primary" size={20} /> Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salon Name *</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input required type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                      <input required type="number" step="any" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 12.9716" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                      <input required type="number" step="any" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 77.5946" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                    </div>
                  </div>
                  <Button type="button" onClick={() => handleNext('contact')} className="w-full py-4 mt-4">Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-4 flex items-center"><Phone className="mr-2 text-primary" size={20} /> Contact Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="+91 9876543210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="919876543210 (include country code)" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                    <p className="text-xs text-gray-500 mt-1">Used for direct WhatsApp booking requests.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Link (Optional)</label>
                    <input type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="https://instagram.com/your_salon" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep('basic')} className="w-1/3 py-4"><ArrowLeft className="mr-2 w-4 h-4" /> Back</Button>
                    <Button type="button" onClick={() => handleNext('business')} className="w-2/3 py-4">Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'business' && (
              <motion.div key="business" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-4 flex items-center"><Clock className="mr-2 text-primary" size={20} /> Business Profile</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                      <input type="time" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.openingHours} onChange={e => setFormData({...formData, openingHours: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                      <input type="time" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.closingHours} onChange={e => setFormData({...formData, closingHours: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Queue Capacity (Max people)</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" value={formData.queueCapacity} onChange={e => setFormData({...formData, queueCapacity: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 mt-4">Amenities & Features</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map(feature => (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => toggleFeature(feature)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                            formData.features.includes(feature)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                          }`}
                        >
                          {formData.features.includes(feature) && <CheckCircle size={14} className="inline mr-1.5" />}
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep('contact')} className="w-1/3 py-4"><ArrowLeft className="mr-2 w-4 h-4" /> Back</Button>
                    <Button type="button" onClick={() => handleNext('media')} className="w-2/3 py-4">Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'media' && (
              <motion.div key="media" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-4 flex items-center"><ImageIcon className="mr-2 text-primary" size={20} /> Media Uploads</h2>
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6">
                  For this early stage, please provide direct image URLs. Full Firebase Storage file uploads will be activated in the next phase.
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                    <input type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." value={formData.bannerImage} onChange={e => setFormData({...formData, bannerImage: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Image 1 URL</label>
                    <input type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." value={formData.gallery1} onChange={e => setFormData({...formData, gallery1: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Image 2 URL</label>
                    <input type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." value={formData.gallery2} onChange={e => setFormData({...formData, gallery2: e.target.value})} />
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep('business')} className="w-1/3 py-4"><ArrowLeft className="mr-2 w-4 h-4" /> Back</Button>
                    <Button 
                      type="submit" 
                      className="w-2/3 py-4 bg-green-600 hover:bg-green-700 border-none text-white shadow-lg shadow-green-600/20"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Complete Registration"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}
