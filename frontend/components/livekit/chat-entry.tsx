import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChatEntryProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The locale to use for the timestamp. */
  locale: string;
  /** The timestamp of the message. */
  timestamp: number;
  /** The message to display. */
  message: string;
  /** The origin of the message. */
  messageOrigin: 'local' | 'remote';
  /** The sender's name. */
  name?: string;
  /** Whether the message has been edited. */
  hasBeenEdited?: boolean;
}

export const ChatEntry = ({
  name,
  locale,
  timestamp,
  message,
  messageOrigin,
  hasBeenEdited = false,
  className,
  ...props
}: ChatEntryProps) => {
  const time = new Date(timestamp);
  const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

  return (
    <li
      title={title}
      data-lk-message-origin={messageOrigin}
      className={cn('group flex w-full flex-col gap-2 animate-in slide-in-from-bottom-2', className)}
      {...props}
    >
      <header
        className={cn(
          'flex items-center gap-2 text-xs',
          messageOrigin === 'local' ? 'flex-row-reverse justify-end' : 'justify-start'
        )}
      >
        {name && (
          <div className={cn(
            'flex items-center gap-2',
            messageOrigin === 'local' ? 'flex-row-reverse' : 'flex-row'
          )}>
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
              messageOrigin === 'local' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-emerald-500/20 text-emerald-600'
            )}>
              {messageOrigin === 'remote' ? '🌱' : name?.charAt(0).toUpperCase()}
            </div>
            <strong className="text-sm text-foreground">
              {messageOrigin === 'remote' ? 'Wellness Companion' : name}
            </strong>
          </div>
        )}
        <div className={cn(
          'flex items-center gap-1 text-muted-foreground/70',
          messageOrigin === 'local' ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {hasBeenEdited && 'edited '}
            {time.toLocaleTimeString(locale, { timeStyle: 'short' })}
          </span>
        </div>
      </header>
      
      <div className={cn(
        'flex w-full',
        messageOrigin === 'local' ? 'justify-end' : 'justify-start'
      )}>
        <div
          className={cn(
            'max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200',
            'hover:shadow-md hover:scale-[1.02]',
            messageOrigin === 'local' 
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white ml-auto shadow-lg' 
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 text-blue-900 mr-auto shadow-sm'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
      </div>
    </li>
  );
};
