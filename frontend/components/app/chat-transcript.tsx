'use client';

import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/livekit/chat-entry';

const MotionContainer = motion.create('div');
const MotionChatEntry = motion.create(ChatEntry);

const CONTAINER_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        ease: 'easeOut',
        duration: 0.2,
        stagerDelay: 0.1,
        staggerChildren: 0.05,
        staggerDirection: 1,
      },
    },
  },
  initial: 'visible',
  animate: 'visible',
  exit: 'hidden',
};

const MESSAGE_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      translateY: 10,
    },
    visible: {
      opacity: 1,
      translateY: 0,
    },
  },
};

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedChatMessage[];
  className?: string;
}

export function ChatTranscript({
  hidden = false,
  messages = [],
  className,
}: ChatTranscriptProps) {
  if (hidden) return null;

  return (
    <div className={className}>
      <AnimatePresence>
        {messages.map(({ id, timestamp, from, message, editTimestamp }: ReceivedChatMessage) => {
          const locale = navigator?.language ?? 'en-US';
          const messageOrigin = from?.isLocal ? 'local' : 'remote';
          const hasBeenEdited = !!editTimestamp;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatEntry
                locale={locale}
                timestamp={timestamp}
                message={message}
                messageOrigin={messageOrigin}
                hasBeenEdited={hasBeenEdited}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
