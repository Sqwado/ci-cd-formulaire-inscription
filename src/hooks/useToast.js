import { useCallback, useEffect, useState } from 'react';

export const TOAST_DURATION = 3000;

export function useToast(duration = TOAST_DURATION) {
  const [toast, setToast] = useState({ message: '', type: 'error' });

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: '', type: 'error' });
  }, []);

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      clearToast();
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [toast.message, duration, clearToast]);

  return {
    toastMessage: toast.message,
    toastType: toast.type,
    showToast,
    clearToast
  };
}
