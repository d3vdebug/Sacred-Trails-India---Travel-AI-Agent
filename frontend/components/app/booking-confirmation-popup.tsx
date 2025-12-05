import React from 'react';
import { Button } from '@/components/livekit/button';
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Hotel, 
  Plane, 
  CreditCard,
  Star,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Download,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingDetails {
  booking_id: string;
  user_name: string;
  destination: string;
  travel_mode: string;
  hotel_name: string;
  dates: string;
  num_travelers: number;
  total_cost: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  timestamp: string;
  hotel_rating?: number;
  hotel_amenities?: string[];
  hotel_description?: string;
  hotel_price_per_night?: number;
}

interface BookingConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingDetails;
}

const BookingConfirmationPopup: React.FC<BookingConfirmationPopupProps> = ({
  isOpen,
  onClose,
  bookingData
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const bookingDetails = `
BOOKING CONFIRMATION - Sacred Trails India
==========================================

Booking ID: ${bookingData.booking_id}
Status: ${bookingData.status.toUpperCase()}
Booked on: ${new Date(bookingData.timestamp).toLocaleDateString()}

CUSTOMER DETAILS
===============
Name: ${bookingData.user_name}

TRIP DETAILS
============
Destination: ${bookingData.destination}
Travel Mode: ${bookingData.travel_mode}
Travel Dates: ${bookingData.dates}
Number of Travelers: ${bookingData.num_travelers}

ACCOMMODATION
=============
Hotel: ${bookingData.hotel_name}
${bookingData.hotel_rating ? `Rating: ${'★'.repeat(bookingData.hotel_rating)} (${bookingData.hotel_rating}/5)` : ''}
${bookingData.hotel_price_per_night ? `Price per night: ₹${bookingData.hotel_price_per_night.toLocaleString()}` : ''}
${bookingData.hotel_amenities ? `Amenities: ${bookingData.hotel_amenities.join(', ')}` : ''}
${bookingData.hotel_description ? `Description: ${bookingData.hotel_description}` : ''}

COST BREAKDOWN
==============
Total Cost: ₹${bookingData.total_cost.toLocaleString()}

Thank you for booking with Sacred Trails India!
For support: +1 (555) 123-4567 | info@wanderlust.com
    `.trim();

    const blob = new Blob([bookingDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${bookingData.booking_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateNights = () => {
    try {
      // Simple calculation - in real app, you'd parse the dates properly
      return Math.floor(Math.random() * 7) + 3; // Random 3-10 nights for demo
    } catch {
      return 5; // Default fallback
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Booking Confirmed!</h2>
                <p className="text-blue-100 text-sm">Your travel adventure is confirmed</p>
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(bookingData.status)} bg-white/20 border-white/30 text-white`}>
                {getStatusIcon(bookingData.status)}
                <span className="capitalize">{bookingData.status}</span>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking ID</p>
                  <p className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">#{bookingData.booking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Destination</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                    {bookingData.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
                  <p className="font-bold text-lg text-green-600 dark:text-green-400">₹{bookingData.total_cost.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Customer & Trip Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Customer Details
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{bookingData.user_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Travelers</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{bookingData.num_travelers} {bookingData.num_travelers === 1 ? 'person' : 'people'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Booked On</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(bookingData.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-cyan-600" />
                  Trip Details
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Travel Mode</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Plane className="h-4 w-4 mr-1 text-cyan-600" />
                        {bookingData.travel_mode.charAt(0).toUpperCase() + bookingData.travel_mode.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Travel Dates</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{bookingData.dates}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{calculateNights()} nights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodation Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Hotel className="h-5 w-5 mr-2 text-teal-600" />
                Accommodation Details
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{bookingData.hotel_name}</h4>
                      {bookingData.hotel_rating && (
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < bookingData.hotel_rating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {bookingData.hotel_rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                    {bookingData.hotel_price_per_night && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Per night</p>
                        <p className="font-bold text-teal-600 dark:text-teal-400">₹{bookingData.hotel_price_per_night.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {bookingData.hotel_description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{bookingData.hotel_description}</p>
                  )}
                  
                  {bookingData.hotel_amenities && bookingData.hotel_amenities.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {bookingData.hotel_amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Cost Breakdown
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">Accommodation ({calculateNights()} nights)</span>
                    <span className="font-semibold">
                      ₹{bookingData.hotel_price_per_night 
                        ? (bookingData.hotel_price_per_night * calculateNights()).toLocaleString() 
                        : Math.round(bookingData.total_cost * 0.6).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">Transportation</span>
                    <span className="font-semibold">
                      ₹{Math.round(bookingData.total_cost * 0.3).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">Meals & Activities</span>
                    <span className="font-semibold">
                      ₹{Math.round(bookingData.total_cost * 0.1).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg font-bold border-t-2 border-blue-200 dark:border-blue-800">
                    <span className="text-gray-900 dark:text-gray-100">Total Amount</span>
                    <span className="text-green-600 dark:text-green-400">₹{bookingData.total_cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Mail className="h-4 w-4 mr-2 text-cyan-600" />
                  <span>info@wanderlust.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Details
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              className="flex-1 border-cyan-200 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Save Details
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingConfirmationPopup;