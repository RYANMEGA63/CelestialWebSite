import { ReactNode } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";

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
  const baseStyles =
    "relative inline-flex items-center justify-center font-body font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    // Solid sapphire — dominant CTA
    primary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    // Muted surface — secondary action
    secondary:
      "bg-muted text-foreground hover:bg-muted/80 border border-border/60",
    // Bordered — ghost-light
    outline:
      "border border-foreground/20 bg-transparent hover:border-secondary hover:text-secondary text-foreground",
    // Invisible until hovered
    ghost:
      "text-muted-foreground hover:bg-muted hover:text-foreground",
    // Danger
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes = {
    sm: "px-4 py-2 text-[11px] tracking-[0.12em]",
    md: "px-6 py-2.5 text-[12px] tracking-[0.1em]",
    lg: "px-8 py-4 text-[12px] tracking-[0.12em]",
  };

  // Uppercase label treatment — consistent with luxury editorial style
  const classes = `${baseStyles} uppercase ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="inline-block"
      >
        <Link to={href} target={target} rel={rel} className={classes}>
          <span className="flex items-center gap-2">{children}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      <span className="flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
