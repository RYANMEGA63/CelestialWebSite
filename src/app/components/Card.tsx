import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  overflowVisible?: boolean;
  title?: string; // Optional GroupBox-style title in header bar
}

export function Card({
  children,
  className = "",
  hover = false,
  overflowVisible = false,
  title,
}: CardProps) {
  return (
    <div
      className={`
        relative bg-card border border-border
        ${overflowVisible ? "" : "overflow-hidden"}
        ${hover ? "hover:border-golden hover:bg-[#F0EDE0]" : ""}
        ${className}
      `}
    >
      {/* Optional GroupBox-style header */}
      {title && (
        <div className="iup-panel-header">
          {title}
        </div>
      )}
      <div className="relative h-full">
        {children}
      </div>
    </div>
  );
}

interface CardHeaderProps { children: ReactNode; className?: string; }
export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-3 py-2 border-b border-border bg-toolbar ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps { children: ReactNode; className?: string; }
export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-3 ${className}`}>{children}</div>;
}

interface CardFooterProps { children: ReactNode; className?: string; }
export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`px-3 py-2 border-t border-border bg-toolbar flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}
