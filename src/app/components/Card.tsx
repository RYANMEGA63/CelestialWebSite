import { ReactNode, useState, useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  overflowVisible?: boolean;
}

export function Card({ children, className = "", hover = false, gradient = false, overflowVisible = false }: CardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const baseStyles = `bg-card rounded-2xl border border-border/50 ${overflowVisible ? "" : "overflow-hidden"}`;
  const shadowStyles = "shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative ${baseStyles} ${shadowStyles} ${hover ? "transition-all duration-300 hover:-translate-y-1 hover:border-primary/30" : ""} ${className}`}
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(99, 102, 241, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`px-8 pb-8 pt-0 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`p-8 pt-0 ${className}`}>{children}</div>;
}
