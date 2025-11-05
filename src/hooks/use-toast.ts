
import { toast as sonnerToast } from "sonner";

// For compatibility with existing code that uses the shadcn toast API
export const toast = {
  // Map shadcn toast methods to sonner methods
  ...sonnerToast,
  success: (message: string, options = {}) => sonnerToast.success(message, { 
    closeButton: true,
    duration: 2000,
    ...options 
  }),
  error: (message: string, options = {}) => sonnerToast.error(message, { 
    closeButton: true,
    duration: 2000,
    ...options 
  }),
  warning: (message: string, options = {}) => sonnerToast.warning(message, { 
    closeButton: true,
    duration: 2000,
    ...options 
  }),
  info: (message: string, options = {}) => sonnerToast.info(message, { 
    closeButton: true,
    duration: 2000,
    ...options 
  }),
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
};

// For compatibility with existing code that uses useToast hook
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: [],
  };
}
