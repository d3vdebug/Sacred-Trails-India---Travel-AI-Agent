import { Button } from '@/components/livekit/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/livekit/select';
import { Coffee, Mic, Waves, Sparkles } from 'lucide-react';
import { useSession } from '@/components/app/session-provider';
import { motion } from 'motion/react';

const MotionCoffee = motion.create(Coffee);

function WelcomeImage() {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-amber-400/20 to-yellow-400/20 rounded-full blur-xl"></div>
      <div className="relative">
        <MotionCoffee 
          className="text-orange-500 size-20 mx-auto mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute -top-2 -right-2">
          <Sparkles className="text-yellow-400 size-6 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Waves className="text-blue-400 size-6 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-1/2 -left-4">
          <Mic className="text-purple-400 size-5 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref}>
      <section className="bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center text-center min-h-screen px-4">
        {/* Header with animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto">
          <WelcomeImage />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent mb-4">
              CodeCafe AI
            </h1>
            
            <p className="text-muted-foreground text-lg mb-2 font-medium">
              Order your desired coffee with the help of our AI
            </p>
            
            <p className="text-muted-foreground/80 text-sm mb-8 leading-relaxed">
              Connect with an intelligent AI agent powered by advanced voice recognition and natural language processing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onStartCall} 
              className="w-full md:w-80 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              
              ORDER NOW
              <Mic className="mr-2 size-5" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Mic className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Voice Recognition</h3>
              <p className="text-xs text-muted-foreground">Fast speech processing</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-500/10 p-3 rounded-full mb-3">
                <Waves className="size-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Real-time Chat</h3>
              <p className="text-xs text-muted-foreground">Instant responses</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-purple-500/10 p-3 rounded-full mb-3">
                <Sparkles className="size-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-sm mb-1">AI Powered</h3>
              <p className="text-xs text-muted-foreground">Intelligent responses</p>
            </div>
          </motion.div>
        </div>

        {/* Help link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="fixed bottom-6 left-0 flex w-full items-center justify-center"
        >
          <p className="text-muted-foreground text-xs leading-5">
            Need help getting set up?{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents/start/voice-ai/"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              Check the quickstart guide
            </a>
          </p>
        </motion.div>
      </section>
    </div>
  );
};

