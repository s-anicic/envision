"use client";

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props
}: ButtonProps) => {
  
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-stone-800 text-white hover:bg-stone-700 shadow-sm hover:shadow disabled:hover:bg-stone-800",
    secondary: "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm",
    ghost: "text-stone-500 hover:bg-stone-100 hover:text-stone-800",
    danger: "text-red-500 hover:bg-red-50"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props} 
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, color = 'gray' }: { children: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    gray: 'bg-stone-100 text-stone-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};