import { Button } from '@/components/livekit/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/livekit/select';
import { Plane, MapPin, Camera, Star, Globe, Users, Calendar, Phone, Mail, Menu, X } from 'lucide-react';
import { useSession } from '@/components/app/session-provider';
import { motion } from 'motion/react';
import WelcomeModeButtons from './welcome-mode-buttons';
import { useState } from 'react';

const MotionPlane = motion.create(Plane);

// Navigation Bar Component
function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Plane className="text-blue-600 size-8" />
            <span className="text-xl font-bold text-gray-900">Sacred Trails India</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#destinations" className="text-gray-700 hover:text-blue-600 transition-colors">Destinations</a>
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
            <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</a>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Book Now</Button>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <a href="#destinations" className="text-gray-700 hover:text-blue-600 py-2">Destinations</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 py-2">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 py-2">About</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 py-2">FAQ</a>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2">Book Now</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// FAQ Component
function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book a trip?",
      answer: "You can book a trip through our website, call us directly, or visit our office. Our agents will help you plan the perfect vacation."
    },
    {
      question: "What's included in your travel packages?",
      answer: "Our packages typically include flights, accommodation, some meals, and guided tours. Specific inclusions vary by destination and package type."
    },
    {
      question: "Do you offer travel insurance?",
      answer: "Yes, we offer comprehensive travel insurance options to protect your investment and ensure peace of mind during your travels."
    },
    {
      question: "Can you help with visa requirements?",
      answer: "Absolutely! Our experienced team assists with visa applications and provides guidance on entry requirements for your destination."
    },
    {
      question: "What if I need to cancel my trip?",
      answer: "Cancellation policies vary by package and timing. We recommend purchasing travel insurance and reviewing our terms before booking."
    },
    {
      question: "Do you offer group discounts?",
      answer: "Yes, we provide special rates for groups of 10 or more travelers. Contact us for customized group travel packages."
    }
  ];

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-blue-600">
                  {openFAQ === index ? '−' : '+'}
                </span>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroImage() {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 via-cyan-300/20 to-teal-300/20 rounded-full blur-xl"></div>
      <div className="relative">
        <MotionPlane 
          className="text-blue-600 size-20 mx-auto mb-4"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute -top-2 -right-2">
          <MapPin className="text-green-500 size-6 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Camera className="text-purple-500 size-6 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-1/2 -left-4">
          <Star className="text-yellow-400 size-5 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: (mode?: 'learn' | 'quiz' | 'teach_back') => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <NavBar />
      
      {/* Hero Section */}
      <section className="pt-16 flex flex-col items-center justify-center text-center h-[60vh] min-h-[500px] px-4">
        {/* Header with animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-300/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <HeroImage />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Your Dream Vacation Awaits
            </h1>

            <p className="text-gray-600 text-xl mb-2 font-medium">
              Expert travel planning and unforgettable experiences
            </p>

            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Discover amazing destinations with personalized travel packages, expert guides, and seamless planning for your perfect getaway.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                onClick={() => onStartCall()}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Plan My Trip
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </Button>
            </div>
          </motion.div>

          {/* Travel Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <MapPin className="size-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Destination Guides</h3>
              <p className="text-gray-600 text-sm">Expert recommendations for the world's best destinations</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Calendar className="size-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Custom Packages</h3>
              <p className="text-gray-600 text-sm">Tailored travel packages for every budget and preference</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Users className="size-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Round-the-clock assistance for peace of mind</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Mumbai, India", image: "/assets/mumbai.jpg", description: "The City of Dreams" },
              { name: "Jaipur, India", image: "/assets/jaipur.jpg", description: "Pink City of Royal Heritage" },
              { name: "Goa, India", image: "/assets/goa.jpg", description: "Paradise of Beaches" }
            ].map((destination, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback to gradient background if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.className = 'h-56 bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center';
                      target.parentElement!.innerHTML = `<span class="text-6xl">📍</span>`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-4">{destination.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    Explore Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: "Flight Booking", desc: "Best deals on flights worldwide" },
              { icon: MapPin, title: "Hotel Reservations", desc: "Handpicked accommodations" },
              { icon: Users, title: "Group Travel", desc: "Special rates for groups" },
              { icon: Star, title: "Travel Insurance", desc: "Comprehensive protection" }
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <service.icon className="size-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="text-blue-400 size-8" />
                <span className="text-xl font-bold">Sacred Trails India</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for unforgettable travel experiences around the world.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="mr-2 size-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 size-4" />
                  <span>info@wanderlust.com</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#destinations" className="block text-gray-400 hover:text-white transition-colors">Destinations</a>
                <a href="#services" className="block text-gray-400 hover:text-white transition-colors">Services</a>
                <a href="#faq" className="block text-gray-400 hover:text-white transition-colors">FAQ</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">About Us</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Sacred Trails India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

