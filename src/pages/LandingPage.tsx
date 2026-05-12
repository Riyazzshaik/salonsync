
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Clock, MapPin, CalendarCheck } from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-accent/30 selection:text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Live Queue Tracking Now Available
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6 leading-tight">
              Skip the wait. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Book smarter.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-muted mb-10 max-w-2xl leading-relaxed">
              Find premium salons nearby, check live wait times, and reserve your perfect slot instantly. Experience the future of personal grooming.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto gap-2 group text-base">
                  Find Salons
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Join as Salon Owner
                </Button>
              </Link>
            </motion.div>

            {/* Dashboard Mockup / Stats */}
            <motion.div variants={itemVariants} className="mt-20 relative w-full perspective-1000">
              <div className="rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-x-12 scale-95 hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out">
                <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000" alt="App Preview" className="w-full h-auto object-cover opacity-90 mix-blend-multiply" style={{ maxHeight: '600px' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why choose SalonSync?</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">We've redesigned the booking experience from the ground up to save you time and provide a premium experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Clock className="w-6 h-6 text-accent" />, title: "Live Queue Tracking", desc: "See real-time wait times before you leave your house. Never wait in a lobby again." },
              { icon: <MapPin className="w-6 h-6 text-accent" />, title: "Discover Nearby", desc: "Find the best-rated salons in your area with verified reviews and detailed service menus." },
              { icon: <CalendarCheck className="w-6 h-6 text-accent" />, title: "Instant Booking", desc: "Reserve your spot with a few taps. Get instant confirmations and smart reminders." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-8 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-muted leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
