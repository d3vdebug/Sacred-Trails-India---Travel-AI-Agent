import { Button } from '@/components/livekit/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/livekit/select';
import { BookOpen, Brain, GraduationCap, Lightbulb, Users, Target } from 'lucide-react';
import { useSession } from '@/components/app/session-provider';
import { motion } from 'motion/react';
import WelcomeModeButtons from './welcome-mode-buttons';

const MotionBookOpen = motion.create(BookOpen);

function WelcomeImage() {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300/20 via-purple-300/20 to-violet-300/20 rounded-full blur-xl"></div>
      <div className="relative">
        <MotionBookOpen 
          className="text-blue-500 size-20 mx-auto mb-4"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute -top-2 -right-2">
          <Brain className="text-purple-500 size-6 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Lightbulb className="text-yellow-400 size-6 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-1/2 -left-4">
          <GraduationCap className="text-indigo-400 size-5 animate-pulse" style={{ animationDelay: '2s' }} />
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
    <div ref={ref}>
      <section className="bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center text-center min-h-screen px-4">
        {/* Header with animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto">
          <WelcomeImage />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent mb-3">
              Programming Tutor
            </h1>
            
            <p className="text-muted-foreground text-lg mb-2 font-medium">
              Your intelligent learning companion
            </p>
            
            <p className="text-muted-foreground/80 text-sm mb-6 leading-relaxed">
              Master new concepts through interactive learning and personalized tutoring sessions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <WelcomeModeButtons onStartMode={onStartCall} />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
          >
            <div className="flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
              <div className="bg-pink-200/60 p-2.5 rounded-full mb-2">
                <Brain className="size-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Smart Learning Mode</h3>
              <p className="text-xs text-muted-foreground">AI-powered personalized lessons</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
              <div className="bg-purple-200/60 p-2.5 rounded-full mb-2">
                <Target className="size-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Interactive Quiz Mode</h3>
              <p className="text-xs text-muted-foreground">Test your knowledge</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
              <div className="bg-violet-200/60 p-2.5 rounded-full mb-2">
                <Users className="size-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Teach Back Mode</h3>
              <p className="text-xs text-muted-foreground">Learn by explaining concepts</p>
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

