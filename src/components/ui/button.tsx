import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Colorful gradient variants
        gradient: "bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white hover:from-blue-500 hover:via-purple-400 hover:to-pink-400 shadow-lg hover:shadow-[0_10px_40px_rgba(139,92,246,0.3)] hover:-translate-y-0.5",
        gradientOcean: "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white hover:brightness-110 shadow-lg hover:shadow-[0_10px_40px_rgba(6,182,212,0.3)] hover:-translate-y-0.5",
        gradientCoral: "bg-gradient-to-r from-rose-500 via-coral to-orange-500 text-white hover:brightness-110 shadow-lg hover:shadow-[0_10px_40px_rgba(255,107,107,0.3)] hover:-translate-y-0.5",
        gradientGold: "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-400 text-white hover:brightness-110 shadow-lg hover:shadow-[0_10px_40px_rgba(245,158,11,0.3)] hover:-translate-y-0.5",
        gradientPurple: "bg-gradient-to-r from-purple-600 via-violet-500 to-pink-500 text-white hover:brightness-110 shadow-lg hover:shadow-[0_10px_40px_rgba(139,92,246,0.3)] hover:-translate-y-0.5",
        // Glow outline variants
        glowBlue: "border-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]",
        glowPurple: "border-2 border-purple-500 text-purple-600 dark:text-purple-400 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]",
        glowCoral: "border-2 border-coral text-coral bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:shadow-[0_0_20px_rgba(255,107,107,0.4)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
