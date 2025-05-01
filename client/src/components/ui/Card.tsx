import React, { forwardRef } from 'react';

// Type definitions
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
  hoverable?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// Shadow variants
const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-md',
  xl: 'shadow-lg',
};

// Card Component
const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  bordered = true,
  hoverable = false,
  shadow = 'md',
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`
        bg-white rounded-xl overflow-hidden
        ${bordered ? 'border border-gray-200' : ''}
        ${hoverable ? 'hover:shadow-lg transition-shadow duration-300' : ''}
        ${shadowStyles[shadow]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

// Card Header Component
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  children,
  className = '',
  title,
  subtitle,
  action,
  ...props
}, ref) => {
  // If children are provided, render them directly
  if (children) {
    return (
      <div 
        ref={ref}
        className={`px-6 py-4 border-b border-gray-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  // Otherwise, use the title/subtitle/action pattern
  return (
    <div 
      ref={ref}
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      <div className="flex justify-between items-start">
        <div>
          {title && (typeof title === 'string' 
            ? <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            : title
          )}
          {subtitle && (typeof subtitle === 'string'
            ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            : subtitle
          )}
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
});

// Card Body Component
const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(({
  children,
  className = '',
  padded = true,
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`${padded ? 'px-6 py-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

// Card Footer Component
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

// Set display names
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };