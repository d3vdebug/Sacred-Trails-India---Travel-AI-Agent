'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Users, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  location: string;
  image: string;
  description: string;
  rating: number;
  highlights: string[];
  bestTime: string;
  duration: string;
}

const destinations: Destination[] = [
  {
    id: 'goa',
    name: 'Goa',
    location: 'Western Coast, India',
    image: '/assets/goa.jpg',
    description: 'Famous for its pristine beaches, vibrant nightlife, and Portuguese heritage. Experience sun-kissed beaches, water sports, and delicious seafood.',
    rating: 4.5,
    highlights: ['Baga Beach', 'Basilica of Bom Jesus', 'Spice Plantations', 'Water Sports'],
    bestTime: 'November to February',
    duration: '3-5 days',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    location: 'Rajasthan, India',
    image: '/assets/jaipur.jpg',
    description: 'The Pink City offers royal palaces, ancient forts, and rich cultural heritage. Explore magnificent architecture and vibrant bazaars.',
    rating: 4.4,
    highlights: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar'],
    bestTime: 'October to March',
    duration: '2-4 days',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    location: 'Maharashtra, India',
    image: '/assets/mumbai.jpg',
    description: 'The City of Dreams combines Bollywood glamour with colonial architecture. Experience diverse culture, street food, and marine drives.',
    rating: 4.3,
    highlights: ['Gateway of India', 'Marine Drive', 'Film City', 'Crawford Market'],
    bestTime: 'October to February',
    duration: '2-3 days',
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    location: 'Karnataka, India',
    image: '/assets/bangalore.jpg',
    description: 'The Silicon Valley of India known for its tech culture, beautiful gardens, and vibrant nightlife. Explore modern attractions and rich history.',
    rating: 4.2,
    highlights: ['Bangalore Palace', 'Lal Bahadur Stadium', 'Cubbon Park', 'Vidhana Soudha'],
    bestTime: 'October to February',
    duration: '2-3 days',
  },
  {
    id: 'chennai',
    name: 'Chennai',
    location: 'Tamil Nadu, India',
    image: '/assets/chennai.jpg',
    description: 'The cultural capital of South India with beautiful beaches, temples, and classical arts. Experience traditional Tamil culture and modern Chennai.',
    rating: 4.1,
    highlights: ['Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George', 'Government Museum'],
    bestTime: 'October to March',
    duration: '2-3 days',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    location: 'Telangana, India',
    image: '/assets/hyderabad.jpg',
    description: 'The City of Pearls known for its rich history, mouth-watering biryani, and magnificent architecture. Explore forts, lakes, and bustling markets.',
    rating: 4.3,
    highlights: ['Charminar', 'Golconda Fort', 'Hussain Sagar Lake', 'Salar Jung Museum'],
    bestTime: 'October to March',
    duration: '2-3 days',
  },
  {
    id: 'kerala',
    name: 'Kerala',
    location: 'Southwest Coast, India',
    image: '/assets/kerala.jpg',
    description: 'God\'s Own Country with backwaters, hill stations, and pristine beaches. Experience Ayurveda, wildlife, and traditional culture.',
    rating: 4.6,
    highlights: ['Alleppey Backwaters', 'Munnar Hills', 'Kochi Fort', 'Wayanad Wildlife'],
    bestTime: 'October to March',
    duration: '5-7 days',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    location: 'West Bengal, India',
    image: '/assets/kolkata.jpg',
    description: 'The Cultural Capital of India with colonial architecture, art, literature, and mouth-watering street food. Experience rich Bengali culture.',
    rating: 4.0,
    highlights: ['Victoria Memorial', 'Howrah Bridge', 'Indian Museum', 'Mother Teresa\'s House'],
    bestTime: 'October to March',
    duration: '2-3 days',
  },
  {
    id: 'manali',
    name: 'Manali',
    location: 'Himachal Pradesh, India',
    image: '/assets/manali.jpg',
    description: 'Adventure paradise in the Himalayas with snow-capped peaks, adventure sports, and beautiful valleys. Perfect for nature lovers and adventurers.',
    rating: 4.4,
    highlights: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Beas River'],
    bestTime: 'March to June, December to February',
    duration: '3-5 days',
  },
  {
    id: 'shimla',
    name: 'Shimla',
    location: 'Himachal Pradesh, India',
    image: '/assets/shimla.jpg',
    description: 'The Queen of Hills with colonial architecture, toy train, and mountain views. Enjoy pleasant weather and romantic hill station charm.',
    rating: 4.2,
    highlights: ['The Ridge', 'Jakhu Temple', 'Mall Road', 'Kufri'],
    bestTime: 'March to June, December to February',
    duration: '2-3 days',
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    location: 'Rajasthan, India',
    image: '/assets/udaipur.jpg',
    description: 'The City of Lakes with stunning palaces, romantic settings, and beautiful lakes. Experience royal heritage and romantic boat rides.',
    rating: 4.5,
    highlights: ['City Palace', 'Lake Palace', 'Lake Pichola', 'Fateh Sagar Lake'],
    bestTime: 'September to March',
    duration: '2-3 days',
  },
];

interface DestinationCatalogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DestinationCatalog({ isOpen, onClose }: DestinationCatalogProps) {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Destination Catalog</h2>
                    <p className="text-blue-100">Discover amazing places to visit</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {selectedDestination ? (
                  // Detailed View
                  <div className="space-y-6">
                    <button
                      onClick={() => setSelectedDestination(null)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                      ← Back to destinations
                    </button>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <img
                          src={selectedDestination.image}
                          alt={selectedDestination.name}
                          className="w-full h-64 object-cover rounded-xl shadow-lg"
                        />
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {selectedDestination.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {selectedDestination.rating}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedDestination.name}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {selectedDestination.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Best Time</h4>
                            <p className="text-sm text-gray-600">{selectedDestination.bestTime}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Duration</h4>
                            <p className="text-sm text-gray-600">{selectedDestination.duration}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Highlights
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedDestination.highlights.map((highlight) => (
                              <div key={highlight} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm">
                                {highlight}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Grid View
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinations.map((destination) => (
                      <motion.div
                        key={destination.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDestination(destination)}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            src={destination.image}
                            alt={destination.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-medium">{destination.rating}</span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {destination.name}
                          </h3>
                          <div className="flex items-center gap-1 text-gray-600 mb-3">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">{destination.location}</span>
                          </div>
                          
                          <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                            {destination.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{destination.duration}</span>
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}