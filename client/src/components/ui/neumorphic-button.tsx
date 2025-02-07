import * as React from "react";
import { cn } from "@/lib/utils";

interface NeumorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "raised" | "pressed" | "switch";
  isActive?: boolean;
}

const NeumorphicButton = React.forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ className, variant = "raised", isActive = false, ...props }, ref) => {
    const baseStyles = "relative transition-all duration-200 disabled:opacity-50";
    const variantStyles = {
      raised: "shadow-neumorphic-outer active:shadow-neumorphic-pressed active:translate-y-0.5",
      pressed: "shadow-neumorphic-pressed",
      switch: cn(
        "shadow-neumorphic-outer",
        isActive && "shadow-neumorphic-pressed bg-surface-pressed"
      ),
    };

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          "bg-surface hover:bg-surface/90 rounded-xl px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

NeumorphicButton.displayName = "NeumorphicButton";

export { NeumorphicButton };
