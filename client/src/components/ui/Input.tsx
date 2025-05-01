import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  startIcon,
  endIcon,
  fullWidth = false,
  showPasswordToggle = false,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  helperClassName = '',
  errorClassName = '',
  required,
  disabled,
  readOnly,
  id,
  name,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Determine the effective input type
  const effectiveType = type === 'password' && showPassword ? 'text' : type;
  
  // Build classes
  const containerClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${containerClassName}
  `;
  
  const labelClasses = `
    block text-sm font-medium text-gray-700 mb-1
    ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
    ${labelClassName}
  `;
  
  const wrapperClasses = `
    relative rounded-md shadow-sm
    ${hasError ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500' : 'focus-within:ring-primary-500 focus-within:border-primary-500'}
  `;
  
  const inputClasses = `
    block w-full px-3 py-2 rounded-md border border-gray-300
    ${hasError ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500'}
    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
    ${readOnly ? 'bg-gray-50 cursor-default' : ''}
    ${startIcon ? 'pl-10' : ''}
    ${endIcon || (type === 'password' && showPasswordToggle) ? 'pr-10' : ''}
    transition-all duration-200
    ${inputClassName}
    ${className}
  `;
  
  const helperClasses = `
    mt-1 text-sm text-gray-500
    ${helperClassName}
  `;
  
  const errorClasses = `
    mt-1 text-sm text-red-600
    ${errorClassName}
  `;
  
  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className={wrapperClasses}>
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{startIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={effectiveType}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={inputClasses}
          {...props}
        />
        
        {(endIcon || (type === 'password' && showPasswordToggle)) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {type === 'password' && showPasswordToggle ? (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : (
              <span className="text-gray-500 sm:text-sm">{endIcon}</span>
            )}
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className={helperClasses}>
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={`${inputId}-error`} className={errorClasses} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 