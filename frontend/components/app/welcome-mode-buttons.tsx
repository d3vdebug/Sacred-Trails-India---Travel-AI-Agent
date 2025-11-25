'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/livekit/button';
import { Play, Zap } from 'lucide-react';

interface WelcomeModeButtonsProps {
  onStartMode: (mode: 'learn' | 'quiz' | 'teach_back') => void;
}

export default function WelcomeModeButtons({ onStartMode }: WelcomeModeButtonsProps) {
  const handleGetStarted = () => {
    console.log('WelcomeModeButtons - Get Started clicked, defaulting to learn mode');
    onStartMode('learn');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleGetStarted}
          className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-pink-300 via-purple-300 to-violet-300 hover:from-pink-400 hover:via-purple-400 hover:to-violet-400 group relative overflow-hidden hover:scale-105 text-gray-800 hover:text-gray-900"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Play className="size-5 group-hover:scale-110 transition-transform duration-300" />
              <Zap className="absolute -top-0.5 -right-0.5 size-3 text-yellow-300 animate-pulse" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">Start Learning</div>
              <div className="text-xs opacity-90 font-normal">
                
              </div>
            </div>
          </div>
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-center mt-6"
      >
        <p className="text-muted-foreground text-sm">
          You can switch between different modes anytime during your session using the mode buttons
        </p>
      </motion.div>
    </div>
  );
}