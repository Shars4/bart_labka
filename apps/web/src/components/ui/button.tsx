import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

// Pill-shaped buttons; the default size keeps a 44px touch target.
const variants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.1em]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-tennis-strong active:bg-tennis-strong',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-[#d9e5ff]',
        outline:
          'border-ink/25 bg-background text-foreground hover:border-ink/45 hover:bg-mist',
        ghost: 'text-foreground hover:bg-mist',
        destructive:
          'bg-destructive text-white hover:bg-[#a51f25] active:bg-[#a51f25]',
        link: 'h-auto rounded-none px-0 text-foreground underline decoration-ink/30 underline-offset-4 hover:decoration-ink',
      },
      size: {
        default: 'h-11 px-5 text-[0.95rem]',
        sm: 'h-11 px-4 text-sm sm:h-9',
        lg: 'h-12 px-6 text-base',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * Class names for a button look, also used to style links as buttons.
 * Merged with cn, so a passed className (e.g. "hidden md:inline-flex")
 * reliably overrides the base classes instead of depending on CSS order.
 */
function buttonVariants({
  className,
  ...props
}: VariantProps<typeof variants> & { className?: string } = {}) {
  return cn(variants(props), className);
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: Omit<ButtonPrimitive.Props, 'className'> &
  VariantProps<typeof variants> & { className?: string }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

export { Button, buttonVariants };
