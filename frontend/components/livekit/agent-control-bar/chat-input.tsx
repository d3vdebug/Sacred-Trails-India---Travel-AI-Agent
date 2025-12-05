import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PaperPlaneRightIcon, SpinnerIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/livekit/button';
import { cn } from '@/lib/utils';

const MOTION_PROPS = {
  variants: {
    hidden: {
      height: 0,
      opacity: 0,
      marginBottom: 0,
    },
    visible: {
      height: 'auto',
      opacity: 1,
      marginBottom: 12,
    },
  },
  initial: 'hidden',
  transition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as const,
  },
};

interface ChatInputProps {
  chatOpen: boolean;
  isAgentAvailable?: boolean;
  onSend?: (message: string) => void;
}

export function ChatInput({
  chatOpen,
  isAgentAvailable = false,
  onSend = async () => {},
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSending(true);
      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const isDisabled = isSending || !isAgentAvailable || message.trim().length === 0;

  useEffect(() => {
    if (chatOpen && isAgentAvailable) return;
    // when not disabled refocus on input
    inputRef.current?.focus();
  }, [chatOpen, isAgentAvailable]);

  return (
    <motion.div
      inert={!chatOpen}
      {...MOTION_PROPS}
      animate={chatOpen ? 'visible' : 'hidden'}
      className="flex w-full items-start overflow-hidden"
    >
      <form
        onSubmit={handleSubmit}
        className="flex grow items-end gap-3 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex-1 relative">
          <input
            autoFocus
            ref={inputRef}
            type="text"
            value={message}
            disabled={!chatOpen}
            placeholder="Ask about travel destinations, packages, or bookings..."
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-12 px-5 pr-14 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-400 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 text-sm text-gray-800 placeholder:text-blue-400/70 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-connection-success/40 rounded-full animate-pulse"></div>
          </div>
        </div>
        <Button
          size="lg"
          type="submit"
          disabled={isDisabled}
          variant={isDisabled ? 'secondary' : 'default'}
          title={isSending ? 'Sending...' : 'Send message'}
          className={cn(
            "h-12 px-6 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl rounded-xl",
            !isDisabled && "transform hover:-translate-y-0.5"
          )}
        >
          {isSending ? (
            <SpinnerIcon className="animate-spin" weight="bold" />
          ) : (
            <PaperPlaneRightIcon weight="bold" />
          )}
        </Button>
      </form>
    </motion.div>
  );
}
