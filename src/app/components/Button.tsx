import { ReactNode } from "react";
import { Link } from "react-router";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  target,
  rel,
}: ButtonProps) {
  // Base: compact, angular, no transition — desktop-native feel
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium select-none disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    // Gold — primary CTA (Celestial accent)
    primary:
      "bg-golden text-golden-foreground border border-[#A07800] hover:bg-[#C8A800] active:bg-[#B09000]",
    // Raised gray button — standard VCL style
    secondary:
      "bg-muted text-foreground bevel-raised hover:bg-[#D0CCC4] active:bg-[#B8B4AC] active:bevel-sunken",
    // Bordered, transparent — outline action
    outline:
      "border border-border bg-card text-foreground hover:bg-muted active:bg-[#B8B4AC]",
    // No background — toolbar ghost button
    ghost:
      "bg-transparent text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground hover:border-border",
    // Danger — destructive action
    destructive:
      "bg-destructive text-destructive-foreground border border-[#990000] hover:bg-[#AA0000] active:bg-[#880000]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-3 py-1 text-[12px] gap-1.5",
    lg: "px-4 py-1.5 text-[13px] gap-2",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link to={href} target={target} rel={rel} className={classes}>
        <span className="flex items-center gap-1.5">{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      <span className="flex items-center gap-1.5">{children}</span>
    </button>
  );
}
