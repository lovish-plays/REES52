"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg text-center text-sm font-semibold leading-none transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 focus-visible:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border border-slate-200 bg-white/85 text-slate-900 shadow-sm hover:border-sky-300 hover:bg-white hover:text-sky-900",
        primary:
          "border border-sky-500/20 bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/15 hover:from-sky-500 hover:to-blue-500 active:scale-[0.98]",
        ghost: "bg-transparent text-slate-800 hover:bg-slate-600/10",
        destructive:
          "bg-rose-600/10 text-rose-900 border border-rose-500/20 hover:bg-rose-600/20",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-sm",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
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
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
