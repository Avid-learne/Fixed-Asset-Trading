import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  const hoverEffect = hover ? "hover:shadow-lg hover:-translate-y-1 transition-all duration-200" : "";
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
}