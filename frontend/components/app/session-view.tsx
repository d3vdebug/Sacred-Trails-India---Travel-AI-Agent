'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import { DestinationCatalog } from '@/components/app/destination-catalog';
import BookingConfirmationPopup from '@/components/app/booking-confirmation-popup';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { LoadingIndicator, PulseIndicator } from '@/components/app/loading-indicator';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';

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

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: [0.4, 0, 0.2, 1] as const,
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}
interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const room = useRoomContext();
  const messages = useChatMessages();
  const [chatOpen, setChatOpen] = useState(true);
  const [destinationCatalogOpen, setDestinationCatalogOpen] = useState(false);
  const [bookingPopupOpen, setBookingPopupOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingDetails | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: false,
    screenShare: false,
  };

  // Listen for booking confirmation data messages
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array, participant?: any, kind?: DataPacket_Kind, topic?: string) => {
      if (topic === 'booking') {
        try {
          const decoder = new TextDecoder();
          const message = JSON.parse(decoder.decode(payload));
          
          if (message.type === 'booking_confirmed' && message.data) {
            console.log('Received booking confirmation:', message.data);
            setBookingData(message.data);
            setBookingPopupOpen(true);
          }
        } catch (error) {
          console.error('Error parsing booking data:', error);
        }
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  // Also detect booking data from chat messages (fallback)
  const processedBookingIds = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (!lastMessage || lastMessage.from?.isLocal) return;
    
    const messageText = lastMessage.message || '';
    const bookingDataMatch = messageText.match(/\[BOOKING_DATA\]([\s\S]*?)\[\/BOOKING_DATA\]/);
    
    if (bookingDataMatch) {
      try {
        const bookingJson = JSON.parse(bookingDataMatch[1]);
        // Only show popup if we haven't processed this booking ID yet
        if (!processedBookingIds.current.has(bookingJson.booking_id)) {
          processedBookingIds.current.add(bookingJson.booking_id);
          console.log('Detected booking from chat message:', bookingJson);
          setBookingData(bookingJson);
          setBookingPopupOpen(true);
        }
      } catch (error) {
        console.error('Error parsing booking data from message:', error);
      }
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      // Force immediate scroll to bottom when new message is sent
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      
      // Also set a timeout to ensure scroll happens after any animations
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <section className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-100/90 via-cyan-100/90 to-teal-100/90 backdrop-blur-sm rounded-full px-4 py-2 border-2 border-blue-200/60 shadow-lg">
        <PulseIndicator active={hasMessages} color="success" />
        <span className="text-xs font-medium text-muted-foreground">Connected</span>
      </div>

      {/* Destination Catalog Trigger */}
      <div className="fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDestinationCatalogOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white px-4 py-2 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-sm transition-all duration-200"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Destinations</span>
        </motion.button>
      </div>

      {/* Chat Transcript */}
      <div
        className={cn(
          'fixed inset-0 grid grid-cols-1 grid-rows-1 mb-20',
          !chatOpen && 'pointer-events-none'
        )}
      >
        <Fade top className="absolute inset-x-4 top-0 h-40" />
        <ScrollArea ref={scrollAreaRef} className="px-4 pt-32 pb-[300px] md:px-6 md:pb-[180px]">
          {!hasMessages && chatOpen ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <LoadingIndicator 
                message="Connecting to agent..." 
                size="sm"
                className="text-center"
              />
            </div>
          ) : (
            <ChatTranscript
              hidden={false}
              messages={messages}
              className={cn(
                "mx-auto max-w-2xl space-y-3 transition-all duration-300 ease-out",
                !chatOpen && "opacity-60 scale-[0.98]",
                chatOpen && "opacity-100 scale-100"
              )}
            />
          )}
        </ScrollArea>
      </div>

      {/* Tile Layout */}
      <TileLayout chatOpen={chatOpen} />

      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className=" relative mx-auto max-w-2xl md:pb-12  ">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar controls={controls} onChatOpenChange={setChatOpen} chatOpen={chatOpen} />
        </div>
      </MotionBottom>

      {/* Destination Catalog Modal */}
      <DestinationCatalog
        isOpen={destinationCatalogOpen}
        onClose={() => setDestinationCatalogOpen(false)}
      />

      {/* Booking Confirmation Popup */}
      {bookingData && (
        <BookingConfirmationPopup
          isOpen={bookingPopupOpen}
          onClose={() => setBookingPopupOpen(false)}
          bookingData={bookingData}
        />
      )}
    </section>
  );
};

