import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        // Gold — primary action (also available as explicit 'gold' variant)
        default:
          'bg-gold-gradient text-charcoal-900 shadow-gold-sm hover:shadow-gold hover:-translate-y-0.5',
        gold:
          'bg-gold-gradient text-charcoal-900 shadow-gold-sm hover:shadow-gold hover:-translate-y-0.5',
        // Charcoal dark
        dark:
          'bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-card hover:shadow-card-hover',
        // Outlined with gold border
        outline:
          'border-2 border-gold-400 text-gold-600 dark:text-gold-400 bg-transparent hover:bg-gold-gradient hover:text-charcoal-900 hover:border-transparent',
        // Subtle secondary
        secondary:
          'bg-muted text-foreground hover:bg-muted/70',
        // Ghost
        ghost:
          'hover:bg-muted text-foreground',
        // Text link
        link:
          'text-gold-600 dark:text-gold-400 underline-offset-4 hover:underline p-0 h-auto',
        // Keep red for destructive / error
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
        red:
          'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
        // White card button
        white:
          'bg-white text-charcoal-900 hover:bg-gold-50 shadow-card hover:shadow-gold-sm border border-gold-200/50',
        // Amber (legacy alias → gold)
        amber:
          'bg-gold-gradient text-charcoal-900 shadow-gold-sm hover:shadow-gold hover:-translate-y-0.5',
        // Outline on dark backgrounds
        'outline-white':
          'border-2 border-white/30 text-white bg-transparent hover:bg-white/10',
        // Legacy aliases kept for compatibility
        'outline-red':
          'border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-8 rounded-lg px-3 text-xs',
        lg:      'h-12 rounded-xl px-8 text-base',
        xl:      'h-14 rounded-2xl px-10 text-base',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
