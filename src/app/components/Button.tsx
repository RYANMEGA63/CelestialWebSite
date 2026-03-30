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
  const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)]",
    secondary: "bg-muted text-foreground hover:bg-muted/80 border border-border/50",
    outline: "border border-border bg-transparent hover:bg-muted/50 text-foreground",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    destructive: "bg-destructive text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const Content = (
    <>
      {variant === "primary" && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear",
          }}
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-block"
      >
        <Link to={href} target={target} rel={rel} className={classes}>
          {Content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      {Content}
    </motion.button>
  );
}
