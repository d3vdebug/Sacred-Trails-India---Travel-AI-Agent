import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'text-sm font-semibold tracking-wide whitespace-nowrap',
    'inline-flex items-center justify-center gap-2 shrink-0 rounded-xl cursor-pointer outline-none transition-all duration-200',
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
    'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
    'active:scale-95',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-muted text-foreground hover:bg-muted/80 hover:shadow-sm',
          'border border-border/50 hover:border-border',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90 hover:shadow-sm',
          'focus-visible:ring-destructive/50',
        ],
        outline: [
          'border-2 border-border bg-background',
          'hover:bg-accent hover:text-accent-foreground hover:border-accent',
          'dark:bg-background/50',
        ],
        primary: [
          'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground',
          'hover:from-primary/90 hover:to-primary hover:shadow-lg hover:shadow-primary/25',
          'focus-visible:ring-primary/50',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80 hover:shadow-sm',
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
          'dark:hover:bg-accent/50',
        ],
        link: [
          'text-primary underline-offset-4 hover:underline',
          'focus-visible:ring-primary/50',
        ],
        glass: [
          'glass text-foreground',
          'hover:bg-white/20 dark:hover:bg-black/20',
          'backdrop-blur-md',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs',
        lg: 'h-12 px-8 has-[>svg]:px-6 text-base',
        xl: 'h-14 px-10 has-[>svg]:px-8 text-lg',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
