import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingIndicator({ 
  message = 'Loading...', 
  size = 'md',
  className 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('flex flex-col items-center justify-center gap-3 p-6', className)}
    >
      {/* Pulsing dots animation */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'bg-primary rounded-full',
              sizeClasses[size]
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground font-medium"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

// Dots loading for small spaces
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1 items-center', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Pulse indicator for connection status
export function PulseIndicator({ 
  active, 
  color = 'primary' 
}: { 
  active: boolean; 
  color?: 'primary' | 'success' | 'warning' | 'error';
}) {
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-destructive'
  };

  return (
    <motion.div
      className={cn(
        'w-2 h-2 rounded-full',
        colorClasses[color]
      )}
      animate={{
        scale: active ? [1, 1.2, 1] : 1,
        opacity: active ? [0.7, 1, 0.7] : 0.5,
      }}
      transition={{
        duration: 1.5,
        repeat: active ? Infinity : 0,
        ease: 'easeInOut',
      }}
    />
  );
}