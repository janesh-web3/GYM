import { toast, ToastOptions } from 'react-toastify';

// Default configuration for toasts
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Success toast
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-success',
  });
};

// Error toast
export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-error',
  });
};

// Info toast
export const showInfo = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-info',
  });
};

// Warning toast
export const showWarning = (message: string, options?: ToastOptions) => {
  return toast.warn(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-warning',
  });
};

// Loading toast that can be updated
export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-loading',
  });
};

// Update a toast (useful for changing loading to success/error)
export const updateToast = (
  toastId: string | number,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning',
  options?: ToastOptions
) => {
  const updateOptions = {
    ...defaultOptions,
    ...options,
    render: message,
  };

  switch (type) {
    case 'success':
      toast.update(toastId, {
        ...updateOptions,
        type: 'success',
        isLoading: false,
        className: 'toast-success',
      });
      break;
    case 'error':
      toast.update(toastId, {
        ...updateOptions,
        type: 'error',
        isLoading: false,
        className: 'toast-error',
      });
      break;
    case 'info':
      toast.update(toastId, {
        ...updateOptions,
        type: 'info',
        isLoading: false,
        className: 'toast-info',
      });
      break;
    case 'warning':
      toast.update(toastId, {
        ...updateOptions,
        type: 'warning',
        isLoading: false,
        className: 'toast-warning',
      });
      break;
    default:
      break;
  }
}; 