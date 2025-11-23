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
        className="flex grow items-end gap-3 p-2 bg-muted/30 rounded-xl border border-border/50"
      >
        <div className="flex-1 relative">
          <input
            autoFocus
            ref={inputRef}
            type="text"
            value={message}
            disabled={!chatOpen}
            placeholder="Type your message..."
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-10 px-4 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 text-sm placeholder:text-muted-foreground/60"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
          </div>
        </div>
        <Button
          size="lg"
          type="submit"
          disabled={isDisabled}
          variant={isDisabled ? 'secondary' : 'primary'}
          title={isSending ? 'Sending...' : 'Send message'}
          className={cn(
            "h-10 px-6 transition-all duration-200 hover:scale-105",
            !isDisabled && "shadow-lg hover:shadow-xl"
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
