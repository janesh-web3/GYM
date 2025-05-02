import { useState, useEffect } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'destructive';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

interface ToastState extends ToastProps {
  id: number;
  isVisible: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Generate a new toast
  const toast = ({
    title = '',
    description = '',
    variant = 'default',
    duration = 5000,
  }: ToastProps) => {
    const id = Math.random();
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, variant, duration, isVisible: true },
    ]);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  };

  // Dismiss a toast
  const dismissToast = (id: number) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, isVisible: false } : toast
      )
    );

    // Remove it from DOM after animation (300ms)
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 300);
  };

  return {
    toast,
    dismissToast,
    toasts,
  };
} 